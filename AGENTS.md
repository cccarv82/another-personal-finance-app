<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key Next.js 16 differences:
- `middleware.ts` is now `proxy.ts` (same API, renamed)
- Turbopack is default but **broken for server-only env vars** — always use `--webpack` in dev
- Route timing shows `proxy.ts: Xms` in server logs (normal, it's the internal proxy layer)
<!-- END:nextjs-agent-rules -->
