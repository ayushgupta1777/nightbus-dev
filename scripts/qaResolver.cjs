// ==================== bus/web/scripts/qaResolver.cjs ====================
// Self-contained Autonomous QA Resolver & Audit Log Pipeline for web / nightbus-dev

const fs = require('fs');
const path = require('path');

// When opened in web folder, root is this directory
const WEB_ROOT = path.resolve(__dirname, '..');
const LOG_FILE_PATH = path.join(WEB_ROOT, 'QA_RESOLUTION_LOG.md');

const SCREEN_FILE_MAP = {
  HomeScreen: 'src/screens/customer/HomeScreen.jsx',
  SearchScreen: 'src/screens/customer/SearchScreen.jsx',
  JourneyResultsScreen: 'src/screens/customer/JourneyResultsScreen.jsx',
  SeatSelectionScreen: 'src/screens/customer/SeatSelectionScreen.jsx',
  PassengerDetailsScreen: 'src/screens/customer/PassengerDetailsScreen.jsx',
  BookingConfirmationScreen: 'src/screens/customer/BookingConfirmationScreen.jsx',
  MyBookingsScreen: 'src/screens/customer/MyBookingsScreen.jsx',
  BookingDetailsScreen: 'src/screens/customer/BookingDetailsScreen.jsx',
  LiveTrackingScreen: 'src/screens/customer/LiveTrackingScreen.jsx',
  YatraListScreen: 'src/screens/customer/YatraListScreen.jsx',
  YatraDetailsScreen: 'src/screens/customer/YatraDetailsScreen.jsx',
  RentalRequestScreen: 'src/screens/customer/RentalRequestScreen.jsx',
  FoodHomeScreen: 'src/screens/customer/FoodHomeScreen.jsx',
  WalletScreen: 'src/screens/customer/WalletScreen.jsx',
  ProfileScreen: 'src/screens/common/ProfileScreen.jsx',
  LoginScreen: 'src/screens/auth/LoginScreen.jsx',
  TestLoginScreen: 'src/screens/auth/TestLoginScreen.jsx',
  OwnerDashboardScreen: 'src/screens/owner/OwnerDashboardScreen.jsx',
  BusManagementScreen: 'src/screens/owner/BusManagementScreen.jsx',
  SmartRouteBuilderScreen: 'src/screens/owner/SmartRouteBuilderScreen.jsx',
  OwnerYatraScreen: 'src/screens/owner/OwnerYatraScreen.jsx',
  StaffDashboardScreen: 'src/screens/staff/StaffDashboardScreen.jsx',
  QRScannerScreen: 'src/screens/staff/QRScannerScreen.jsx',
  PassengerManifestScreen: 'src/screens/staff/PassengerManifestScreen.jsx',
  ManualVerificationScreen: 'src/screens/staff/ManualVerificationScreen.jsx',
  ManualLocationScreen: 'src/screens/staff/ManualLocationScreen.jsx',
  DeveloperDashboardScreen: 'src/screens/developer/DeveloperDashboardScreen.jsx'
};

const API_ENDPOINTS = [
  'https://server.nightbusjourney.com/api/qa-feedback',
  'http://localhost:5000/api/qa-feedback'
];

async function fetchFromApi(endpoint, pathSuffix = '', method = 'GET', body = null) {
  try {
    const url = `${endpoint}${pathSuffix}`;
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getPendingIssues() {
  for (const ep of API_ENDPOINTS) {
    const data = await fetchFromApi(ep, '?status=pending');
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      return { source: ep, issues: data.data };
    }
  }
  return { source: 'none', issues: [] };
}

async function getIssueById(id) {
  for (const ep of API_ENDPOINTS) {
    const data = await fetchFromApi(ep, `/${id}`);
    if (data && data.success && data.data) {
      return { source: ep, issue: data.data };
    }
  }
  return { source: 'none', issue: null };
}

async function eraseIssue(id) {
  for (const ep of API_ENDPOINTS) {
    const res = await fetchFromApi(ep, `/${id}`, 'DELETE');
    if (res && res.success) {
      return { success: true, source: ep };
    }
  }
  return { success: false };
}

function appendToAuditLog(issue, resolutionNotes, filesTouched = []) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const issueId = issue._id || 'unknown';
  const screenName = issue.screenName || 'UnknownScreen';
  const route = issue.route || '/';
  const userRole = issue.userRole || 'customer';
  const severity = (issue.severity || 'medium').toUpperCase();
  const description = (issue.description || '').replace(/\r?\n/g, ' ');
  const targetFile = SCREEN_FILE_MAP[screenName] || 'src/screens/...';

  const entry = `
### [${severity}] Ticket \`${issueId}\` - ${issue.title || description.substring(0, 50)}
- **Timestamp**: ${timestamp}
- **Route & Screen**: \`${route}\` (${screenName})
- **User Role**: \`${userRole}\` | **Mode**: \`${issue.viewport?.mode || 'phone'}\`
- **Target File**: [${targetFile}](${targetFile})
- **Reported Issue**: ${description}
- **AI Resolution**: ${resolutionNotes}
- **Files Modified**: ${filesTouched.length > 0 ? filesTouched.map(f => `\`${f}\``).join(', ') : `\`${targetFile}\``}
- **Status**: Verified & Erased from Live Database Queue
---
`;

  try {
    if (!fs.existsSync(LOG_FILE_PATH)) {
      const header = `# QA Resolution & Staging Audit Log

