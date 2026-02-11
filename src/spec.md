# Specification

## Summary
**Goal:** Remove any per-user “last active” status from the app’s analytics UI and backend data/APIs while keeping aggregate analytics working.

**Planned changes:**
- Remove the “Last Active” column and any per-user last-active text from the admin user analytics UI.
- Delete/adjust any frontend helpers/imports used only to format/display per-user last active values.
- Update backend admin/user-analytics types and endpoints to stop storing, populating, and returning per-user last-active fields (e.g., fields representing last-active day/timestamp).
- Add a safe, conditional backend state migration to drop per-user last-active data from persisted analytics state while preserving other analytics counters.

**User-visible outcome:** Admin analytics screens no longer show “Last Active” for individual users, and the system no longer stores or exposes per-user last-active timestamps/days, while aggregate analytics remain available.
