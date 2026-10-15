# Google Search Console integration for Nihal.ON

This branch adds a server-side endpoint at `/api/search-console`. It reads data only for `https://nihal-on.vercel.app/` and never exposes Google credentials to browser code.

## One-time Google setup

1. In Google Cloud Console, enable **Google Search Console API**.
2. Create a **Service Account** in IAM & Admin → Service Accounts and create a JSON key. Store the downloaded JSON securely; never commit it.
3. In Google Search Console, open the `https://nihal-on.vercel.app/` URL-prefix property → Settings → Users and permissions → Add user. Add the service account's `client_email` and grant **Restricted** access (enough for read-only performance reporting).
4. In Vercel → Project → Settings → Environment Variables, add:
   - `GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT`: the entire service-account JSON as a single-line JSON value (keep its private key newlines escaped as JSON; paste the file contents directly into the value).
   - `SEARCH_CONSOLE_DASHBOARD_TOKEN`: a long random secret used to protect the endpoint. Generate one locally, e.g. `openssl rand -hex 32`. Do not put it in frontend source code.
5. Apply variables to Production (and Preview if needed), then redeploy.

## Endpoint

`GET /api/search-console?days=7`, `?days=28`, or `?days=90`.

Send the dashboard token in the HTTP header `Authorization: Bearer <SEARCH_CONSOLE_DASHBOARD_TOKEN>`. The endpoint returns totals, daily trend, top queries, and top pages. It rejects unauthenticated requests and sends private/no-store cache headers.

For a local test, use the token from your local environment:
```bash
curl -H "Authorization: Bearer $SEARCH_CONSOLE_DASHBOARD_TOKEN" "https://nihal-on.vercel.app/api/search-console?days=28"
```

## Important

- Search Console data may be delayed; the endpoint intentionally ends the report three days before today.
- Do not put the service-account JSON or dashboard token in `VITE_*` variables or any client-side code.
- This commit only adds the protected data endpoint and setup instructions. A dashboard UI can call it from an authenticated admin interface; do not expose the token publicly.
