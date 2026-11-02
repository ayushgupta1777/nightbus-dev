# NightBus Web (nightbus-dev) — Project Context & Autonomous Agent Instructions

## 🗺️ Project Architecture Overview

This directory (`nightbus-dev`) is the **React 19 + Vite 8 Web Staging Cockpit & App Simulator** for the NightBus ecosystem.

- **Deployed URL**: [https://ayushgupta1777.github.io/nightbus-dev/](https://ayushgupta1777.github.io/nightbus-dev/)
- **GitHub Repository**: [https://github.com/ayushgupta1777/nightbus-dev](https://github.com/ayushgupta1777/nightbus-dev)
- **Production Backend**: `https://server.nightbusjourney.com/api` (Hostinger VPS)
- **QA Feedback Endpoint**: `https://server.nightbusjourney.com/api/qa-feedback`

---

## 🤖 Permanent Rule: Autonomous QA Testing & Issue Resolution Pipeline

Testers and developers use the live staging app with the floating QA feedback widget to submit bugs, UI issues, and change requests. These reports are stored directly in MongoDB via `https://server.nightbusjourney.com/api/qa-feedback`.

### Trigger Phrases:
Whenever the user provides short commands such as:
- `start fix that issue`
- `fix issue`
- `fix next bug`
- `fetch and fix`
- `qa fix`
- `next qa ticket`

**DO NOT ask the user to explain the bug details.** The details are already in the database. Execute the autonomous loop below immediately:

---

### Autonomous Execution Runbook:

1. **Fetch Next Pending Issue**:
   Run the local resolver tool:
   ```bash
   node scripts/qaResolver.cjs --next
   # or
   npm run qa:next
   ```
   This retrieves the highest priority issue with route, screen name, user role, captured console errors, and exact target file path in `src/screens/...`.

2. **Locate Target Screen**:
   Inspect the target file (typically under `src/screens/...`).

3. **Implement the Fix**:
   Edit the affected file(s) to fix the issue according to the user's description and error logs.

4. **Verify the Build**:
   Test production build inside this repository:
   ```bash
   npm run build
   ```
   Ensure build completes with zero errors.

5. **Log & Erase from Database**:
   Run:
   ```bash
   node scripts/qaResolver.cjs --resolve-and-erase <issue_id> --notes "<concise explanation of what was fixed>"
   # or
   npm run qa:resolve-erase -- <issue_id> --notes "<concise explanation of what was fixed>"
   ```
   This automatically:
   - Appends a clean entry to [QA_RESOLUTION_LOG.md](QA_RESOLUTION_LOG.md).
   - Erases the issue from the live database queue so it is not processed twice.

6. **Commit & Deploy to GitHub Pages (Zero GitHub Actions used)**:
   ```bash
   git add .
   git commit -m "fix(qa): resolve issue <issue_id> - <title>"
   git push origin main
   npm run deploy
   ```

7. **Report**:
   Concisely report:
   - What was fixed
   - Which file was updated
   - Confirmation that the ticket was erased from database and logged to [QA_RESOLUTION_LOG.md](QA_RESOLUTION_LOG.md)
   - Staging live verification link: [https://ayushgupta1777.github.io/nightbus-dev/](https://ayushgupta1777.github.io/nightbus-dev/)
