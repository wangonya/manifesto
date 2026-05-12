# Manifesto

Manifesto is an offline-first civic accountability PWA for turning campaign promises into trackable, evidence-backed public commitments.

The demo follows one core loop: citizens browse structured promises, read plain-language summaries, submit anonymous evidence, add community context, and preserve a political memory that can survive unstable connectivity.

## Hackathon Fit

- Primary track: Voice & accountability.
- Secondary track: Dignity & opportunity.
- Secondary track: Peace & community.

Manifesto is designed for communities operating under low bandwidth, physical instability, multilingual access needs, and personal risk. The demo prioritizes anonymous contribution, local-first storage, offline access, and context-agnostic deployment.

## Demo Scope

This is a 3-day hackathon demo, not a production launch.

The working demo should show:

- A structured manifesto for a fictional election.
- Elected candidate focus with archived unelected candidates.
- Promise tracking by sector, deadline, checkpoint, and status.
- App-wide multilingual UI and seeded civic content.
- Anonymous evidence submission.
- Community context or fact-check notes.
- Local persistence after refresh.
- Simulated store-and-forward sync between local device views.

## Tech Direction

- React + Vite + TypeScript
- IndexedDB for local browser storage
- Dexie.js as the IndexedDB wrapper
- `dexie-react-hooks` for reactive local reads
- `vite-plugin-pwa` for PWA setup
- Workbox `generateSW` for service worker generation
- Web App Manifest for installability metadata

IndexedDB stores civic data such as promises, evidence, context notes, status history, and sync queue entries. The service worker caches the app shell and static assets so the app can open offline. Both are required.

## What Is Real vs Simulated

Real for the demo:

- Local-first data persistence
- Anonymous contribution flow
- Offline app-shell behavior after caching
- Structured promise tracking
- Seeded app-wide multilingual content

Simulated for the demo:

- Store-and-forward device sync
- AI summarization and translation
- Candidate verification
- Legal accountability workflows
- Production moderation and identity systems

## Multilingual Demo Behavior

The language selector changes the whole app, not one content section. Seeded candidates, manifestos, promises, checkpoints, evidence, context notes, status history, filters, labels, and dates render in the selected language while stable IDs keep the same civic records selected.

User-submitted evidence and context are stored immediately in the selected language with translation marked pending, so the app can fall back to the original text offline and later fill missing translations through a safe server-side API proxy.

## Build Plan

Implementation is intentionally incremental. See [SPEC.md](./SPEC.md) for the detailed product specification, data model, milestones, and acceptance tests.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Validate the production build:

```bash
npm run build
```

Run the regression test suite:

```bash
npm run test:run
```

Run the full local validation gate:

```bash
npm run check
```

## Agent Guidance

See [AGENTS.md](./AGENTS.md) for implementation rules, scope guardrails, and verification expectations for future Codex or agent sessions.
