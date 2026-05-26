# Agent Notes

## Coupang Seller OpenAPI

When working in this project and the user asks for Coupang Seller API access, product lookup, or seller product collection, use `docs/28-coupang-openapi-access.md` as the source of truth.

Operational rules:

- Load credentials from `.env.local`.
- Never print or commit `COUPANG_ACCESS_KEY`, `COUPANG_SECRET_KEY`, `Authorization`, or full raw product JSON unless the user explicitly asks for a sanitized export.
- Do not use `PUBLIC_` variables for Coupang credentials.
- Use HMAC SHA256 signing with the request path and query string as documented in `docs/28-coupang-openapi-access.md`.
- For a safe connectivity check, run `node scripts/check-coupang-openapi.mjs`.
- For read-only local product data and detail image sync, run `node scripts/sync-coupang-openapi-products.mjs`.
- Product-changing operations require explicit user approval before execution. This includes creating, updating, deleting, pausing, resuming, pricing, stock, image, option, category, and sale-status changes through Coupang APIs or admin tools.
