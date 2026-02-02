import { NextRequest, NextResponse } from 'next/server';
import {
  generateOrderId,
  createQrisTransaction,
  createGopayTransaction,
  createShopeepayTransaction,
  createBankTransferTransaction,
  parsePaymentResult,
  mapPaymentMethod
} from '@/lib/midtrans';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      streamer_id,
      mabar_settings_id,
      player_name,
      game_id,
      game_nickname,
      selected_role,
      email,
      phone,
      amount,
      payment_method,
      queue_position
    } = body;

    // Validate required fields
    if (!streamer_id || !mabar_settings_id || !player_name || !game_id || !game_nickname || !selected_role || !amount || !payment_method || !queue_position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = generateOrderId('MABAR');

    // Customer details for Midtrans
    const customerDetails = {
      first_name: player_name,
      email: email || undefined,
      phone: phone || undefined,
    };

    // Get callback URL for e-wallets
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lokastream.id';
    const callbackUrl = `${baseUrl}/api/payment/callback`;

    // Create transaction based on payment method
    let midtransResponse;
    const paymentMapping = mapPaymentMethod(payment_method);

    try {
      switch (paymentMapping.type) {
        case 'qris':
          midtransResponse = await createQrisTransaction(orderId, amount, customerDetails);
          break;

        case 'gopay':
          midtransResponse = await createGopayTransaction(orderId, amount, callbackUrl, customerDetails);
          break;

        case 'shopeepay':
          midtransResponse = await createShopeepayTransaction(orderId, amount, callbackUrl, customerDetails);
          break;

        case 'bank_transfer':
        case 'echannel':
        case 'permata':
          midtransResponse = await createBankTransferTransaction(
            orderId,
            amount,
            paymentMapping.bank as any,
            customerDetails
          );
          break;

        default:
          // Default to QRIS
          midtransResponse = await createQrisTransaction(orderId, amount, customerDetails);
      }
    } catch (midtransError) {
      console.error('Midtrans API error:', midtransError);

      // For demo/development, create a mock response
      if (process.env.NODE_ENV === 'development' || !process.env.MIDTRANS_SERVER_KEY) {
        midtransResponse = {
          status_code: '201',
          status_message: 'Success, QRIS transaction is created',
          transaction_id: `mock-${Date.now()}`,
          order_id: orderId,
          merchant_id: 'mock-merchant',
          gross_amount: amount.toString(),
          currency: 'IDR',
          payment_type: paymentMapping.type,
          transaction_time: new Date().toISOString(),
          transaction_status: 'pending',
          qr_string: 'https://example.com/qr-placeholder',
          expiry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };
      } else {
        throw midtransError;
      }
    }

    // Create queue entry in database with pending payment
    const { data: queueEntry, error: queueError } = await supabase
      .from('queue_entries')
      .insert({
        mabar_settings_id,
        streamer_id,
        player_name,
        game_id,
        game_nickname,
        selected_role,
        email: email || null,
        phone: phone || null,
        is_anonymous: true,
        payment_status: 'pending',
        payment_id: orderId,
        payment_method,
        amount_paid: amount,
        queue_position,
        status: 'waiting',
        custom_data: {
          midtrans_transaction_id: midtransResponse.transaction_id,
          midtrans_order_id: orderId,
        }
      })
      .select()
      .single();

    if (queueError) {
      console.error('Database error:', queueError);
      // Don't fail the request, the payment was already created
    }

    // Parse payment result
    const paymentResult = parsePaymentResult(midtransResponse);

    return NextResponse.json({
      success: true,
      data: {
        ...paymentResult,
        queue_entry_id: queueEntry?.id,
        transaction_status: midtransResponse.transaction_status,
      }
    });

  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment'
      },
      { status: 500 }
    );
  }
}
