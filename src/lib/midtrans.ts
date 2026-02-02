// Midtrans Payment Gateway Integration
// Documentation: https://docs.midtrans.com/

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// API Base URLs
const SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
const PRODUCTION_BASE_URL = 'https://api.midtrans.com';
const BASE_URL = IS_PRODUCTION ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;

// Types
export interface MidtransTransactionRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  item_details?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  payment_type?: string;
  qris?: {
    acquirer?: string;
  };
  gopay?: {
    enable_callback?: boolean;
    callback_url?: string;
  };
  shopeepay?: {
    callback_url?: string;
  };
  bank_transfer?: {
    bank: string;
    va_number?: string;
  };
  echannel?: {
    bill_info1?: string;
    bill_info2?: string;
  };
  custom_expiry?: {
    order_time?: string;
    expiry_duration?: number;
    unit?: 'second' | 'minute' | 'hour' | 'day';
  };
  callbacks?: {
    finish?: string;
  };
}

export interface MidtransTransactionResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  currency: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  // QRIS specific
  qr_string?: string;
  acquirer?: string;
  // E-wallet specific
  actions?: Array<{
    name: string;
    method: string;
    url: string;
  }>;
  // VA specific
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  permata_va_number?: string;
  bill_key?: string;
  biller_code?: string;
  // Expiry
  expiry_time?: string;
}

export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time?: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
}

// Helper to generate Basic Auth header
const getAuthHeader = () => {
  const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
  return `Basic ${auth}`;
};

// Generate unique order ID
export const generateOrderId = (prefix: string = 'MABAR'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Create QRIS Transaction
export const createQrisTransaction = async (
  orderId: string,
  amount: number,
  customerDetails?: MidtransTransactionRequest['customer_details']
): Promise<MidtransTransactionResponse> => {
  const payload: MidtransTransactionRequest = {
    payment_type: 'qris',
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    qris: {
      acquirer: 'gopay',
    },
    customer_details: customerDetails,
    custom_expiry: {
      expiry_duration: 15,
      unit: 'minute',
    },
  };

  return await createTransaction(payload);
};

// Create GoPay Transaction
export const createGopayTransaction = async (
  orderId: string,
  amount: number,
  callbackUrl: string,
  customerDetails?: MidtransTransactionRequest['customer_details']
): Promise<MidtransTransactionResponse> => {
  const payload: MidtransTransactionRequest = {
    payment_type: 'gopay',
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    gopay: {
      enable_callback: true,
      callback_url: callbackUrl,
    },
    customer_details: customerDetails,
    custom_expiry: {
      expiry_duration: 15,
      unit: 'minute',
    },
  };

  return await createTransaction(payload);
};

// Create ShopeePay Transaction
export const createShopeepayTransaction = async (
  orderId: string,
  amount: number,
  callbackUrl: string,
  customerDetails?: MidtransTransactionRequest['customer_details']
): Promise<MidtransTransactionResponse> => {
  const payload: MidtransTransactionRequest = {
    payment_type: 'shopeepay',
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    shopeepay: {
      callback_url: callbackUrl,
    },
    customer_details: customerDetails,
    custom_expiry: {
      expiry_duration: 15,
      unit: 'minute',
    },
  };

  return await createTransaction(payload);
};

// Create Bank Transfer (VA) Transaction
export const createBankTransferTransaction = async (
  orderId: string,
  amount: number,
  bank: 'bca' | 'bni' | 'bri' | 'mandiri' | 'permata' | 'cimb',
  customerDetails?: MidtransTransactionRequest['customer_details']
): Promise<MidtransTransactionResponse> => {
  let payload: MidtransTransactionRequest;

  if (bank === 'mandiri') {
    // Mandiri uses echannel
    payload = {
      payment_type: 'echannel',
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      echannel: {
        bill_info1: 'Payment for',
        bill_info2: 'Mabar Queue',
      },
      customer_details: customerDetails,
      custom_expiry: {
        expiry_duration: 24,
        unit: 'hour',
      },
    };
  } else if (bank === 'permata') {
    // Permata uses permata_va
    payload = {
      payment_type: 'permata',
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: customerDetails,
      custom_expiry: {
        expiry_duration: 24,
        unit: 'hour',
      },
    };
  } else {
    // BCA, BNI, BRI, CIMB use bank_transfer
    payload = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      bank_transfer: {
        bank: bank,
      },
      customer_details: customerDetails,
      custom_expiry: {
        expiry_duration: 24,
        unit: 'hour',
      },
    };
  }

  return await createTransaction(payload);
};

