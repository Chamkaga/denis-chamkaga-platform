import { PaymentGateway, PaymentGatewayInitializeParams, PaymentGatewayVerificationResult, registerPaymentGateway } from './payment.gateway';
import { flwClient } from './flutterwave.client';

export class FlutterwaveGateway implements PaymentGateway {
  async initializePayment(params: PaymentGatewayInitializeParams): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    const res = await flwClient.initializeCheckout({
      amount: params.amount,
      currency: params.currency,
      txRef: params.txRef,
      customer: params.customer,
      customizations: params.customizations,
      redirectUrl: params.redirectUrl
    });

    return {
      success: res.success,
      checkoutUrl: res.link,
      message: res.message
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentGatewayVerificationResult> {
    const res = await flwClient.verifyTransaction(transactionId);
    if (!res.success || !res.data) {
      return {
        success: false,
        message: res.message || 'Verification failed.'
      };
    }

    const raw = res.data;
    
    // Safety checks for parsed parameters
    const verifiedAt = raw.created_at ? new Date(raw.created_at) : new Date();
    const fees = raw.app_fee !== undefined ? parseFloat(raw.app_fee) : 0.00;
    
    return {
      success: true,
      data: {
        transactionId: raw.id.toString(),
        amount: parseFloat(raw.amount),
        currency: raw.currency,
        provider: 'flutterwave',
        reference: raw.tx_ref,
        paymentChannel: raw.payment_type || 'unknown',
        customerEmail: raw.customer?.email || '',
        customerPhone: raw.customer?.phone_number || undefined,
        verifiedAt,
        fees,
        payload: raw
      }
    };
  }
}

export const flutterwaveGateway = new FlutterwaveGateway();
registerPaymentGateway('flutterwave', flutterwaveGateway);
export default flutterwaveGateway;