This document tracks all QA issues detected during manual/automated testing on the **NightBus DEV Staging Cockpit**, their root cause fixes, and verification audit trails.

---
`;
      fs.writeFileSync(LOG_FILE_PATH, header + entry, 'utf8');
    } else {
      fs.appendFileSync(LOG_FILE_PATH, entry, 'utf8');
    }
    return true;
  } catch (err) {
    console.error('Failed to append to QA_RESOLUTION_LOG.md:', err.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || '--next';

  try {
    if (action === '--list') {
      const { source, issues } = await getPendingIssues();
      console.log(`\n📋 Found ${issues.length} pending QA issue(s) [Source: ${source}]:\n`);
      issues.forEach((issue, index) => {
        console.log(`[${index + 1}] ID: ${issue._id} | [${issue.severity.toUpperCase()}] ${issue.title}`);
        console.log(`    Route: ${issue.route} | Screen: ${issue.screenName} | Role: ${issue.userRole}`);
      });
      console.log('');
    } else if (action === '--erase') {
      const id = args[1];
      if (!id) {
        console.error('❌ Usage: node scripts/qaResolver.cjs --erase <id>');
        process.exit(1);
      }
      const result = await eraseIssue(id);
      if (result.success) {
        console.log(`🗑️ Issue ${id} successfully ERASED from ${result.source}!`);
      } else {
        console.error(`❌ Issue ${id} could not be erased.`);
      }
    } else if (action === '--resolve-and-erase') {
      const id = args[1];
      const notesIndex = args.indexOf('--notes');
      const notes = notesIndex !== -1 ? args.slice(notesIndex + 1).join(' ') : 'Fixed and verified by AI.';

      if (!id) {
        console.error('❌ Usage: node scripts/qaResolver.cjs --resolve-and-erase <id> --notes "<resolution notes>"');
        process.exit(1);
      }

      const { issue } = await getIssueById(id);
      const issueData = issue || { _id: id, title: 'Resolved Ticket', description: notes };

      appendToAuditLog(issueData, notes);
      console.log(`📝 Logged resolution to QA_RESOLUTION_LOG.md`);

      const result = await eraseIssue(id);
      if (result.success) {
        console.log(`✅ Issue ${id} successfully ERASED from ${result.source} database queue!`);
      } else {
        console.warn(`⚠️ Issue was logged, but could not be erased from DB.`);
      }
    } else {
      // Default: --next (Fetch next pending issue for AI resolution)
      const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
      const { source, issues: pendingIssues } = await getPendingIssues();

      if (!pendingIssues || pendingIssues.length === 0) {
        console.log('\n🎉 No pending QA issues in queue! System is completely clean.\n');
        process.exit(0);
      }

      pendingIssues.sort((a, b) => {
        const aSev = severityOrder[a.severity] || 3;
        const bSev = severityOrder[b.severity] || 3;
        if (aSev !== bSev) return aSev - bSev;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      const issue = pendingIssues[0];
      const targetFilePath = SCREEN_FILE_MAP[issue.screenName] || 'src/screens/...';

      console.log('\n============================================================');
      console.log('🤖 AI RESOLVER: NEXT PENDING QA TICKET');
      console.log('============================================================');
      console.log(`Issue ID    : ${issue._id}`);
      console.log(`Title       : ${issue.title}`);
      console.log(`Severity    : [${issue.severity.toUpperCase()}] | Type: ${issue.type}`);
      console.log(`Route       : ${issue.route}`);
      console.log(`Screen Name : ${issue.screenName}`);
      console.log(`Target File : ${targetFilePath}`);
      console.log(`User Role   : ${issue.userRole} (Mode: ${issue.viewport?.mode || 'phone'})`);
      console.log(`Created At  : ${new Date(issue.createdAt).toLocaleString()}`);
      console.log(`Source DB   : ${source}`);
      console.log('------------------------------------------------------------');
      console.log('Description & Desired Change:');
      console.log(issue.description);
      console.log('------------------------------------------------------------');

      if (issue.consoleLogs && issue.consoleLogs.length > 0) {
        console.log('Auto-Captured Console Logs:');
        issue.consoleLogs.forEach((l, i) => console.log(`  [${i + 1}] ${l}`));
        console.log('------------------------------------------------------------');
      }

      console.log(`After fixing and verifying with "npm run build":`);
      console.log(`  npm run qa:resolve-erase ${issue._id} -- --notes "<what you fixed>"\n`);
    }
  } catch (err) {
    console.error('Error in qaResolver:', err);
  }
}

main();
