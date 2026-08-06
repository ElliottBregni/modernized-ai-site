# Modernized AI authentication site

This repository publishes the static authentication UI for
`https://auth.modernized-ai.com` with GitHub Pages.

## OAuth responsibilities

- `/oauth/consent/` is the Supabase OAuth 2.1 authorization UI. It reads the
  `authorization_id` supplied by Supabase, shows the registered client and
  requested scopes, and submits the user's approve or deny decision.
- `/auth/callback/` completes the site's GitHub social sign-in and returns only
  to the same-origin consent page when one is pending.
- OAuth application authorization codes are returned by Supabase directly to
  each client's exact registered redirect URI. For `Obscura CLI Local`, that is
  currently `http://127.0.0.1:8764/callback`.
- Access tokens, refresh tokens, provider tokens, client secrets, and PKCE
  verifiers must never be placed in redirect URLs or committed to this repo.

## Supabase configuration

- Site URL: `https://auth.modernized-ai.com`
- OAuth Server authorization path: `/oauth/consent`
- GitHub social-login redirect allow list must include:
  `https://auth.modernized-ai.com/auth/callback/`
- OAuth client redirect URIs are configured separately under OAuth Apps and
  must match exactly.

The browser uses only the Supabase publishable key. Never add a secret key or
`service_role` key to this static site.

## Validation

Run the dependency-free security and routing checks before publishing:

```sh
node scripts/check-site.mjs
```

The same check runs in GitHub Actions for pull requests and pushes to `main`.

## Publishing

GitHub Pages should publish from the root of the `main` branch. The `CNAME`
file must continue to contain `auth.modernized-ai.com`.

The Cloudflare DNS record should remain:

- Type: `CNAME`
- Name: `auth`
- Target: `elliottbregni.github.io`
- Proxy status: `DNS only`
- TTL: `Auto`

Do not add a Cloudflare Worker, redirect rule, or page rule for
`/oauth/consent/` or `/auth/callback/`; GitHub Pages serves both paths.

After deployment, verify:

```sh
curl -I https://auth.modernized-ai.com/
curl -I https://auth.modernized-ai.com/auth/callback/
curl -I https://auth.modernized-ai.com/oauth/consent/
```

All three routes should return HTTP 200 before testing a live OAuth login.
