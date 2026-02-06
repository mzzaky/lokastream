import { NextRequest, NextResponse } from 'next/server';
import { verifyNotificationSignature, MidtransNotification } from '@/lib/midtrans';
import { supabase } from '@/lib/supabase';

// Midtrans will send POST notifications to this endpoint
export async function POST(request: NextRequest) {
  try {
    const notification: MidtransNotification = await request.json();

    console.log('Midtrans webhook received:', {
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      payment_type: notification.payment_type,
    });

    // Verify signature (skip in development if no server key)
    if (process.env.MIDTRANS_SERVER_KEY) {
      const isValidSignature = verifyNotificationSignature(notification);
      if (!isValidSignature) {
        console.error('Invalid Midtrans signature');
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 403 }
        );
      }
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
    } = notification;

    // Map Midtrans status to our payment status
    let paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 'pending';
    let queueStatus: 'waiting' | 'cancelled' = 'waiting';

    // Handle different transaction statuses
    // Reference: https://docs.midtrans.com/docs/transaction-status-cycle
    switch (transaction_status) {
      case 'capture':
        // For credit card - check fraud status
        paymentStatus = fraud_status === 'accept' ? 'completed' : 'pending';
        break;

      case 'settlement':
        // Payment is settled/confirmed
        paymentStatus = 'completed';
        break;

      case 'pending':
        // Waiting for payment
        paymentStatus = 'pending';
        break;

      case 'deny':
        // Payment denied by bank or fraud detection
        paymentStatus = 'failed';
        queueStatus = 'cancelled';
        break;

      case 'cancel':
        // Cancelled by merchant or customer
        paymentStatus = 'failed';
        queueStatus = 'cancelled';
        break;

      case 'expire':
        // Transaction expired
        paymentStatus = 'failed';
        queueStatus = 'cancelled';
        break;

      case 'refund':
      case 'partial_refund':
        // Refunded
        paymentStatus = 'refunded';
        queueStatus = 'cancelled';
        break;

      default:
        console.log('Unknown transaction status:', transaction_status);
    }

    // Update queue entry in database
    const { data: updatedEntry, error: updateError } = await supabase
      .from('queue_entries')
      .update({
        payment_status: paymentStatus,
        status: paymentStatus === 'completed' ? 'waiting' : queueStatus,
        updated_at: new Date().toISOString(),
        custom_data: supabase.rpc('jsonb_set', {
          target: 'custom_data',
          path: '{midtrans_status}',
          value: JSON.stringify({
            transaction_status,
            fraud_status,
            payment_type,
            updated_at: new Date().toISOString(),
          })
        })
      })
      .eq('payment_id', order_id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update queue entry:', updateError);
      // Try alternative update without jsonb_set
      await supabase
        .from('queue_entries')
        .update({
          payment_status: paymentStatus,
          status: paymentStatus === 'completed' ? 'waiting' : queueStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('payment_id', order_id);
    }

    // If payment is completed, create donation record and upsert donor customer
    if (paymentStatus === 'completed' && updatedEntry) {
      console.log('Payment completed for queue entry:', updatedEntry.id);

      // 1. Create donation record
      await supabase.from('donations').insert({
        streamer_id: updatedEntry.streamer_id,
        donor_name: updatedEntry.player_name,
        amount: parseInt(notification.gross_amount),
        currency: 'IDR',
        donation_type: 'mabar',
        related_queue_entry_id: updatedEntry.id,
        payment_status: 'completed',
        payment_id: order_id,
        payment_method: payment_type,
      });

      // 2. Upsert donor customer record
      const now = new Date().toISOString();

      // Check if customer already exists
      const { data: existingCustomer } = await supabase
        .from('donor_customers')
        .select('*')
        .eq('streamer_id', updatedEntry.streamer_id)
        .eq('game_id', updatedEntry.game_id)
        .single();

      const donationAmount = parseInt(notification.gross_amount) || updatedEntry.amount_paid;

      if (existingCustomer) {
        // Update existing customer
        const newTotalDonations = existingCustomer.total_donations + 1;
        const newTotalAmount = existingCustomer.total_amount_spent + donationAmount;

        // Calculate tier based on total amount spent
        let tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze';
        if (newTotalAmount >= 2000000) tier = 'diamond';
        else if (newTotalAmount >= 1000000) tier = 'platinum';
        else if (newTotalAmount >= 500000) tier = 'gold';
        else if (newTotalAmount >= 200000) tier = 'silver';

        await supabase
          .from('donor_customers')
          .update({
            player_name: updatedEntry.player_name,
            game_nickname: updatedEntry.game_nickname,
            email: updatedEntry.email || existingCustomer.email,
            phone: updatedEntry.phone || existingCustomer.phone,
            total_donations: newTotalDonations,
            total_amount_spent: newTotalAmount,
            favorite_role: updatedEntry.selected_role,
            customer_tier: tier,
            last_donation_at: now,
          })
          .eq('id', existingCustomer.id);
      } else {
        // Create new customer
        let tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze';
        if (donationAmount >= 2000000) tier = 'diamond';
        else if (donationAmount >= 1000000) tier = 'platinum';
        else if (donationAmount >= 500000) tier = 'gold';
        else if (donationAmount >= 200000) tier = 'silver';

        await supabase.from('donor_customers').insert({
          streamer_id: updatedEntry.streamer_id,
          player_name: updatedEntry.player_name,
          game_id: updatedEntry.game_id,
          game_nickname: updatedEntry.game_nickname,
          email: updatedEntry.email,
          phone: updatedEntry.phone,
          user_id: updatedEntry.user_id,
          total_donations: 1,
          total_amount_spent: donationAmount,
          favorite_role: updatedEntry.selected_role,
          customer_tier: tier,
          first_donation_at: now,
          last_donation_at: now,
        });
      }
    }

    // Midtrans expects a 200 OK response
    return NextResponse.json({
      success: true,
      message: 'Notification processed',
      order_id,
      payment_status: paymentStatus,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Midtrans from retrying
    // But log the error for debugging
    return NextResponse.json({
      success: false,
      error: 'Internal processing error',
    });
  }
}

// Handle GET requests (for testing/verification)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Midtrans webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
