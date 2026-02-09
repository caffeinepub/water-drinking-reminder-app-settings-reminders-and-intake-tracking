# Specification

## Summary
**Goal:** Expand the health app beyond hydration by adding sleep scheduling/tracking, a running tracker, and support for additional custom health reminders.

**Planned changes:**
- Add backend data models and APIs for sleep schedule settings (enabled, target bedtime/wake time, days of week) and sleep log entries per authenticated user.
- Add backend data models and APIs for run log entries (date/time, distance, duration, optional notes) and recent running history/stats per authenticated user.
- Add backend APIs to create, update, list, and delete custom (non-hydration) reminder definitions per authenticated user (title, enabled, schedule configuration).
- Extend the frontend UI with new Sleep and Running sections within the existing app layout/navigation while keeping all existing hydration features functional.
- Add React Query hooks/mutations for sleep schedule/logs, run logs, and custom reminders using the existing actor-based pattern, including cache invalidation and consistent actor-not-available handling.
- Update the in-app reminder scheduler to trigger and display distinct reminders for Hydration, Sleep, and Custom reminders, using browser Notifications when permitted and falling back to an in-app banner/toast.

**User-visible outcome:** Authenticated users can configure a sleep schedule, log and view sleep history, log runs and view running history with basic stats, and create/manage additional custom health reminders—all while existing hydration tracking and reminders continue to work.
