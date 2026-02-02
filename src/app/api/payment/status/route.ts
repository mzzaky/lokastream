import { NextRequest, NextResponse } from 'next/server';
import { getTransactionStatus, parsePaymentResult } from '@/lib/midtrans';
import { supabase } from '@/lib/supabase';

// GET /api/payment/status?order_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'order_id is required' },
        { status: 400 }
      );
    }

    // First, check our database
    const { data: queueEntry, error: dbError } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('payment_id', orderId)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Database error:', dbError);
    }

    // If we already have a completed payment in our DB, return it
    if (queueEntry && queueEntry.payment_status === 'completed') {
      return NextResponse.json({
        success: true,
        data: {
          order_id: orderId,
          payment_status: 'completed',
          transaction_status: 'settlement',
          queue_entry: {
            id: queueEntry.id,
            queue_position: queueEntry.queue_position,
            player_name: queueEntry.player_name,
            status: queueEntry.status,
          }
        }
      });
    }

    // Check with Midtrans for real-time status
    let midtransStatus;
    try {
      midtransStatus = await getTransactionStatus(orderId);
    } catch (midtransError) {
      console.error('Midtrans status check error:', midtransError);

      // If Midtrans check fails, return DB status
      if (queueEntry) {
        return NextResponse.json({
          success: true,
          data: {
            order_id: orderId,
            payment_status: queueEntry.payment_status,
            transaction_status: queueEntry.payment_status === 'completed' ? 'settlement' : 'pending',
            queue_entry: {
              id: queueEntry.id,
              queue_position: queueEntry.queue_position,
              player_name: queueEntry.player_name,
              status: queueEntry.status,
            }
          }
        });
      }

      // For development without Midtrans keys
      if (process.env.NODE_ENV === 'development' || !process.env.MIDTRANS_SERVER_KEY) {
        return NextResponse.json({
          success: true,
          data: {
            order_id: orderId,
            payment_status: 'pending',
            transaction_status: 'pending',
            message: 'Development mode - payment status simulated'
          }
        });
      }

      throw midtransError;
    }

    // Map Midtrans status to our payment status
    let paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 'pending';

    switch (midtransStatus.transaction_status) {
      case 'capture':
      case 'settlement':
        paymentStatus = 'completed';
        break;
      case 'pending':
        paymentStatus = 'pending';
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
        paymentStatus = 'failed';
        break;
      case 'refund':
      case 'partial_refund':
        paymentStatus = 'refunded';
        break;
    }

    // Update our database if status changed
    if (queueEntry && queueEntry.payment_status !== paymentStatus) {
      await supabase
        .from('queue_entries')
        .update({
          payment_status: paymentStatus,
          status: paymentStatus === 'completed' ? 'waiting' : (paymentStatus === 'failed' ? 'cancelled' : queueEntry.status),
          updated_at: new Date().toISOString(),
        })
        .eq('payment_id', orderId);
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        payment_status: paymentStatus,
        transaction_status: midtransStatus.transaction_status,
        payment_type: midtransStatus.payment_type,
        expiry_time: midtransStatus.expiry_time,
        queue_entry: queueEntry ? {
          id: queueEntry.id,
          queue_position: queueEntry.queue_position,
          player_name: queueEntry.player_name,
          status: queueEntry.status,
        } : null
      }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check payment status'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual status update (admin use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, new_status } = body;

    if (!order_id || !new_status) {
      return NextResponse.json(
        { success: false, error: 'order_id and new_status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(new_status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update database
    const { data, error } = await supabase
      .from('queue_entries')
      .update({
        payment_status: new_status,
        status: new_status === 'completed' ? 'waiting' : (new_status === 'failed' ? 'cancelled' : 'waiting'),
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', order_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id,
        payment_status: new_status,
        queue_entry: data
      }
    });

  } catch (error) {
    console.error('Manual status update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment status'
      },
      { status: 500 }
    );
  }
}
