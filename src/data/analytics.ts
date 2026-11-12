// Cloudflare Web Analytics — free, cookie-free, no consent banner needed.
//
// The beacon is injected once, in src/layouts/Base.astro, so every current and
// future route is tracked without touching page files again.
//
// To get the token:
//   1. Cloudflare dashboard → Analytics & Logs → Web Analytics → Add a site
//   2. Hostname: chenjunqian.github.io  (it is not proxied, so pick the
//      "JS snippet installation" path, not automatic setup)
//   3. Copy the `token` value out of the data-cf-beacon object on that page
//   4. Paste it below, commit, push
//
// The token is public — it ships inside the HTML for every visitor — so it
// belongs in git. Nothing is emitted while it is empty, which keeps local
// builds and preview deploys from sending beacons.

export const webAnalyticsToken = 'feaae1fa05a349c28212374c860a4740';

/** Cloudflare tokens are 32 hex characters. */
export const webAnalyticsEnabled = import.meta.env.PROD && /^[a-f0-9]{32}$/.test(webAnalyticsToken);
