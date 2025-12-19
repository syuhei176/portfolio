# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website built with React Router v7, deployed on Cloudflare Workers. The project uses server-side rendering (SSR) and is configured with TailwindCSS v4 for styling.

## Common Commands

### Development
```bash
pnpm run dev           # Start development server at http://localhost:5173
pnpm run typecheck     # Run type checking (generates types + runs tsc)
```

### Building & Deployment
```bash
pnpm run build         # Build for production
pnpm run preview       # Preview production build locally
pnpm run deploy        # Build and deploy to Cloudflare Workers

# Alternative deployment workflow
npx wrangler versions upload   # Deploy a preview URL
npx wrangler versions deploy   # Promote version to production
```

### Type Generation
```bash
pnpm run cf-typegen    # Generate Cloudflare Worker types (runs automatically on postinstall)
```

## Architecture

### Key Files & Structure

- **`workers/app.ts`**: Cloudflare Worker entry point that creates the request handler and passes Cloudflare context (env, ctx) to the React Router app
- **`app/entry.server.tsx`**: Server-side rendering entry point with bot detection using `isbot`
- **`app/root.tsx`**: Root layout component with error boundary
- **`app/routes.ts`**: Route configuration using React Router's type-safe routing
- **`app/routes/`**: Individual route components
- **`wrangler.jsonc`**: Cloudflare Workers configuration (compatibility date, bindings, vars)

### Build Configuration

The project uses Vite with several plugins:
- `@cloudflare/vite-plugin`: Enables Cloudflare Workers integration with Vite SSR environment
- `@tailwindcss/vite`: TailwindCSS v4 integration
- `@react-router/dev/vite`: React Router v7 framework integration
- `vite-tsconfig-paths`: TypeScript path mapping support

### React Router Context

The app extends React Router's `AppLoadContext` to include Cloudflare-specific context:
```typescript
// Available in loaders and actions
context.cloudflare.env  // Environment variables and bindings
context.cloudflare.ctx  // ExecutionContext for waitUntil, passThroughOnException
```

### Type Safety

- TypeScript is configured with strict mode
- Cloudflare Worker types are auto-generated via `wrangler types` into `worker-configuration.d.ts`
- React Router types are auto-generated via `react-router typegen`
- Run `pnpm run typecheck` to verify all types

### Styling

TailwindCSS v4 is configured via the Vite plugin. Global styles are in `app/app.css`.

## Deployment Target

This application runs on Cloudflare Workers (not Pages). The main entry point is `workers/app.ts`, which must export a `fetch` handler compatible with the Workers runtime.
