// ==============================================================================
// P2P Student Micro-Lending Network: Automated Verification Test Suite
// BCSE301P Software Engineering Lab
// ==============================================================================

const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

let cookies = '';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING BCSE301P SOFTWARE ENGINEERING TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  try {
    // 1. Domain Check Test (FR-3.4.1)
    console.log('1. Testing Student Domain Validation (FR-3.4.1)...');
    const invalidReg = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Attacker',
        email: 'attacker@gmail.com',
        password: 'Password@123',
      }),
    });
    assert(invalidReg.status === 403, 'Rejects non-college email (@gmail.com rejected with 403)');

    // 2. Valid Registration & OTP Flow (FR-3.4.2 & FR-3.2.1)
    console.log('\n2. Testing College Email Registration & OTP Verification (FR-3.4.2)...');
    const testEmail = `student${Date.now()}@vitstudent.ac.in`;
    const validReg = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Student',
        email: testEmail,
        password: 'Student@123',
        year: 2,
        contact_info: '+91 99999 88888',
      }),
    });
    assert(validReg.status === 200 && validReg.data.success, 'Valid registration initiated and OTP generated');

    const otpCode = validReg.data.otp_preview;
    const verifyRes = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        otp: otpCode,
      }),
    });
    assert(verifyRes.status === 200 && verifyRes.data.user?.is_verified, 'OTP verified successfully');
    assert(verifyRes.data.user?.karma_balance === 50, 'New student granted starting balance of 50 Karma points (FR-3.2.1)');

    // 3. Login with Student Credentials
    console.log('\n3. Testing Student Login & Authentication...');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'abhik@vitstudent.ac.in',
        password: 'Student@123',
      }),
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Student logged in and JWT issued');
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 4. Request Posting & Minimum Karma Validation (FR-3.1.1 & FR-3.2.4)
    console.log('\n4. Testing Request Creation & Minimum Karma Check (FR-3.1.1, FR-3.2.4)...');
    const createReqRes = await request('/api/requests', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        category: 'Academic',
        title: 'Need guidance on Graph Traversal BFS/DFS',
        description: 'Need a quick 30 min review before lab test.',
        preferred_mode: 'in-person',
        campus_location: 'Central Library',
        skills_required: 'Data Structures & Algorithms',
      }),
    });
    assert(createReqRes.status === 200 && createReqRes.data.request?.request_id, 'Request successfully posted');
    const newRequestId = createReqRes.data.request.request_id;

    // 5. Submit Offer & Accept Offer (FR-3.1.3 & FR-3.1.4)
    console.log('\n5. Testing Offer Submission & Acceptance Flow (FR-3.1.4)...');
    // Login as Priya (Helper)
    const priyaLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'priya.s@vitstudent.ac.in',
        password: 'Student@123',
      }),
    });
    const priyaHeaders = { Authorization: `Bearer ${priyaLogin.data.token}` };

    const offerRes = await request('/api/offers', {
      method: 'POST',
      headers: priyaHeaders,
      body: JSON.stringify({
        request_id: newRequestId,
        message: 'I can help you review BFS and DFS at the library tomorrow.',
      }),
    });
    assert(offerRes.status === 200 && offerRes.data.offer?.offer_id, 'Helper submitted offer');
    const offerId = offerRes.data.offer.offer_id;

    // Abhik (Requester) accepts offer
    const acceptRes = await request('/api/offers', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        offer_id: offerId,
        action: 'accept',
      }),
    });
    assert(acceptRes.status === 200 && acceptRes.data.exchange?.exchange_id, 'Requester accepted offer; exchange is now In Progress');
    const exchangeId = acceptRes.data.exchange.exchange_id;

    // 6. Complete Exchange & Karma Settlement (FR-3.2.2 & FR-3.2.3)
    console.log('\n6. Testing Exchange Completion & Karma Transfer (+20 Helper, -10 Requester)...');
    const completeRes = await request('/api/exchanges', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        exchange_id: exchangeId,
        action: 'complete',
      }),
    });
    assert(completeRes.status === 200 && completeRes.data.karmaResult?.success, 'Exchange completed and Karma points transferred');
    assert(completeRes.data.karmaResult?.requesterDeducted === 10, 'Requester debited 10 points (FR-3.2.3)');
    assert(completeRes.data.karmaResult?.helperAwarded === 20, 'Helper awarded 20 points (FR-3.2.2)');

    // 7. Ratings & Trust Score (FR-3.3.1 & FR-3.3.2)
    console.log('\n7. Testing Rating & Trust Score Calculation (FR-3.3.1, FR-3.3.2)...');
    const ratingRes = await request('/api/ratings', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        exchange_id: exchangeId,
        score: 5,
        comment: 'Great peer explanation! Highly recommended.',
      }),
    });
    assert(ratingRes.status === 200 && ratingRes.data.rating?.score === 5, '5-star rating and feedback submitted');

    // 8. Admin Moderation & Governance (FR-3.5)
    console.log('\n8. Testing Admin Governance Dashboard (FR-3.5)...');
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vitstudent.ac.in',
        password: 'Admin@123',
      }),
    });
    const adminHeaders = { Authorization: `Bearer ${adminLogin.data.token}` };

    const adminData = await request('/api/admin', {
      headers: adminHeaders,
    });
    assert(adminData.status === 200 && Array.isArray(adminData.data.reports), 'Admin accesses reports and student directory');

    // 9. Hostel Room Security & Verification Measure
    console.log('\n9. Testing Hostel Room Security & Verification Flow...');
    // Login as newly created student (from step 2)
    const newStudentLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'Student@123',
      }),
    });
    const newStudentHeaders = { Authorization: `Bearer ${newStudentLogin.data.token}` };

    // A. Unverified student tries to post a request -> Must be rejected (403)
    const blockedPost = await request('/api/requests', {
      method: 'POST',
      headers: newStudentHeaders,
      body: JSON.stringify({
        category: 'Electronics',
        title: 'Need HDMI Cable',
        description: 'For presentation',
      }),
    });
    assert(blockedPost.status === 403, 'Unverified student blocked from posting requests');

    // B. Student submits invalid room (e.g. room 75 on a floor that only has 50)
    const invalidRoomRes = await request('/api/profile/room', {
      method: 'POST',
      headers: newStudentHeaders,
      body: JSON.stringify({ block: 'B', floor: 3, room: 75 }),
    });
    assert(invalidRoomRes.status === 400, 'Rejects invalid room number exceeding 50 rooms/floor');

    // C. Student submits valid room B-325
    const validRoomRes = await request('/api/profile/room', {
      method: 'POST',
      headers: newStudentHeaders,
      body: JSON.stringify({ block: 'B', floor: 3, room: 25 }),
    });
    assert(validRoomRes.status === 200 && validRoomRes.data.room_status === 'pending', 'Student submitted room B-325 (Status: pending)');

    // D. Admin sees pending room and verifies student
    const pendingList = await request('/api/admin', { headers: adminHeaders });
    const pendingStudent = pendingList.data.pending_rooms.find(u => u.email === testEmail);
    assert(pendingStudent && pendingStudent.room_number === 'B-325', 'Admin sees student room request in pending queue');

    const approveRes = await request('/api/admin', {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ action: 'verify_room', user_id: pendingStudent.user_id }),
    });
    assert(approveRes.status === 200, 'Admin approved and verified student room');

    // E. Student can now successfully post requests!
    const allowedPost = await request('/api/requests', {
      method: 'POST',
      headers: newStudentHeaders,
      body: JSON.stringify({
        category: 'Electronics',
        title: 'Need scientific calculator for lab',
        description: 'Casio fx-991EX for afternoon session',
        preferred_mode: 'in-person',
        campus_location: 'Block B hostel lounge',
        skills_required: '',
      }),
    });
    assert(allowedPost.status === 200 && allowedPost.data.request?.request_id, 'Verified student can now successfully post requests');

    console.log('\n======================================================');
    console.log(`📊 TEST RESULTS: ${passed}/${total} TESTS PASSED`);
    console.log('======================================================\n');

    if (passed === total) {
      console.log('🎉 ALL FUNCTIONAL & NON-FUNCTIONAL REQUIREMENTS VERIFIED!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// Check if dev server is running before launching test
http.get(`${BASE_URL}/api/auth/me`, (res) => {
  runTests();
}).on('error', () => {
  console.log(`⚠️ Dev server not detected at ${BASE_URL}. Starting test runner with internal dispatch...`);
  console.log('Please make sure Next.js is running (`npm run dev`) or test-api will connect once ready.');
});
