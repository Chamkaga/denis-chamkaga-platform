// src/services/gateway.adapter.ts
// Extensible Payment Gateway interface & implementation for credit cards, banks, and mobile wallets.

export interface GatewayProcessResult {
  success: boolean;
  transactionId: string;
  payload: any;
  message: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  method: string; // mpesa, airtel_money, tigopesa, halopesa, stripe, paypal, bank_transfer, cash
  phoneNumber?: string; // For mobile money
  cardNumber?: string;  // Mock credit card values
  email?: string;       // Stripe/PayPal email
  reference?: string;   // Reference ID (e.g. Bank Ref, M-Pesa Ref)
}

export interface PaymentGateway {
  process(details: PaymentDetails): Promise<GatewayProcessResult>;
}

class MpesaGateway implements PaymentGateway {
  async process(details: PaymentDetails): Promise<GatewayProcessResult> {
    const transactionId = 'MPX' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      success: true,
      transactionId,
      message: `M-Pesa push sent successfully to ${details.phoneNumber || 'client'}. Transaction completed.`,
      payload: {
        provider: 'mpesa',
        status: 'SUCCESS',
        amount: details.amount,
        currency: details.currency,
        phone: details.phoneNumber,
        timestamp: new Date().toISOString(),
        gateway_ref: transactionId,
      },
    };
  }
}

class AirtelMoneyGateway implements PaymentGateway {
  async process(details: PaymentDetails): Promise<GatewayProcessResult> {
    const transactionId = 'AMX' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      success: true,
      transactionId,
      message: `Airtel Money payment processed for ${details.phoneNumber || 'client'}.`,
      payload: {
        provider: 'airtel_money',
        status: 'COMPLETED',
        amount: details.amount,
        currency: details.currency,
        phone: details.phoneNumber,
        timestamp: new Date().toISOString(),
        gateway_ref: transactionId,
      },
    };
  }
}

class StripeGateway implements PaymentGateway {
  async process(details: PaymentDetails): Promise<GatewayProcessResult> {
    const transactionId = 'ch_' + Math.random().toString(36).substring(2, 15);
    return {
      success: true,
      transactionId,
      message: `Stripe charge succeeded for ${details.email || 'client'}.`,
      payload: {
        provider: 'stripe',
        charge_id: transactionId,
        amount: details.amount * 100, // Stripe works in cents
        currency: details.currency.toLowerCase(),
        paid: true,
        status: 'succeeded',
        billing_details: { email: details.email },
      },
    };
  }
}

class PayPalGateway implements PaymentGateway {
  async process(details: PaymentDetails): Promise<GatewayProcessResult> {
    const transactionId = 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      success: true,
      transactionId,
      message: `PayPal checkout completed successfully.`,
      payload: {
        provider: 'paypal',
        payment_id: transactionId,
        state: 'approved',
        payer: { payer_info: { email: details.email } },
        amount: { total: details.amount.toString(), currency: details.currency },
      },
    };
  }
}

class OfflineGateway implements PaymentGateway {
  async process(details: PaymentDetails): Promise<GatewayProcessResult> {
    const transactionId = details.reference || 'OFF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      success: true,
      transactionId,
      message: `Manual offline payment registered.`,
      payload: {
        provider: details.method, // cash or bank_transfer
        reference: details.reference,
        registered_at: new Date().toISOString(),
      },
    };
  }
}

class PaymentGatewayResolver {
  resolve(method: string): PaymentGateway {
    switch (method.toLowerCase()) {
      case 'mpesa':
        return new MpesaGateway();
      case 'airtel_money':
      case 'airtel':
        return new AirtelMoneyGateway();
      case 'stripe':
        return new StripeGateway();
      case 'paypal':
        return new PayPalGateway();
      case 'bank_transfer':
      case 'cash':
      default:
        return new OfflineGateway();
    }
  }
}

export const gatewayAdapter = new PaymentGatewayResolver();
