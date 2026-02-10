# Specification

## Summary
**Goal:** Fix hydration streak, daily goal completion, and reward/badge unlocking so they update reliably for newly signed-in users and reflect in the UI without manual refresh.

**Planned changes:**
- Fix backend authorization/registration flow so first-time users can create a profile and successfully call core tracking methods (e.g., updateUserSettings, addDailyIntake), returning clear errors when unauthorized instead of failing silently.
- Update backend goal-completion logic to persist goal completion exactly once per user per day, correctly incrementing completedGoals and updating streak behavior across consecutive days.
- Fix backend reward/badge unlocking to append newly earned badges without duplication and persist them in UserRewards across refreshes.
- Update frontend intake/goal completion flow to refresh streak, completed goals, and unlocked badges after successful online intake updates; surface backend errors to the user; and clearly indicate offline-queued actions without prematurely showing new rewards.

**User-visible outcome:** A first-time signed-in user can set up their profile and track intake successfully; when the daily goal is met, streaks/goals increment correctly and badges unlock and persist, with the UI updating immediately (or showing queued status offline) and displaying clear error messages on failures.
