## Goal
Make this TanStack Start app deployable to Vercel instead of Cloudflare Workers.

## Context
- Current setup uses `@lovable.dev/vite-tanstack-config`, which bundles the Cloudflare Workers adapter and a custom SSR entry (`src/server.ts` → wrapped via `tanstackStart.server.entry`).
- `wrangler.jsonc` configures the Worker deployment.
- The app stores all data in `localStorage` (no server functions, no DB) — so the SSR layer is doing very little beyond rendering routes.

Because the Lovable Vite preset hard-wires the Cloudflare adapter, we can't cleanly "switch targets" while staying on it. The cleanest path is to replace the Lovable preset with a standard TanStack Start + Vercel config.

## Plan

### 1. Swap the Vite config to a standard TanStack Start setup
Replace `vite.config.ts` with a plain config using `@tanstack/react-start/plugin/vite` targeting Vercel:

```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({ target: "vercel" }),
    viteReact(),
  ],
});
```

### 2. Drop the Cloudflare-specific SSR wrapper
- Remove `tanstackStart.server.entry: "server"` (it points at `src/server.ts`, which uses Cloudflare-style `fetch(request, env, ctx)` signature).
- Keep `src/server.ts` deleted or unused. TanStack Start's default Vercel adapter handles SSR.
- Delete `wrangler.jsonc`.

### 3. Remove Cloudflare-only dependencies
In `package.json`:
- Remove `@cloudflare/vite-plugin`
- Remove `@lovable.dev/vite-tanstack-config`
Then run `bun install`.

### 4. Add Vercel project file (optional but recommended)
A minimal `vercel.json` isn't required — TanStack Start's Vercel target outputs the correct `.vercel/output/` structure and Vercel auto-detects it.

### 5. Deploy steps for the user
1. Connect this Lovable project to GitHub (chat **+** menu → GitHub → Connect project).
2. Import the GitHub repo into Vercel (vercel.com → Add New → Project).
3. Vercel auto-detects framework. Build command: `bun run build` (or `npm run build`). Output is handled by the TanStack Start Vercel adapter.
4. No env vars needed (app uses `localStorage` only).

## Technical notes / risks
- After this change, the Lovable preview here will still work (Vite dev server is framework-agnostic), but Lovable's own publish flow assumes the Cloudflare target. Publishing back through Lovable may break — Vercel becomes the deployment target.
- `src/lib/error-capture.ts` and `src/lib/error-page.ts` are only used by `src/server.ts`. We can leave them or delete them; they don't affect the build.
- All current features (timetable, classes, export) are pure client-side, so nothing in the app logic needs to change.

## Files touched
- `vite.config.ts` — rewritten
- `package.json` — remove 2 deps
- `wrangler.jsonc` — deleted
- `src/server.ts` — deleted (default SSR entry used)

Confirm and I'll apply these changes.