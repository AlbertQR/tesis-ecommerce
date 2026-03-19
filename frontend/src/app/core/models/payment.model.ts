export interface PaymentSettings {
  enzona_consumer_key: string;
  enzona_consumer_secret: string;
  enzona_merchant_uuid: string;
  refund_percentage: string;
  refund_enabled: string;
  enzona_configured?: string;
}

export interface PaymentResponse {
  transactionUuid: string;
  confirmUrl: string;
  completeUrl: string;
  cancelUrl: string;
}
