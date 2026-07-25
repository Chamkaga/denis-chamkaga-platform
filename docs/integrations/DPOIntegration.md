# Direct Pay Online (DPO) Integration

> Denis Chamkaga Platform · Integrations Layer · Concrete Payment Gateway Implementation

*   **Current Provider:** DPO Payment Aggregator
*   **Status:** Production Candidate
*   **Replaceable:** YES (decoupled via abstract PaymentProvider layer)

---

## 1. Role in Architecture

The `DPOIntegration` serves as the concrete implementation of the [IPaymentGateway](file:///d:/Projects/denis-chamkaga-platform/docs/architecture/SupportContributionArchitecture.md#L141) interface. It encapsulates all communication, XML formatting, and security handshakes with the Direct Pay Online gateway.

```
┌──────────────────────────────┐
│  Support Contribution Engine │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  IPaymentGateway (Interface) │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   DPOIntegration (Concrete)  │
└──────────────────────────────┘
```

---

## 2. API Endpoints

*   **Sandbox API Endpoint:** `https://secure.3gdirectpay.com/API/v6/`
*   **Production API Endpoint:** `https://secure.3gdirectpay.com/API/v6/` *(configured dynamically via environment variables)*
*   **Sandbox Hosted Checkout:** `https://secure.3gdirectpay.com/payv3.php?ID={TransactionToken}`

---

## 3. Session Initialization Flow

When a payment is requested, the backend performs the following steps:

1.  **Format Request Payload:** Formats an XML payload containing merchant key, payment details, client information, and callback redirect paths.
2.  **Execute POST Request:** Dispatches the payload to DPO.
3.  **Parse Transaction Token:** Extracts the transaction token from the gateway response.
4.  **Formulate Handoff Link:** Assembles the redirect URL:
    ```text
    https://secure.3gdirectpay.com/payv3.php?ID={TransactionToken}
    ```

---

## 4. Supported Tanzanian Payment Methods

The hosted checkout page dynamically displays payment methods activated on the merchant profile:

*   **Mobile Money:**
    *   Vodacom M-Pesa
    *   Airtel Money
    *   Tigo Pesa (Mixx by Yas)
    *   Halotel HaloPesa
*   **Cards:**
    *   Visa
    *   MasterCard
*   **Bank Transfers:**
    *   CRDB Bank
    *   NMB Bank
    *   NBC Bank

---

## 5. Callback Handling & Verification

DPO sends transaction state notifications via server-to-server callbacks and client redirects.

### Verification API Handshake
Before confirming a contribution as `Completed`, the backend runs a direct verification API check:

1.  Backend creates verification XML:
    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>{CompanyToken}</CompanyToken>
      <Request>verifyToken</Request>
      <TransactionToken>{TransactionToken}</TransactionToken>
    </API3G>
    ```
2.  POST request is made to DPO API.
3.  DPO returns XML detailing payment state (`Result: 900` for success).
4.  Database record is updated, and events are dispatched on the platform Event Bus.
