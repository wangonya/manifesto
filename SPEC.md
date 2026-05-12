# Manifesto Demo Specification

## Summary

Manifesto is an offline-first accountability PWA for tracking political promises from campaign manifesto to post-election delivery. It helps citizens understand commitments, submit anonymous evidence, attach community context, and preserve political memory across unstable connectivity conditions.

This is a hackathon demo, not a production launch. The goal is a judge-ready vertical slice that proves the idea with real local persistence and credible simulations for expensive infrastructure.

## Tracks

- Primary: Voice & accountability. Citizens can track promises against delivery and hold elected officials accountable.
- Secondary: Dignity & opportunity. Economic, land, jobs, and resource promises can be monitored by affected communities.
- Secondary: Peace & community. Broken promises can be surfaced early before grievances deepen into conflict.

## Demo Success Criteria

The working demo should let a user:

- Browse a structured manifesto for a fictional election.
- Focus on the elected candidate while preserving archived candidates.
- View promises by sector, deadline, checkpoint, and status.
- Switch the whole app between seeded languages, including UI labels, manifesto data, summaries, evidence, context, and status history.
- Submit anonymous evidence for a promise.
- Add community context or fact-check notes.
- Refresh without losing locally entered data.
- Demonstrate queued offline changes moving through an in-app simulated sync flow.

## Non-Goals

- Production authentication.
- Real candidate or official identity verification.
- Real AI translation or summarization.
- Real peer-to-peer mesh networking.
- Backend services.
- Legal case management.
- Moderation systems beyond simple demo-safe labels.

## Storage And Offline Architecture

- Local data layer: IndexedDB via Dexie.
- Reactive UI layer: `dexie-react-hooks`.
- Persisted entities: `Candidate`, `Manifesto`, `Promise`, `Evidence`, `ContextNote`, `StatusHistory`, and `SyncEnvelope`.
- Offline behavior: users can browse seeded data, add anonymous evidence, add context notes, and refresh without losing data.
- Sync demo: queued local changes are stored in IndexedDB and later merged through an in-app simulated device sync.

IndexedDB stores the civic data. It is not just a cache. Evidence, context notes, status history, and sync queue entries must survive browser refreshes.

## PWA Architecture

- PWA plugin: `vite-plugin-pwa`.
- Service worker strategy: Workbox `generateSW`.
- Cached resources: built HTML, CSS, JS, icons, and static demo assets.
- Manifest fields: app name, short name, theme color, background color, display mode, start URL, and icons.
- Initial constraint: avoid custom service worker code unless offline testing exposes a concrete need.

The service worker and Cache API make the app shell load offline. Dexie and IndexedDB make the app data persist offline. The implementation must include both.

## Initial Data Model

`Candidate`

- `id`
- `name`
- `office`
- `region`
- `electionYear`
- `partyOrAffiliation`
- `elected`
- `archived`

Localized text fields use `{ en, sw, fr }` seeded values for demo reliability. User-submitted text stores the original selected language immediately and can later be filled by a translation service without blocking the local-first flow.

`Manifesto`

- `id`
- `candidateId`
- `title`
- `publishedDate`
- `sourceLabel`
- `originalLanguage`

`Promise`

- `id`
- `manifestoId`
- `title`
- `sector`
- `location`
- `deadline`
- `status`
- `checkpoints`
- `summary`

`Evidence`

- `id`
- `promiseId`
- `type`
- `note` with original language and translation status
- `sourceLabel`
- `anonymous`
- `createdAt`
- `createdOffline`

`ContextNote`

- `id`
- `promiseId`
- `note` with original language and translation status
- `confidenceLabel`
- `createdAt`

`StatusHistory`

- `id`
- `promiseId`
- `status`
- `reason`
- `evidenceIds`
- `createdAt`

`SyncEnvelope`

- `id`
- `entityType`
- `entityId`
- `operation`
- `payload`
- `createdAt`
- `syncedAt`

## Incremental Milestones

1. Scaffold the React + Vite + TypeScript app.
2. Add seeded demo data and typed models.
3. Build the dashboard and manifesto browsing views.
4. Build promise detail views with checkpoints, evidence, and status history.
5. Add anonymous evidence submission.
6. Add community context notes.
7. Add app-wide multilingual selection using seeded localized UI and civic data.
8. Add IndexedDB persistence through Dexie and reactive reads through `dexie-react-hooks`.
9. Add PWA offline app-shell caching through `vite-plugin-pwa`.
10. Add simulated device sync using locally queued `SyncEnvelope` records.
11. Polish responsive UI and prepare the final demo flow.

Each milestone should produce a working app state before the next milestone begins.

## Acceptance Tests

- The app renders seeded candidates, manifestos, and promises.
- Archived unelected candidates remain accessible but are not the dashboard focus.
- Promise status counts match the seeded and locally updated data.
- Evidence can be added anonymously.
- Context notes can be added without identity.
- The selected language applies across the whole app without filtering out civic records or breaking layout.
- Local data survives page refresh after Dexie persistence is added.
- The app shell loads offline after PWA caching is added and the app has been visited once.
- Simulated sync moves queued local changes between device views without deleting evidence.
- Mobile and desktop layouts remain readable and usable.

## Assumptions

- The first implementation target is a polished 3-day hackathon demo.
- Real local persistence is required.
- Store-and-forward sync is simulated in-app.
- AI-generated summaries and translations are represented by seeded static content.
- No backend is introduced unless the project scope changes.