// Generic Create Transaction function
export const createTransaction = async (
  payload: MidtransTransactionRequest
): Promise<MidtransTransactionResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/v2/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status_message || 'Failed to create transaction');
    }

    return await response.json();
  } catch (error) {
    console.error('Midtrans create transaction error:', error);
    throw error;
  }
};

// Get Transaction Status
export const getTransactionStatus = async (orderId: string): Promise<MidtransTransactionResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/v2/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status_message || 'Failed to get transaction status');
    }

    return await response.json();
  } catch (error) {
    console.error('Midtrans get status error:', error);
    throw error;
  }
};

// Cancel Transaction
export const cancelTransaction = async (orderId: string): Promise<MidtransTransactionResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/v2/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status_message || 'Failed to cancel transaction');
    }

    return await response.json();
  } catch (error) {
    console.error('Midtrans cancel transaction error:', error);
    throw error;
  }
};

// Verify Notification Signature
export const verifyNotificationSignature = (
  notification: MidtransNotification
): boolean => {
  const crypto = require('crypto');
  const { order_id, status_code, gross_amount, signature_key } = notification;

  const hash = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex');

  return hash === signature_key;
};

// Parse payment result from Midtrans response
export const parsePaymentResult = (response: MidtransTransactionResponse) => {
  const result: {
    payment_url?: string;
    va_number?: string;
    qr_code_url?: string;
    order_id: string;
    expiry_time?: string;
  } = {
    order_id: response.order_id,
    expiry_time: response.expiry_time,
  };

  // QRIS - Generate QR Code URL from qr_string
  if (response.qr_string) {
    // Using QR Server API to generate QR code image
    result.qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(response.qr_string)}`;
  }

  // E-wallet deeplink
  if (response.actions && response.actions.length > 0) {
    const deeplink = response.actions.find(a =>
      a.name === 'deeplink-redirect' || a.name === 'generate-qr-code'
    );
    if (deeplink) {
      result.payment_url = deeplink.url;
    }

    // Also check for QR code in actions
    const qrAction = response.actions.find(a => a.name === 'generate-qr-code');
    if (qrAction && !result.qr_code_url) {
      result.qr_code_url = qrAction.url;
    }
  }

  // Virtual Account
  if (response.va_numbers && response.va_numbers.length > 0) {
    result.va_number = response.va_numbers[0].va_number;
  }

  // Permata VA
  if (response.permata_va_number) {
    result.va_number = response.permata_va_number;
  }

  // Mandiri Bill Payment
  if (response.bill_key && response.biller_code) {
    result.va_number = `${response.biller_code}${response.bill_key}`;
  }

  return result;
};

// Map payment method to Midtrans payment type
export const mapPaymentMethod = (
  method: string
): { type: string; bank?: string } => {
  const mapping: Record<string, { type: string; bank?: string }> = {
    qris: { type: 'qris' },
    gopay: { type: 'gopay' },
    shopeepay: { type: 'shopeepay' },
    dana: { type: 'qris' }, // DANA uses QRIS
    ovo: { type: 'qris' }, // OVO uses QRIS
    bca_va: { type: 'bank_transfer', bank: 'bca' },
    bni_va: { type: 'bank_transfer', bank: 'bni' },
    bri_va: { type: 'bank_transfer', bank: 'bri' },
    mandiri_va: { type: 'echannel', bank: 'mandiri' },
    permata_va: { type: 'permata', bank: 'permata' },
    cimb_va: { type: 'bank_transfer', bank: 'cimb' },
  };

  return mapping[method] || { type: 'qris' };
};

// Export configuration for client-side
export const getMidtransClientConfig = () => ({
  clientKey: MIDTRANS_CLIENT_KEY,
  isProduction: IS_PRODUCTION,
});
