This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## CBE SuperApp Token Proxy (CORS Fix)

### Why this exists
Your browser blocked calls to:
`https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp/mini-apps/client/token`
because the upstream API doesn’t return `Access-Control-Allow-Origin` for your site (CORS preflight fails).

To fix this, the app uses a same-origin **Next.js proxy route**. The browser calls your app (`/api/...`) and your server calls the upstream API (server-to-server), so the browser never performs the CORS preflight against `qaapisuperapp...`.

### What to look at in the code
- Proxy endpoint: `app/api/cbe-client-token/route.ts`
- Frontend token fetch calls updated in: `app/context/CBESuperAppContext.tsx`

### Local setup (env vars)
Create/update: `cbeshopminidemo/.env.local`

```env
# Server-side proxy (used by app/api/cbe-client-token/route.ts)
CBE_API_BASE_URL=https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp
CBE_API_KEY=PASTE_YOUR_x-api-key_VALUE

# Upstream may require a cookie. Put the value you used in Postman here.
CBE_COOKIE=PASTE_YOUR_COOKIE_VALUE

# Your SDK/payment payload is constructed in the browser using NEXT_PUBLIC vars.
# If your SDK/payment flow needs x-api-key, keep this set.
NEXT_PUBLIC_CBE_API_KEY=PASTE_YOUR_x-api-key_VALUE

# Server-side signing credentials (used by app/api/cbe-generate-order-auth)
CBE_APP_SECRET=PASTE_APP_SECRET_FROM_CREDENTIAL
CBE_PRIVATE_KEY=PASTE_PRIVATE_KEY_FROM_CREDENTIAL
```

After editing env vars, restart the dev server (`npm run dev`).

### Test the proxy locally
1. Start dev server:
   ```bash
   npm run dev
   ```
2. Call the proxy:
   ```bash
   curl -sS -X POST http://localhost:3000/api/cbe-client-token \
     -H 'Content-Type: application/json' \
     -d '{"app_code":"092999"}'
   ```

Expected: a JSON response containing the token (same structure as Postman, e.g. `data.token`).

### Vercel deployment (env vars)
In **Vercel → Project → Settings → Environment Variables**, set the same variables as above.

Make sure:
- `CBE_API_KEY`, `CBE_API_BASE_URL`, `CBE_COOKIE` are **server-side** variables (not public)
- `NEXT_PUBLIC_CBE_API_KEY` is marked as **public**

Then redeploy.

## CBE Payment Signing (generate `sign` + `confirm_payload`)

### Why this exists
Your `initiatePayment` payload previously used hardcoded values for:
- `orderPayload.sign` (Ed25519)
- `orderPayload.confirm_payload` (HMAC-SHA256)

Those should be generated dynamically from the order fields using your private keys/secrets on the server.

### New endpoint
`POST /api/cbe-generate-order-auth`

**Request body**
```json
{
  "app_code": "092999",
  "merchant_code": "663689013779061",
  "merchant_reference": "txn-2345",
  "title": "Some title",
  "total_amount": 5,
  "currency": "ETB",
  "credit_account_number": ""
}
```
`credit_account_number` is optional (if omitted, the server uses `""`).

**Response**
```json
{
  "sign": "<base64-ed25519-signature>",
  "confirm_payload": "<hex-hmac-sha256>"
}
```

### Env vars required (server-side)
Add to `cbeshopminidemo/.env.local` (and to Vercel env vars) the following:
```env
# Server-only signing credentials (do not expose to browser)
CBE_APP_SECRET=PASTE_APP_SECRET_FROM_CREDENTIAL
CBE_PRIVATE_KEY=PASTE_PRIVATE_KEY_FROM_CREDENTIAL
```

### Validate signing output locally
Set the env vars above, then run:

```bash
node scripts/verify-cbe-order-auth.mjs
```

It compares the generated output against the old hardcoded constants that were previously in `app/context/CBESuperAppContext.tsx`.

### Important security note
Do **not** commit real secrets to git (never push `.env.local`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
