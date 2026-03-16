import base64 from 'base-64';
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export interface EnZonaProduct {
  name: string;
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

export interface EnZonaPaymentRequest {
  orderId: string;
  total: number;
  shipping: number;
  items: EnZonaProduct[];
  returnUrl: string;
  cancelUrl: string;
}

export interface EnZonaPaymentResponse {
  transactionUuid: string;
  confirmUrl: string;
  completeUrl: string;
  cancelUrl: string;
}

export interface EnZonaRefundRequest {
  transactionUuid: string;
  amount?: number;
  description?: string;
}

export class EnZonaService {
  private consumerKey: string;
  private consumerSecret: string;
  private merchantUuid: string;
  private token: string | null = null;

  constructor(consumerKey: string, consumerSecret: string, merchantUuid: string) {
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.merchantUuid = merchantUuid;
  }

  private async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    const credentials = base64.encode(`${this.consumerKey}:${this.consumerSecret}`);
    
    const response = await axios.post(
      'https://api.enzona.net/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'enzona_business_payment'
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent
      }
    );

    this.token = response.data.access_token;
    return this.token!;
  }

  private formatAmount(amount: number): string {
    const str = amount.toFixed(2);
    return str.endsWith('.00') ? str.slice(0, -3) : str;
  }

  async createPayment(request: EnZonaPaymentRequest): Promise<EnZonaPaymentResponse> {
    const token = await this.getToken();

    const totalTax = request.items.reduce((sum, item) => sum + (item.tax * item.quantity), 0);

    const products = request.items.map(item => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: this.formatAmount(item.price),
      tax: this.formatAmount(item.tax)
    }));

    const totalAmount = request.total;

    const paymentData = {
      merchant_uuid: this.merchantUuid,
      description: `Pedido #${request.orderId}`,
      currency: 'CUP',
      amount: {
        total: this.formatAmount(totalAmount),
        details: {
          shipping: this.formatAmount(request.shipping),
          tax: this.formatAmount(totalTax),
          discount: '0',
          tip: '0'
        }
      },
      items: products,
      merchant_op_id: request.orderId,
      invoice_number: request.orderId,
      return_url: request.returnUrl,
      cancel_url: request.cancelUrl,
      terminal_id: 'DONA_YOLI_001',
      buyer_identity_code: ''
    };

    const response = await axios.post(
      'https://api.enzona.net/payment/v1.0.0/payments',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    const links = response.data.links;
    return {
      transactionUuid: response.data.transaction_uuid,
      confirmUrl: links.find((l: { rel: string }) => l.rel === 'confirm')?.href || '',
      completeUrl: links.find((l: { rel: string }) => l.rel === 'complete')?.href || '',
      cancelUrl: links.find((l: { rel: string }) => l.rel === 'cancel')?.href || ''
    };
  }

  async completePayment(transactionUuid: string): Promise<{ success: boolean; status: string }> {
    const token = await this.getToken();

    const response = await axios.post(
      `https://api.enzona.net/payment/v1.0.0/payments/${transactionUuid}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    return {
      success: response.data.status_denom === 'PAID',
      status: response.data.status_denom
    };
  }

  async cancelPayment(transactionUuid: string): Promise<{ success: boolean }> {
    const token = await this.getToken();

    await axios.post(
      `https://api.enzona.net/payment/v1.0.0/payments/${transactionUuid}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    return { success: true };
  }

  async refundPayment(request: EnZonaRefundRequest): Promise<{ success: boolean; transactionUuid: string }> {
    const token = await this.getToken();

    const payload: Record<string, unknown> = {};
    
    if (request.amount !== undefined) {
      payload.amount = {
        total: this.formatAmount(request.amount)
      };
    }
    
    if (request.description) {
      payload.description = request.description;
    }

    const response = await axios.post(
      `https://api.enzona.net/payment/v1.0.0/payments/${request.transactionUuid}/refund`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    return {
      success: true,
      transactionUuid: response.data.transaction_uuid
    };
  }

  async getPaymentStatus(transactionUuid: string): Promise<{ status: string; total: string }> {
    const token = await this.getToken();

    const response = await axios.get(
      `https://api.enzona.net/payment/v1.0.0/payments/${transactionUuid}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        httpsAgent
      }
    );

    return {
      status: response.data.status_denom,
      total: response.data.amount.total
    };
  }
}
