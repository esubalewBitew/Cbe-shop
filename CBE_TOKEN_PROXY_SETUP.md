# CBE Token Proxy Setup (CORS Fix)

## Overview
Your frontend was blocked by CORS when calling the upstream endpoint:

`https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp/mini-apps/client/token`

This happens because browser requests perform a CORS preflight, and the upstream response doesn’t include `Access-Control-Allow-Origin` for your origin.

### Fix used today
We moved the token request from the **browser** to the **Next.js server** using a proxy route.

## New request flow
1. Browser calls: `POST https://<your-domain>/api/cbe-client-token`
2. Next.js server calls upstream (server-to-server):
   `POST https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp/mini-apps/client/token`
3. Server returns upstream JSON/text back to the browser.

This avoids browser CORS preflight against `qaapisuperapp...`.

## Files involved
- Proxy route:
  - `app/api/cbe-client-token/route.ts`
- Frontend token fetch:
  - `app/context/CBESuperAppContext.tsx`

## 1) Environment variables

### Local development
Create/update: `cbeshopminidemo/.env.local`

```env
# Upstream base URL and secret key for the server-side proxy
CBE_API_BASE_URL=https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp
CBE_API_KEY=PASTE_YOUR_x-api-key_VALUE

# Cookie was required in your Postman example. Put the same value here.
CBE_COOKIE=PASTE_YOUR_COOKIE_VALUE

# Your browser-side SDK/payment payload uses NEXT_PUBLIC vars.
# Keep this if your SDK requires it.
NEXT_PUBLIC_CBE_API_KEY=PASTE_YOUR_x-api-key_VALUE
```

Restart dev server after changing env:
```bash
npm run dev
```

### Vercel deployment
Go to: **Vercel → Project → Settings → Environment Variables**.

Add these:
- `CBE_API_BASE_URL` (Server)
- `CBE_API_KEY` (Server)
- `CBE_COOKIE` (Server, optional only if upstream doesn’t require it)
- `NEXT_PUBLIC_CBE_API_KEY` (Public)

Then redeploy.

## 2) Verify locally (proxy)
Run:

```bash
curl -sS -X POST http://localhost:3000/api/cbe-client-token \
  -H 'Content-Type: application/json' \
  -d '{"app_code":"092999"}'
```

Expected: a response with `status: 200` (matching your Postman response shape), and a JWT token under `data.token`.

## 3) Expected browser behavior
In browser DevTools → Network:
- You should see requests to: `/api/cbe-client-token`
- You should NOT see the browser requesting: `https://qaapisuperapp.../mini-apps/client/token`

If you still see the upstream URL being called from the browser, then there is another call site in your code (outside the updated `CBESuperAppContext.tsx`) that still points to `SDK_CONFIG.apiBaseUrl`.

## Troubleshooting

### Proxy returns:
`{"error":"Server is missing CBE proxy env vars","missing":["CBE_API_BASE_URL","CBE_API_KEY"]}`

Fix: add the env vars (section above) and restart `npm run dev`.

### Upstream returns:
`{"message":"Missing secret key in request headers."}`

Fix: ensure `CBE_API_KEY` matches the exact `x-api-key` used in Postman.

### Upstream returns 401/403 (even with x-api-key)

Fix: upstream may require the cookie. Ensure:
- `CBE_COOKIE` matches the `Cookie:` header value from Postman

## Security reminder
Do not commit real secrets (never commit `.env.local`).

