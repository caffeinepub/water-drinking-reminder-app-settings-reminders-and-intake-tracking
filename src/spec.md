# Specification

## Summary
**Goal:** Let users keep using the app offline by saving actions and showing previously saved data, then syncing automatically when back online.

**Planned changes:**
- Add an offline queue for user-generated actions (hydration intake logs, sleep logs, running logs, settings updates) that persists across reloads and replays in order when connectivity returns.
- Add local caching of last successfully fetched “today” values and recent history (hydration/sleep/running) so views can render read-only content while offline.
- Add a “Save for offline use” toggle in an existing settings surface, persist the preference locally, and gate offline queueing/caching behavior based on it.
- Show clear English UI messaging for offline/stale data and for non-blocking sync failures (keep failed items queued for retry), and refresh relevant React Query caches after successful sync.

**User-visible outcome:** Users can log hydration, sleep, runs, and settings changes while offline without errors; the app shows saved totals/history offline with a stale-data notice; and queued changes automatically sync (with retry messaging on failure) when the device goes back online.
