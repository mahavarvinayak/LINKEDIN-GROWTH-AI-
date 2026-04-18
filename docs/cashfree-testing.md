# Cashfree Sandbox Test Credentials Guide

Use this guide to give test payment access to any teammate without exposing production credentials.

## 1) Required credentials

Get these from Cashfree Merchant Dashboard in Test mode:
- `CASHFREE_APP_ID` (starts with `TEST_`)
- `CASHFREE_SECRET_KEY` (starts with `TEST_`)

Recommended env values:
- `CASHFREE_ENV=sandbox`
- `NEXT_PUBLIC_CASHFREE_MODE=sandbox`

## 2) Where to generate keys

1. Open Cashfree Merchant Dashboard.
2. Switch to Test mode (yellow test banner).
3. Go to Developers > API Keys.
4. Generate/copy Test App ID and Test Secret Key.

## 3) Shareable test pack for QA

Provide to testers:
- App URL (your staging/local URL)
- Sandbox App ID + Sandbox Secret Key
- Test environment instruction: use only sandbox mode

Do not share:
- Any key starting with `PROD_`
- Production webhook secrets

## 4) Basic test checklist

1. Create order from backend using sandbox keys.
2. Open checkout with `mode: "sandbox"`.
3. Complete payment in test environment.
4. Verify order status from backend before granting service.
5. Validate webhook signature for payment callback.

## 5) Common mistakes

- Using `PROD_` key in test mode.
- Creating orders from frontend directly (must be backend).
- Trusting redirect result without server-side order verification.
- Not verifying webhook signature.
