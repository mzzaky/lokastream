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

    // If payment is completed, we can trigger notifications
    if (paymentStatus === 'completed' && updatedEntry) {
      // Here you could:
      // 1. Send email confirmation
      // 2. Send Discord/Telegram notification to streamer
      // 3. Trigger real-time update to OBS overlay
      // 4. Update any analytics

      console.log('Payment completed for queue entry:', updatedEntry.id);

      // Example: You could create a donation record for tracking revenue
      // await supabase.from('donations').insert({
      //   streamer_id: updatedEntry.streamer_id,
      //   donor_name: updatedEntry.player_name,
      //   amount: parseInt(notification.gross_amount),
      //   currency: 'IDR',
      //   donation_type: 'mabar',
      //   related_queue_entry_id: updatedEntry.id,
      //   payment_status: 'completed',
      //   payment_id: order_id,
      //   payment_method: payment_type,
      // });
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
