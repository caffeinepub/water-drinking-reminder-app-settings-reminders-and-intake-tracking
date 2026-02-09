# Specification

## Summary
**Goal:** Add accurate consecutive-day hydration streak tracking (with safe state migration) and a non-spammy “streak at risk” reminder near the end of the day.

**Planned changes:**
- Update backend streak logic so streak counts only consecutive calendar days where the daily hydration goal was met, increments at most once per day, and resets when a day is missed.
- Add a conditional Motoko migration to upgrade existing persisted rewards/streak state to the updated streak structure without trapping.
- Add a local “streak-break” reminder that can trigger near end-of-day when streak > 0 and today’s goal is not yet met, using browser notifications when permitted or the existing in-app reminder banner otherwise.
- Extend the existing Reminders UI with controls to enable/disable the streak-break reminder and configure the warning window timing, persisted per-device via localStorage.

**User-visible outcome:** Users see an accurate hydration streak that resets when they miss a day, and can enable/configure an end-of-day “streak at risk” reminder that notifies them (via browser notification or in-app banner) without spamming.
