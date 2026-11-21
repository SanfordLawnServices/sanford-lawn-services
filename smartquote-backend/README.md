# Sanford SmartQuote — backend scaffold (not deployed)

This is a **draft-only** Cloudflare Worker API. It is not connected to the website or the prototype dashboard. No customer submissions are being collected by it.

## Architecture
- GitHub Pages: existing public marketing site, unchanged
- Cloudflare Worker: API, validation and Turnstile verification
- Cloudflare D1: inquiry records and owner review audit events
- Cloudflare R2: private photos; no public bucket access
- Owner: bearer token authentication for initial development ONLY; replace with Cloudflare Access or equivalent identity provider with MFA before production

## Endpoints
- `GET /api/health`: configuration indicator (does not verify all storage operations)
- `POST /api/intake`: multipart form with name, address, email, service, frequency, details, consent=yes, turnstileToken and up to 10 photos; returns receipt, never a price
- `GET /api/owner/inquiries`: token-protected list
- `POST /api/owner/inquiries/:id/status`: internal-only status change and audit event; does not send email or issue a quote

## Before deployment (required)
1. Create Cloudflare account and D1 database, private R2 bucket and Turnstile site. Insert actual resource bindings in wrangler.toml. **Never commit secrets.**
2. Apply schema.sql to D1, configure allowed production origin and separate private owner authentication.
3. Add edge-level rate limits, bot abuse controls, image processing/metadata stripping, malware and decompression-bomb checks, logging without personal information, retention/deletion policy, and end-to-end security tests.
4. Limit HTTP request body at the edge (Content-Length can be absent); enforce actual byte limits before full multipart parsing. Current implementation must not be exposed publicly until this is addressed.
5. Replace initial bearer-token owner auth with secure identity-based authentication and MFA; do not store owner tokens in GitHub Pages JavaScript.
6. Add a photo access endpoint that authorizes the owner and returns private photos securely; do not expose R2 keys or public object URLs.
7. Add measured lawn area verification and a deterministic cost model based on actual business costs. Benchmark against dated Sanford-area comparables. No price from unscaled photos alone.
8. Implement a real owner-only dashboard backed by authenticated API calls; existing dashboard uses fictional examples only.
9. Add explicit owner approval for final quotes and an auditable notification workflow. Test that no quote is sent automatically.
10. Add privacy notice, retention schedule, customer consent, and appropriate security/privacy review before collecting real customer data.

## Known limitations
- No AI analysis, local market comparison, customer notifications, or quote engine yet.
- No automatic uploads from the existing website.
- Not production-ready. No customer data should be submitted until hardening and deployment are complete.
