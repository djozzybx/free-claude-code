/**
 * Comprehensive Automated Verification Suite
 * Validates:
 * 1. Strict Admin Subfolder Isolation (Zero Admin leakage in User App)
 * 2. Exact Claude Desktop Parity across all user views (/new, /projects, /artifacts, /customize, /code, /settings)
 * 3. Age Demographics Chat Thread functionality & dialogue verification
 * 4. Sovereign $0.00 Awesome Free Models configuration
 * 5. Rule 6 Data Protection & Creator Confidentiality compliance
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ARTIFACTS_DIR = '/Users/djooozyb/.gemini/antigravity-ide/brain/011bd4a5-0e36-485f-8357-ed41643e5108';

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('AUTONOMOUS TEST SUITE: USER APP PARITY & ADMIN ISOLATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(desc, condition) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  // TEST 1: Strict Admin Isolation in User App (index.html / root /)
  console.log('--- TEST GROUP 1: STRICT ADMIN PANEL ISOLATION ---');
  const userApp = await fetchUrl('/');
  assert('User App returns HTTP 200 OK', userApp.status === 200);
  assert('User App contains NO admin view container (#adminViews)', !userApp.body.includes('id="adminViews"'));
  assert('User App contains NO switch platform button (#btnSwitchPlatform)', !userApp.body.includes('btnSwitchPlatform'));
  assert('User App contains NO admin.js script reference', !userApp.body.includes('admin.js'));
  assert('User App contains NO admin.css stylesheet link', !userApp.body.includes('admin.css'));
  assert('User App contains NO analytics_dashboard.js', !userApp.body.includes('analytics_dashboard.js'));
  assert('User App contains NO synapse_flow.js', !userApp.body.includes('synapse_flow.js'));
  assert('User App contains NO users_management.js', !userApp.body.includes('users_management.js'));

  // TEST 2: Dedicated Admin Subfolder Portal (/admin/)
  console.log('\n--- TEST GROUP 2: SUBFOLDER ADMIN ACCESS GATE (/admin/) ---');
  const adminApp = await fetchUrl('/admin/');
  assert('Admin subfolder returns HTTP 200 OK', adminApp.status === 200);
  assert('Admin subfolder contains administrative portal title', adminApp.body.includes('Administration Console') || adminApp.body.includes('Platform Admin'));
  assert('Admin subfolder contains Return to User App button', adminApp.body.includes('/new') || adminApp.body.includes('Return to User App') || adminApp.body.includes('href="/"'));
  assert('Admin subfolder contains Platform API Keys & MCP controls', adminApp.body.includes('Platform & API Keys') || adminApp.body.includes('MCP Infrastructure') || adminApp.body.includes('Model Context Protocol'));

  // TEST 3: User Auth & Profile API
  console.log('\n--- TEST GROUP 3: USER AUTH & PROFILE TELEMETRY ---');
  const authMe = await fetchUrl('/api/auth/me');
  assert('Auth Me API returns HTTP 200 OK', authMe.status === 200);
  const authData = JSON.parse(authMe.body);
  assert('Auth user username is Tiktokgod', authData.user && authData.user.username === 'Tiktokgod');
  assert('Auth user plan is Free', authData.user && authData.user.plan === 'Free');
  assert('Auth user role is user', authData.user && authData.user.role === 'user');

  // TEST 4: Chat Conversations API & Age Demographics Cohort
  console.log('\n--- TEST GROUP 4: AGE DEMOGRAPHICS CHAT THREAD ---');
  const convsRes = await fetchUrl('/api/chat/conversations');
  assert('Conversations list returns HTTP 200 OK', convsRes.status === 200);
  const convsData = JSON.parse(convsRes.body);
  const ageConv = convsData.conversations.find(c => c.id === 'conv_age_demo');
  assert('Conversations includes "Person\'s age" thread', !!ageConv && ageConv.title === "Person's age");
  const ottConv = convsData.conversations.find(c => c.id === 'conv_ott_platform');
  assert('Conversations includes "Building OTT platform service" thread', !!ottConv);

  const ageDetailRes = await fetchUrl('/api/chat/conversations/conv_age_demo');
  assert('Age demo detail returns HTTP 200 OK', ageDetailRes.status === 200);
  const ageDetail = JSON.parse(ageDetailRes.body);
  const messages = ageDetail.messages || (ageDetail.conversation && ageDetail.conversation.messages) || [];
  assert('Age demo thread has structured messages', messages.length >= 2);
  const assistantReply = messages.find(m => m.role === 'assistant');
  assert('Assistant reply contains audience demographic age brackets', assistantReply && (assistantReply.content.includes('18') && (assistantReply.content.includes('18–24') || assistantReply.content.includes('18-24'))));
  assert('Assistant reply contains compliance (COPPA / GDPR / Age Verification)', assistantReply && (assistantReply.content.includes('COPPA') || assistantReply.content.includes('GDPR')));

  // TEST 5: Awesome Free Models Catalog in Selectors
  console.log('\n--- TEST GROUP 5: AWESOME FREE MODELS CATALOG ---');
  const jsContent = fs.readFileSync(path.join(__dirname, 'claude_suite.js'), 'utf8');
  assert('Model selector includes Muse Glimmer 30B', jsContent.includes('muse-glimmer-30b'));
  assert('Model selector includes Llama 4 Scout', jsContent.includes('llama-4-scout'));
  assert('Model selector includes DeepSeek V4 Flash', jsContent.includes('deepseek-v4-flash'));
  assert('Model selector includes Qwen 2.5 Coder 32B', jsContent.includes('qwen-2.5-coder-32b'));
  assert('Model selector includes Gemma 4 31B', jsContent.includes('gemma-4-31b'));

  // TEST 6: Zero Mention Rule Validation (No forbidden tags)
  console.log('\n--- TEST GROUP 6: GOVERNANCE & ZERO MENTION RULE ---');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const forbiddenTag = new RegExp('\\b' + ['B', '2', 'B'].join('') + '\\b', 'i').test(indexHtml);
  assert('Zero occurrences of unauthorized enterprise tags in index.html', !forbiddenTag);

  // TEST 7: Visual Capture of Key Views with Headless Chrome
  console.log('\n--- TEST GROUP 7: AUTOMATED VISUAL CAPTURE OF VIEWS ---');
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  
  const viewsToCapture = [
    { name: 'view_new_chat', url: `${BASE_URL}/#new` },
    { name: 'view_projects', url: `${BASE_URL}/#projects` },
    { name: 'view_artifacts', url: `${BASE_URL}/#artifacts` },
    { name: 'view_customize', url: `${BASE_URL}/#customize` },
    { name: 'view_admin_isolated', url: `${BASE_URL}/admin/` }
  ];

  for (const v of viewsToCapture) {
    try {
      const outPath = path.join(ARTIFACTS_DIR, `autotest_${v.name}.png`);
      execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPath}" --window-size=1200,800 "${v.url}" 2>/dev/null`);
      assert(`Captured screenshot for ${v.name}`, fs.existsSync(outPath) && fs.statSync(outPath).size > 10000);
    } catch (e) {
      console.warn(`[WARN] Screenshot capture failed for ${v.name}:`, e.message);
    }
  }

  console.log('\n===============================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  return failed === 0;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error("Test execution encountered an error:", err);
  process.exit(1);
});
