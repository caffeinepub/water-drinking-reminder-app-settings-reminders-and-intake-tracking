# Specification

## Summary
**Goal:** Restore Admin Dashboard visibility by exposing a backend `isCallerAdmin()` query so the frontend can correctly detect admin status.

**Planned changes:**
- Add a public query method `isCallerAdmin() : async Bool` in `backend/main.mo`.
- Implement the method to return `AccessControl.isAdmin(accessControlState, caller)` using the existing access-control state.

**User-visible outcome:** When signed in, admins see the “Admin” tab and can open the Admin Dashboard; non-admin users do not see the Admin tab, and the app no longer fails due to a missing canister method.
