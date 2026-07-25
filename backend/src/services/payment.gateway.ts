// src/services/payment.gateway.ts
// Provider-agnostic PaymentGateway interface definition and registration map.

export interface PaymentGatewayInitializeParams {
  amount: number;
  currency: string;
  txRef: string;
  customer: {
    email: string;
    phone?: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
  };
  redirectUrl: string;
}

export interface PaymentGatewayVerificationResult {
  success: boolean;
  message?: string;
  data?: {
    transactionId: string;
    amount: number;
    currency: string;
    provider: string;
    reference: string;
    paymentChannel: string;
    customerEmail: string;
    customerPhone?: string;
    verifiedAt: Date;
    fees: number;
    payload: any;
  };
}

export interface PaymentGateway {
  initializePayment(params: PaymentGatewayInitializeParams): Promise<{ success: boolean; checkoutUrl?: string; message?: string }>;
  verifyPayment(transactionId: string): Promise<PaymentGatewayVerificationResult>;
}

// Payment Gateway Registry mapping active providers (e.g. dpo, flutterwave)
export const PAYMENT_GATEWAY_REGISTRY: Record<string, PaymentGateway> = {};

export function registerPaymentGateway(name: string, gateway: PaymentGateway) {
  PAYMENT_GATEWAY_REGISTRY[name.toLowerCase()] = gateway;
}

export function getPaymentGateway(name?: string): PaymentGateway {
  const activeName = (name || process.env.PAYMENT_PROVIDER || 'dpo').toLowerCase();
  const gateway = PAYMENT_GATEWAY_REGISTRY[activeName];
  if (!gateway) {
    throw new Error(`[Payment Gateway Registry] Resolved gateway "${activeName}" is not registered.`);
  }
  return gateway;
}
