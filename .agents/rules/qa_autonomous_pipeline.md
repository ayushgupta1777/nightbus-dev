---
description: Permanent rule for autonomous QA issue fetching, resolving, auditing, and database cleanup inside web repository
always_on: true
---

# Autonomous QA Issue Resolution Rule (Local Web Repo)

When the user enters short instructions like "start fix that issue", "fix next issue", "qa fix", or similar:

1. **Never ask the user for details.** Fetch the issue directly from the database:
   ```bash
   node scripts/qaResolver.cjs --next
   # or
   npm run qa:next
   ```
2. **Review issue payload**:
   - Issue ID
   - Title & Description
   - Route & Screen Name
   - Target File (e.g. `src/screens/...`)
   - Console errors & User role
3. **Apply the fix** to the target file.
4. **Validate**:
   ```bash
   npm run build
   ```
5. **Audit Log & Database Erase**:
   Execute:
   ```bash
   node scripts/qaResolver.cjs --resolve-and-erase <issue_id> --notes "<resolution notes>"
   ```
   This writes to `QA_RESOLUTION_LOG.md` and deletes the ticket from the MongoDB queue.
6. **Deploy (Zero Actions Used)**:
   ```bash
   git add .
   git commit -m "fix(qa): <issue description>"
   git push origin main
   npm run deploy
   ```
7. **Confirm** completion and provide the updated staging link:
   `https://ayushgupta1777.github.io/nightbus-dev/`
