export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  env: 'sandbox' | 'live';
}

export interface PayPalOrderRequest {
  bundleId: string;
  credits: number;
  amount: number;
}

export interface PayPalOrderResponse {
  orderId: string;
  approveUrl: string;
}

const PAYPAL_API_BASE = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
};

export async function createPayPalOrder(
  request: PayPalOrderRequest,
  config: PayPalConfig
): Promise<PayPalOrderResponse> {
  const accessToken = await getPayPalAccessToken(config);

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: (request.amount / 100).toFixed(2),
        },
        description: `${request.credits} credits - ${request.bundleId}`,
        custom_id: request.bundleId,
      },
    ],
    application_context: {
      return_url: `${window.location.origin}/payment/success`,
      cancel_url: `${window.location.origin}/payment/cancel`,
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE[config.env]}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    throw new Error(`PayPal API error: ${response.statusText}`);
  }

  const data = await response.json();

  const approveLink = data.links.find((link: any) => link.rel === 'approve');

  return {
    orderId: data.id,
    approveUrl: approveLink?.href || '',
  };
}

async function getPayPalAccessToken(config: PayPalConfig): Promise<string> {
  const auth = btoa(`${config.clientId}:${config.clientSecret}`);

  const response = await fetch(`${PAYPAL_API_BASE[config.env]}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function capturePayPalOrder(
  orderId: string,
  config: PayPalConfig
): Promise<any> {
  const accessToken = await getPayPalAccessToken(config);

  const response = await fetch(
    `${PAYPAL_API_BASE[config.env]}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to capture PayPal order');
  }

  return await response.json();
}

export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string,
  config: PayPalConfig
): Promise<boolean> {
  const accessToken = await getPayPalAccessToken(config);

  const verificationPayload = {
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: config.clientId,
    webhook_event: JSON.parse(body),
  };

  const response = await fetch(
    `${PAYPAL_API_BASE[config.env]}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verificationPayload),
    }
  );

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.verification_status === 'SUCCESS';
}
