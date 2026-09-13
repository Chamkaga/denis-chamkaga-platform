// shared/src/utils/currency.ts
// Centralized Multi-Currency Conversion & Formatting Engine for TZS and USD

import { Currency } from '../core/enums/Currency.enum.js';

export const DEFAULT_USD_TO_TZS_RATE = 2600;

export interface CurrencyConversionResult {
  originalAmount: number;
  originalCurrency: Currency;
  convertedAmount: number;
  targetCurrency: Currency;
  exchangeRate: number;
  timestamp: string;
}

/**
 * Converts monetary values strictly between TZS and USD with traceable exchange rate logging.
 * Preserves original transaction amounts without mutating underlying financial records.
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  exchangeRate: number = DEFAULT_USD_TO_TZS_RATE
): CurrencyConversionResult {
  const sanitizedAmount = isNaN(amount) ? 0 : amount;
  const rate = isNaN(exchangeRate) || exchangeRate <= 0 ? DEFAULT_USD_TO_TZS_RATE : exchangeRate;

  let convertedAmount = sanitizedAmount;

  if (from === Currency.USD && to === Currency.TZS) {
    convertedAmount = Math.round(sanitizedAmount * rate);
  } else if (from === Currency.TZS && to === Currency.USD) {
    convertedAmount = Number((sanitizedAmount / rate).toFixed(2));
  }

  return {
    originalAmount: sanitizedAmount,
    originalCurrency: from,
    convertedAmount,
    targetCurrency: to,
    exchangeRate: rate,
    timestamp: new Date().toISOString()
  };
}

/**
 * Formats monetary amounts according to currency type (TZS or USD).
 */
export function formatCurrency(
  amount: number,
  currency: Currency = Currency.TZS,
  locale: string = 'en-US'
): string {
  const sanitized = isNaN(amount) ? 0 : amount;

  if (currency === Currency.USD) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(sanitized);
  }

  // TZS formatting
  return `TZS ${Math.round(sanitized).toLocaleString(locale)}`;
}
