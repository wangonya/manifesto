# Manifesto Agent Guide

## Project Mission

Manifesto is a 3-day hackathon demo for turning campaign promises into trackable, evidence-backed public commitments. The product serves the `Voice & accountability` track first, with secondary relevance to `Dignity & opportunity` and `Peace & community`.

The demo should show a credible accountability loop: structured promises, plain-language summaries, anonymous community evidence, context notes, offline persistence, and simulated store-and-forward sync.

## Working Mode

- Build in small, demoable increments.
- Do not attempt the whole product at once.
- Every implementation step should leave the app in a usable state.
- Prefer the simplest working version that proves the civic workflow.
- Keep the demo honest: simulate hard infrastructure when production-grade implementation is out of scope.
- When creating branches, do not use a `codex/` prefix. Always choose a useful, descriptive branch name.

## Technical Defaults

- Use React + Vite + TypeScript for the demo app.
- Use IndexedDB as the local browser database.
- Use Dexie.js as the typed wrapper around IndexedDB.
- Use `dexie-react-hooks` for reactive React reads from local data.
- Use `vite-plugin-pwa` for PWA setup.
- Use Workbox through `vite-plugin-pwa` with the default `generateSW` strategy.
- Use the Web App Manifest for installability metadata.
- Use the Service Worker + Cache API for offline app-shell caching.

## Storage And PWA Rules

- Dexie/IndexedDB stores civic data: candidates, manifestos, promises, evidence, context notes, status history, and sync queue.
- Workbox/service worker caching stores the app shell and static assets.
- Offline app loading and offline data persistence are separate requirements: the service worker lets the app open without network, while IndexedDB keeps user-submitted evidence and notes after refresh or reconnect.
- Avoid custom service worker code unless offline testing exposes a concrete need.
- Simulated sync should use locally persisted queued changes, not a backend service.

## Scope Guardrails

- Do not build production authentication.
- Do not build real candidate identity verification.
- Do not build real legal case management.
- Do not build real peer-to-peer networking unless explicitly requested later.
- Do not depend on live AI APIs for the core demo path.
- Use seeded/static multilingual summaries for demo reliability unless the spec changes.
- Treat anonymity and user safety as first-class UX constraints.
- Keep the app usable in low-bandwidth and unstable connectivity scenarios.

## Implementation Guidance

- Start with seeded data before adding write flows.
- Keep data models typed and small.
- Add one workflow at a time: browse, inspect, contribute, persist, sync, polish.
- Prefer local-first behavior over server assumptions.
- Use accessible, compact UI patterns suitable for repeated civic use.
- Avoid large decorative assets that undermine low-bandwidth credibility.
- Make mobile layouts first-class because displaced or low-resource users may rely on phones.

## Verification Expectations

- Run type checks or production builds after implementation steps when available.
- Manually verify that local data survives refresh after persistence is added.
- Manually verify that the app opens offline after PWA caching is added.
- Check responsive behavior on mobile and desktop widths.
- Keep documentation aligned with implementation decisions when scope changes.
