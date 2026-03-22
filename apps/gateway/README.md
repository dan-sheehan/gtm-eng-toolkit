# Gateway

Reverse proxy that routes requests by path prefix to backend app servers. Serves a hub page at `/` with links to all apps.

## Architecture

Pure Python stdlib — uses `http.server`, no Flask or external dependencies. Proxies GET, POST, PUT, and DELETE requests, forwarding headers and rewriting `Location` headers on redirects.

## Routes

| Path | Backend | Port |
|------|---------|------|
| `/` | Hub page (built-in) | — |
| `/prompts/*` | Prompt library | 3002 |
| `/brief/*` | Morning brief | 3003 |
| `/playbook/*` | Onboarding playbook | 3004 |
| `/discovery/*` | Discovery call prep | 3005 |
| `/competitive-intel/*` | Competitive intel | 3006 |
| `/prompt-builder/*` | Prompt builder | 3007 |
| `/outbound-email/*` | Outbound email | 3008 |
| `/gtm-trends/*` | GTM trends | 3009 |

Requests to `/prefix` (without trailing slash) are redirected to `/prefix/` for correct relative path resolution. If a backend is down, the gateway returns a 502 with a descriptive message.

## Files

| File | Purpose |
|------|---------|
| `gateway.py` | HTTP server, routing table, hub page HTML, proxy logic |

## CLI

```bash
gateway serve --port 8000   # Run in foreground
```

The gateway doesn't have its own start/stop — it's managed by the `hub` script which orchestrates all apps together.

## Running

**Via hub:** `hub start` then visit `http://localhost:8000`

**Standalone:** `python3 apps/gateway/gateway.py serve --port 8000`

Note: Backend apps must be running separately for their routes to work.
