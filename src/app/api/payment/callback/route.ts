import { NextRequest, NextResponse } from 'next/server';

// E-wallet callback handler (redirect after payment)
// This endpoint is called when user completes payment on e-wallet app
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get callback parameters
  const orderId = searchParams.get('order_id');
  const transactionStatus = searchParams.get('transaction_status');

  // Determine redirect URL based on status
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // For now, redirect to a generic success/pending page
  // In production, you might want to redirect to a specific order status page
  if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
    // Payment successful
    return NextResponse.redirect(
      new URL(`/payment/success?order_id=${orderId}`, baseUrl)
    );
  } else if (transactionStatus === 'pending') {
    // Payment pending
    return NextResponse.redirect(
      new URL(`/payment/pending?order_id=${orderId}`, baseUrl)
    );
  } else {
    // Payment failed or cancelled
    return NextResponse.redirect(
      new URL(`/payment/failed?order_id=${orderId}`, baseUrl)
    );
  }
}

// POST callback (Midtrans might also send POST)
export async function POST(request: NextRequest) {
  // For POST requests, handle similar to webhook
  // but this is typically for redirect flows
  const body = await request.json();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const orderId = body.order_id;
  const transactionStatus = body.transaction_status;

  if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
    return NextResponse.redirect(
      new URL(`/payment/success?order_id=${orderId}`, baseUrl)
    );
  } else {
    return NextResponse.redirect(
      new URL(`/payment/pending?order_id=${orderId}`, baseUrl)
    );
  }
}
