# Specification

## Summary
**Goal:** Build a signed-in water drinking reminder app that lets each Internet Identity user configure hydration settings, receive in-app/browser reminders, and track daily intake with recent history.

**Planned changes:**
- Add Internet Identity sign-in/sign-out and load/store all user data by Principal.
- Implement a single Motoko backend actor with models and APIs for hydration settings and intake events (getSettings, upsertSettings, addIntake, listIntake, getTodayProgress), rejecting unauthenticated calls where required.
- Build a settings UI for daily goal (ml), reminder interval (minutes), active hours start/end, and default cup size (ml) with input validation and persistence.
- Add a reminder scheduler with start/pause controls; request Notification permission via explicit user action; use browser notifications when granted, otherwise show an in-app reminder.
- Implement intake logging UX (quick-add using default cup size, preset amount, and custom amount) and show today’s progress vs goal with correct error handling on failed saves.
- Provide a history/stats view showing at least today + last 7 days with a simple chart or list and an empty state.
- Apply a consistent calm health/hydration theme across the app (not primarily blue/purple) and ensure mobile readability.
- Add and reference generated static images from `frontend/public/assets/generated` in the UI (e.g., header/empty state) without backend image serving.

**User-visible outcome:** Users can sign in with Internet Identity, set their goal and reminder preferences, start/pause reminders, log water intake with quick actions, see today’s progress, and review the last 7 days of intake—using a consistent calm theme with included static illustrations.
