# GaverA + Razorpay Standard Checkout (Netlify)

This is a static HTML storefront with two Netlify serverless functions. The browser never receives `RAZORPAY_KEY_SECRET`.

## What is implemented
- `POST /.netlify/functions/create-order`: validates cart item IDs and quantities, computes amount from a server-side price map (not from browser-supplied prices), and creates a Razorpay order through the API.
- Razorpay Standard Checkout modal in `index.html`, with prefill details, dismiss handling and `payment.failed` handling.
- `POST /.netlify/functions/verify-payment`: verifies the HMAC-SHA256 signature using the server-side secret and timing-safe comparison.
- `COD request` remains demo-only and does not send an order to the store owner.

## Before deployment
1. In Netlify, open the site that will host this code and deploy this whole folder as the site root (the folder contains `netlify.toml`, `index.html`, and `netlify/functions/`).
2. In Netlify Site configuration → Environment variables, add:
   - `RAZORPAY_KEY_ID` = your Razorpay **test** Key ID for initial testing
   - `RAZORPAY_KEY_SECRET` = the matching test Key Secret
3. Trigger a fresh deploy after adding environment variables.
4. Open the site, add a product to the bag, continue to checkout, fill delivery details, choose **Pay online with Razorpay**, and submit. Use Razorpay's official test-mode test credentials/methods from its documentation; do not use real money while the key starts with `rzp_test_`.
5. After testing, replace both variables with the live keys only after Razorpay approves the account and the store is ready. Keep the secret only in Netlify environment variables.

## Local testing
- Install Node.js, then run `npm install` (the payment functions use Node's built-in `fetch` and `crypto`; no Razorpay SDK dependency is required).
- Install Netlify CLI if needed: `npm install --save-dev netlify-cli`
- Copy `.env.example` to `.env` and enter your own test keys in `.env`. Never commit `.env`.
- Run `npx netlify dev` and open the local URL it prints.

## Important production gaps
- Catalogue prices in `index.html` and the matching server-side map are sample prices. Confirm them, shipping, stock, taxes and returns before live sales. Keep the server-side map aligned with the catalogue.
- No database/order-management dashboard or owner notification is included. Payment signature verification is implemented, but a production shop should also confirm payment capture/status via the Razorpay API or signed webhooks before fulfilment, and persist the order/customer details securely.
- This package does not deploy itself or change your Netlify project automatically. Upload/deploy the folder to the correct existing Netlify site.
