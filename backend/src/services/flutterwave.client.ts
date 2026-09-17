// src/services/flutterwave.client.ts
// Secure HTTP client layer for Flutterwave API integration.

import axios from 'axios';
import { env } from '../config/env';

export interface FlwInitializeParams {
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

export class FlutterwaveClient {
  private secretKey: string;
  private apiBaseUrl = 'https://api.flutterwave.com/v3';

  constructor() {
    this.secretKey = env.FLW_SECRET_KEY || '';
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  private hasCredentials(): boolean {
    return Boolean(this.secretKey && this.secretKey !== 'mock');
  }

  async initializeCheckout(params: FlwInitializeParams): Promise<{ success: boolean; link?: string; message?: string }> {
    if (!this.hasCredentials()) {
      return { success: false, message: 'Flutterwave payment processing is not configured.' };
    }

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/payments`,
        {
          tx_ref: params.txRef,
          amount: params.amount,
          currency: params.currency,
          redirect_url: params.redirectUrl,
          customer: {
            email: params.customer.email,
            phonenumber: params.customer.phone || undefined,
            name: params.customer.name
          },
          customizations: {
            title: params.customizations.title,
            description: params.customizations.description
          }
        },
        { headers: this.headers }
      );

      if (response.data?.status === 'success') {
        return {
          success: true,
          link: response.data.data.link
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Failed to initialize payment'
      };
    } catch (err: any) {
      console.error('Flutterwave initialization error:', err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || err.message
      };
    }
  }

  async verifyTransaction(transactionId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    if (!this.hasCredentials()) return { success: false, message: 'Flutterwave verification is not configured.' };

    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/transactions/${transactionId}/verify`,
        { headers: this.headers }
      );

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Verification call returned failure'
      };
    } catch (err: any) {
      console.error('Flutterwave verification error:', err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || err.message
      };
    }
  }
}

export const flwClient = new FlutterwaveClient();
