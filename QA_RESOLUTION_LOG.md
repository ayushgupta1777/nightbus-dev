# QA Resolution & Staging Audit Log

This document tracks all QA issues reported during testing (manual and automated) on the **NightBus DEV Staging Cockpit** ([https://ayushgupta1777.github.io/nightbus-dev/](https://ayushgupta1777.github.io/nightbus-dev/)), their root cause analysis, code fixes, and verification status before production deployment.

---

## 📊 Summary Metrics

| Metric | Value |
| :--- | :--- |
| **Pipeline Status** | 🟢 Active & Autonomous |
| **Testing Cockpit URL** | [https://ayushgupta1777.github.io/nightbus-dev/](https://ayushgupta1777.github.io/nightbus-dev/) |
| **Backend API** | `https://server.nightbusjourney.com/api/qa-feedback` |
| **Resolver Script** | [scripts/qaResolver.js](file:///a:/warrol/bus/web/scripts/qaResolver.js) |
| **Queue Policy** | Auto-logged to this file & erased from live queue upon resolution |

---

## 📜 Resolved Issues Audit Trail

### [MEDIUM] Ticket `6ae24038e144f6f7e88eb9bb` - in that bottom side that is cutting half that bottom feature
- **Timestamp**: 2026-10-28 18:40:31 UTC
- **Route & Screen**: `/` (`HomeScreen`)
- **User Role**: `customer` | **Mode**: `phone`
- **Target File**: [src/screens/customer/HomeScreen.jsx](file:///a:/warrol/bus/web/src/screens/customer/HomeScreen.jsx)
- **Reported Issue**: In that bottom side that is cutting half that bottom feature or option in that page looking it item few of going outside only half visible.
- **Root Cause**: The scrollable container did not have sufficient bottom clearance above the fixed bottom navigation bar (`BottomNav`), and quick service items lacked flex/min-width constraints.
- **AI Resolution**: Increased scroll container bottom padding to 100px so bottom cards/features scroll completely clear above the bottom bar. Constrained Quick Services grid items with `minWidth: 0` and text-overflow ellipsis to prevent horizontal clipping.
- **Files Modified**: `src/screens/customer/HomeScreen.jsx`
- **Verification**: Production build verified (`npm run build`). Deployed to staging.
- **Status**: Verified & Erased from Live Database Queue

---

### [MEDIUM] Ticket `6ae871fbe144f6f7e88fe552` - Test ticket: Verify autonomous resolve and erase
- **Timestamp**: 2026-11-02 11:20:20 UTC
- **Route & Screen**: `/profile` (ProfileScreen)
- **User Role**: `customer` | **Mode**: `phone`
- **Target File**: [src/screens/common/ProfileScreen.jsx](file:///a:/warrol/bus/web/src/screens/common/ProfileScreen.jsx)
- **Reported Issue**: Testing that AI can fetch, log, and erase this ticket from the database
- **AI Resolution**: Verified end-to-end resolution and auto-erase pipeline
- **Files Modified**: `src/screens/common/ProfileScreen.jsx`
- **Status**: Verified & Erased from Live Database Queue

---
