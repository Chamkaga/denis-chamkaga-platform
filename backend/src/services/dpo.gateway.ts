// src/services/dpo.gateway.ts
// Direct Pay Online (DPO) Payment Gateway adapter for checkout token generation & verification.

import { PaymentGateway, PaymentGatewayInitializeParams, PaymentGatewayVerificationResult, registerPaymentGateway } from './payment.gateway';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import https from 'https';

function xmlValue(value: unknown): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// Helper to make SOAP XML POST calls bypassing SNI/SSL issues
function postXml(url: string, xml: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      method: 'POST',
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Content-Type': 'application/xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Length': Buffer.byteLength(xml)
      },
      rejectUnauthorized: true
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) return reject(new Error('DPO returned an unsuccessful HTTP response.'));
        resolve(data);
      });
    });

    req.on('error', err => reject(err));
    req.setTimeout(15000, () => req.destroy(new Error('DPO request timed out. Please check payment status before retrying.')));
    req.write(xml);
    req.end();
  });
}

// Lightweight XML tag extraction utility
function extractXmlTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'));
  return match ? match[1].trim() : '';
}

export class DPOGateway implements PaymentGateway {
  private getEndpoint(): string {
    return 'https://secure.3gdirectpay.com/API/v6/';
  }

  private getCheckoutBaseUrl(): string {
    return 'https://secure.3gdirectpay.com/payv3.php';
  }

  async initializePayment(params: PaymentGatewayInitializeParams): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    const companyToken = env.DPO_COMPANY_TOKEN;
    const serviceType = env.DPO_SERVICE_TYPE || '3854';

    if (!companyToken) {
      logger.warn(`[DPO Gateway] Checkout unavailable because credentials are not configured for ref: ${params.txRef}`);
      return {
        success: false,
        message: 'DPO checkout is not configured. Please contact support to complete payment.'
      };
    }

    try {
      const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${xmlValue(companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${params.amount.toFixed(2)}</PaymentAmount>
    <PaymentCurrency>${params.currency.toUpperCase()}</PaymentCurrency>
    <CompanyRef>${xmlValue(params.txRef)}</CompanyRef>
    <RedirectURL>${xmlValue(params.redirectUrl)}</RedirectURL>
    <BackURL>${xmlValue(params.redirectUrl)}</BackURL>
    <CompanyRefUnique>1</CompanyRefUnique>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${serviceType}</ServiceType>
      <ServiceDescription>${xmlValue(params.customizations.description)}</ServiceDescription>
      <ServiceDate>${new Date().toISOString().slice(0, 10).replace(/-/g, '/')}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

      logger.info(`[DPO Gateway] Requesting token with endpoint: ${this.getEndpoint()}`);
      
      const responseXml = await postXml(this.getEndpoint(), xmlPayload);
      const result = extractXmlTag(responseXml, 'Result');
      const explanation = extractXmlTag(responseXml, 'ResultExplanation');
      if (!result) return { success: false, message: 'DPO returned an unrecognized response. Checkout could not be confirmed.' };

      if (result === '000') {
        const transToken = extractXmlTag(responseXml, 'TransToken');
        const checkoutUrl = `${this.getCheckoutBaseUrl()}?ID=${transToken}`;
        return {
          success: true,
          checkoutUrl,
          message: 'DPO transaction token generated successfully.'
        };
      }

      return {
        success: false,
        message: `DPO checkout initialization failed: ${explanation} (Code: ${result})`
      };
    } catch (err: any) {
      logger.error('[DPO Gateway] Initialization error:', err);
      return { success: false, message: err.message || 'DPO checkout initialization failed.' };
    }
  }

  async verifyPayment(transactionToken: string): Promise<PaymentGatewayVerificationResult> {
    try {
      const companyToken = env.DPO_COMPANY_TOKEN;
      if (!companyToken) return { success: false, message: 'DPO verification is not configured.' };
      
      const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${xmlValue(companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${xmlValue(transactionToken)}</TransactionToken>
</API3G>`;

      const responseXml = await postXml(this.getEndpoint(), xmlPayload);
      const result = extractXmlTag(responseXml, 'Result');
      const explanation = extractXmlTag(responseXml, 'ResultExplanation');
      const amount = Number(extractXmlTag(responseXml, 'TransactionAmount') || 0);
      const currency = extractXmlTag(responseXml, 'TransactionCurrency') || 'USD';
      const reference = extractXmlTag(responseXml, 'CompanyRef');
      const paymentChannel = extractXmlTag(responseXml, 'TransactionPaymentType') || 'DPO Checkout';
      const customerEmail = extractXmlTag(responseXml, 'CustomerEmail') || 'unknown@dpo.com';

      if (result === '000') {
        return {
          success: true,
          message: 'Transaction successfully verified.',
          data: {
            transactionId: transactionToken,
            amount,
            currency,
            provider: 'dpo',
            reference,
            paymentChannel,
            customerEmail,
            verifiedAt: new Date(),
            fees: 0,
            payload: { raw: responseXml }
          }
        };
      }

      return {
        success: false,
        message: `DPO verification failed: ${explanation} (Code: ${result})`
      };
    } catch (err: any) {
      logger.error('[DPO Gateway] Verification error:', err);
      return {
        success: false,
        message: err.message || 'Error occurred verifying transaction token.'
      };
    }
  }
}

export const dpoGateway = new DPOGateway();
registerPaymentGateway('dpo', dpoGateway);
export default dpoGateway;
