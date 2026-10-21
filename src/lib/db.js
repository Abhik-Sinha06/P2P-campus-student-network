import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let pool = null;
let useFallback = false;
let fallbackDb = null;

// Initialize memory/file fallback database for out-of-the-box local testing
function initFallbackDb() {
  const dataFilePath = path.join(process.cwd(), '.db_fallback.json');
  if (fs.existsSync(dataFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } catch (e) {
      // ignore
    }
  }

  // Initial seed state matching SRS specifications
  return {
    users: [
      {
        user_id: 1,
        name: 'Abhik Sinha',
        email: 'abhik@vitstudent.ac.in',
        password_hash: '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q', // Student@123
        role: 'student',
        year: 2,
        contact_info: '+91 98765 43210 (WhatsApp)',
        karma_balance: 70,
        is_verified: true,
        status: 'active',
        room_number: 'B-325',
        room_status: 'verified',
      },
      {
        user_id: 2,
        name: 'Priya Sharma',
        email: 'priya.s@vitstudent.ac.in',
        password_hash: '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q',
        role: 'student',
        year: 3,
        contact_info: '+91 98111 22233 (Telegram: @priyavit)',
        karma_balance: 90,
        is_verified: true,
        status: 'active',
        room_number: 'A-412',
        room_status: 'verified',
      },
      {
        user_id: 3,
        name: 'Rahul Kumar',
        email: 'rahul.k@vitstudent.ac.in',
        password_hash: '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q',
        role: 'student',
        year: 1,
        contact_info: '+91 97222 33344',
        karma_balance: 50,
        is_verified: true,
        status: 'active',
        room_number: 'C-215',
        room_status: 'verified',
      },
      {
        user_id: 4,
        name: 'Sneha Patel',
        email: 'sneha.p@vitstudent.ac.in',
        password_hash: '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q',
        role: 'student',
        year: 2,
        contact_info: '+91 96333 44455',
        karma_balance: 40,
        is_verified: true,
        status: 'active',
        room_number: 'D-630',
        room_status: 'verified',
      },
      {
        user_id: 5,
        name: 'System Administrator',
        email: 'admin@vitstudent.ac.in',
        password_hash: '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q',
        role: 'admin',
        year: 4,
        contact_info: 'admin-office@vitstudent.ac.in',
        karma_balance: 100,
        is_verified: true,
        status: 'active',
        room_number: null,
        room_status: 'verified',
      },
    ],
    skills: [
      { skill_id: 1, skill_name: 'Python' },
      { skill_id: 2, skill_name: 'Data Structures & Algorithms' },
      { skill_id: 3, skill_name: 'Digital Logic Design' },
      { skill_id: 4, skill_name: 'Circuit Theory' },
      { skill_id: 5, skill_name: 'Next.js / React' },
      { skill_id: 6, skill_name: 'Machine Learning' },
      { skill_id: 7, skill_name: 'Arduino / Microcontrollers' },
      { skill_id: 8, skill_name: 'Database Management' },
    ],
    user_skills: [
      { user_id: 1, skill_id: 1 },
      { user_id: 1, skill_id: 2 },
      { user_id: 1, skill_id: 5 },
      { user_id: 2, skill_id: 3 },
      { user_id: 2, skill_id: 4 },
      { user_id: 2, skill_id: 7 },
      { user_id: 3, skill_id: 1 },
      { user_id: 3, skill_id: 8 },
      { user_id: 4, skill_id: 2 },
      { user_id: 4, skill_id: 6 },
    ],
    items: [
      {
        item_id: 1,
        owner_id: 1,
        item_name: 'Casio fx-991EX ClassWiz Scientific Calculator',
        condition: 'Excellent',
        available_from: '2026-09-01',
        available_to: '2026-10-01',
        status: 'available',
      },
      {
        item_id: 2,
        owner_id: 2,
        item_name: 'Arduino Uno R3 Starter Kit with Sensors',
        condition: 'Like New',
        available_from: '2026-09-01',
        available_to: '2026-09-20',
        status: 'available',
      },
      {
        item_id: 3,
        owner_id: 2,
        item_name: '65W Anker USB-C Fast Charger & Cable',
        condition: 'Good',
        available_from: '2026-09-01',
        available_to: '2026-09-25',
        status: 'available',
      },
      {
        item_id: 4,
        owner_id: 3,
        item_name: 'Breadboard, Resistors and Jumper Wire Kit',
        condition: 'Used',
        available_from: '2026-09-01',
        available_to: '2026-09-15',
        status: 'available',
      },
    ],
    requests: [
      {
        request_id: 1,
        requester_id: 1,
        category: 'Academic',
        title: 'Need help understanding Dijkstra & Dynamic Programming for CAT-2',
        description: 'Struggling with graphs and state recurrence in DSA. Need a 45-min peer tutoring session in Central Library or Google Meet.',
        preferred_mode: 'in-person',
        campus_location: 'Central Library, 2nd Floor',
        return_date: null,
        skills_required: 'Data Structures & Algorithms',
        status: 'open',
        created_date: '2026-09-07',
      },
      {
        request_id: 2,
        requester_id: 3,
        category: 'Item',
        title: 'Urgent: Casio fx-991EX calculator needed for tomorrow afternoon exam',
        description: 'Left my calculator at home and have Digital Electronics lab exam tomorrow at 2:00 PM. Will return right after 5:00 PM!',
        preferred_mode: 'in-person',
        campus_location: 'Technology Tower (TT) Ground Floor',
        return_date: '2026-09-08',
        skills_required: null,
        status: 'open',
        created_date: '2026-09-07',
      },
      {
        request_id: 3,
        requester_id: 4,
        category: 'Project',
        title: 'Seeking teammate skilled in Next.js & Tailwind for Hackathon',
        description: 'Building a student utility app for Gravitas hackathon. Frontend layout is halfway done; need someone to help build components.',
        preferred_mode: 'online',
        campus_location: 'Online / Discord',
        return_date: null,
        skills_required: 'Next.js / React',
        status: 'open',
        created_date: '2026-09-07',
      },
      {
        request_id: 4,
        requester_id: 2,
        category: 'Academic',
        title: 'Quick explanation on Microprocessor 8086 addressing modes',
        description: 'Completed exchange example for past syllabus topic.',
        preferred_mode: 'in-person',
        campus_location: 'SJT 4th Floor',
        return_date: null,
        skills_required: 'Digital Logic Design',
        status: 'completed',
        created_date: '2026-09-04',
      },
    ],
    offers: [
      {
        offer_id: 1,
        request_id: 1,
        helper_id: 4,
        message: 'Hey Abhik! I scored 95 in DSA last sem, happy to go over Dijkstra and DP with you at the Library tomorrow at 4 PM.',
        status: 'pending',
        offer_date: '2026-09-07',
      },
      {
        offer_id: 2,
        request_id: 2,
        helper_id: 1,
        message: 'Hey Rahul! I have a spare fx-991EX you can borrow. Can hand it over outside TT canteen in the morning.',
        status: 'pending',
        offer_date: '2026-09-07',
      },
      {
        offer_id: 3,
        request_id: 4,
        helper_id: 1,
        message: 'Helped Priya explain 8086 registers and memory segmentation.',
        status: 'accepted',
        offer_date: '2026-09-04',
      },
    ],
    exchanges: [
      {
        exchange_id: 1,
        request_id: 4,
        requester_id: 2,
        helper_id: 1,
        due_date: '2026-09-04',
        completion_date: '2026-09-04',
        status: 'completed',
      },
    ],
    karma_txns: [
      { txn_id: 1, user_id: 1, exchange_id: null, amount: 50, type: 'signup_bonus' },
      { txn_id: 2, user_id: 2, exchange_id: null, amount: 50, type: 'signup_bonus' },
      { txn_id: 3, user_id: 3, exchange_id: null, amount: 50, type: 'signup_bonus' },
      { txn_id: 4, user_id: 4, exchange_id: null, amount: 50, type: 'signup_bonus' },
      { txn_id: 5, user_id: 5, exchange_id: null, amount: 100, type: 'admin_adjustment' },
      { txn_id: 6, user_id: 1, exchange_id: 1, amount: 20, type: 'help_provided' },
      { txn_id: 7, user_id: 2, exchange_id: 1, amount: -10, type: 'request_fulfilled' },
    ],
    ratings: [
      {
        rating_id: 1,
        exchange_id: 1,
        rater_id: 2,
        rated_id: 1,
        score: 5,
        comment: 'Super clear explanation of 8086 architecture! Highly recommended peer tutor.',
      },
      {
        rating_id: 2,
        exchange_id: 1,
        rater_id: 1,
        rated_id: 2,
        score: 5,
        comment: 'Great study partner, punctual and came prepared with questions.',
      },
    ],
    reports: [
      {
        report_id: 1,
        reported_by_id: 4,
        reported_user_id: 3,
        reason: 'Spam duplicate requests posted in the feed.',
        status: 'pending',
        created_date: '2026-09-07',
      },
    ],
    otps: [
      { otp_id: 1, email: 'student@vitstudent.ac.in', otp_code: '123456', expires_at: new Date(Date.now() + 3600000).toISOString() }
    ],
  };
}

function saveFallbackDb() {
  if (!fallbackDb) return;
  const dataFilePath = path.join(process.cwd(), '.db_fallback.json');
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(fallbackDb, null, 2), 'utf8');
  } catch (e) {
    // ignore
  }
}

// Check database pool configuration
function getPool() {
  if (pool) return pool;
  const connStr = process.env.DATABASE_URL;

  // If no DB URL or default localhost placeholder, check if we should try connection
  if (!connStr || connStr.includes('postgres:postgres@localhost')) {
    // Only attempt if explicit or else prepare fallback
  }

  try {
    const isSsl = connStr && (connStr.includes('supabase') || connStr.includes('pooler') || connStr.includes('sslmode=require'));
    pool = new Pool({
      connectionString: connStr,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 2500,
    });
    return pool;
  } catch (err) {
    useFallback = true;
    return null;
  }
}

/**
 * Universal query runner:
 * Executes SQL directly against PostgreSQL / Supabase,
 * or routes to local fallback store if PG is offline.
 */
export async function query(text, params = []) {
  if (!useFallback) {
    try {
      const p = getPool();
      if (p) {
        const res = await p.query(text, params);
        return res;
      }
    } catch (err) {
      // If PostgreSQL connection fails (e.g. invalid host or credentials before setup)
      // gracefully switch to persistent fallback store
      console.warn('PostgreSQL connection not reachable, running with local data store:', err.message);
      useFallback = true;
    }
  }

  // Run with fallback query handler
  return runFallbackQuery(text, params);
}

// Smart query router for fallback store to handle core operations
function runFallbackQuery(sql, params) {
  if (!fallbackDb) {
    fallbackDb = initFallbackDb();
  }

  const clean = sql.trim();
  const upper = clean.toUpperCase();

  // 1. SELECT Users by Email
  if (upper.includes('FROM USERS') && upper.includes('WHERE EMAIL =')) {
    const email = params[0]?.toLowerCase();
    const user = fallbackDb.users.find(u => u.email.toLowerCase() === email);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  // 2. SELECT Users by ID
  if (upper.includes('FROM USERS') && upper.includes('WHERE USER_ID =')) {
    const id = parseInt(params[0], 10);
    const user = fallbackDb.users.find(u => u.user_id === id);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  // 2b. SELECT All Users
  if (upper.includes('FROM USERS') && !upper.startsWith('INSERT') && !upper.startsWith('UPDATE') && !upper.startsWith('DELETE')) {
    return { rows: fallbackDb.users.map(u => ({ ...u })), rowCount: fallbackDb.users.length };
  }

  // 3. INSERT INTO Users
  if (upper.startsWith('INSERT INTO USERS')) {
    const newId = (fallbackDb.users.reduce((max, u) => Math.max(max, u.user_id), 0) || 0) + 1;
    const newUser = {
      user_id: newId,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'student',
      year: params[4] || 1,
      contact_info: params[5] || '',
      karma_balance: params[6] || 50,
      is_verified: params[7] !== undefined ? params[7] : false,
      status: 'active',
      room_number: params[8] || null,
      room_status: params[9] || 'unverified',
    };
    fallbackDb.users.push(newUser);
    saveFallbackDb();
    return { rows: [{ ...newUser }], rowCount: 1 };
  }

  // 4. UPDATE Users
  if (upper.startsWith('UPDATE USERS')) {
    if (upper.includes('SET IS_VERIFIED = TRUE')) {
      const email = params[0]?.toLowerCase();
      const user = fallbackDb.users.find(u => u.email.toLowerCase() === email);
      if (user) user.is_verified = true;
      saveFallbackDb();
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (upper.includes('SET ROOM_NUMBER =') && upper.includes('ROOM_STATUS =')) {
      const roomNum = params[0];
      const roomStatus = params[1];
      const id = parseInt(params[2], 10);
      const user = fallbackDb.users.find(u => u.user_id === id);
      if (user) {
        user.room_number = roomNum;
        user.room_status = roomStatus;
      }
      saveFallbackDb();
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (upper.includes("SET ROOM_STATUS = 'VERIFIED'")) {
      const id = parseInt(params[0], 10);
      const user = fallbackDb.users.find(u => u.user_id === id);
      if (user) {
        user.room_status = 'verified';
      }
      saveFallbackDb();
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (upper.includes("SET ROOM_STATUS = 'UNVERIFIED'")) {
      const id = parseInt(params[0], 10);
      const user = fallbackDb.users.find(u => u.user_id === id);
      if (user) {
        user.room_status = 'unverified';
        user.room_number = null;
      }
      saveFallbackDb();
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (upper.includes('SET ROOM_STATUS =')) {
      const roomStatus = params[0];
      const id = parseInt(params[1], 10);
      const user = fallbackDb.users.find(u => u.user_id === id);
      if (user) {
        user.room_status = roomStatus;
      }
      saveFallbackDb();
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (upper.includes('SET STATUS =')) {
      const status = params[0];
      const id = parseInt(params[1], 10);
      const user = fallbackDb.users.find(u => u.user_id === id);
      if (user) user.status = status;
      saveFallbackDb();
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (upper.includes('SET KARMA_BALANCE = GREATEST(0, KARMA_BALANCE - $1)')) {
      const amt = params[0];
      const id = parseInt(params[1], 10);
      const user = fallbackDb.users.find(u => u.user_id === id);
      if (user) user.karma_balance = Math.max(0, user.karma_balance - amt);
      saveFallbackDb();
      return { rows: user ? [user] : [], rowCount: 1 };
    }
    if (upper.includes('SET KARMA_BALANCE = KARMA_BALANCE + $1')) {
      const amt = params[0];
      const id = parseInt(params[1], 10);
      const user = fallbackDb.users.find(u => u.user_id === id);
      if (user) user.karma_balance = (user.karma_balance || 0) + amt;
      saveFallbackDb();
      return { rows: user ? [user] : [], rowCount: 1 };
    }
  }

  // 5. SELECT Requests (with filters or single request)
  if (upper.includes('FROM REQUESTS')) {
    if (upper.includes('WHERE REQUEST_ID =') || upper.includes('WHERE R.REQUEST_ID =')) {
      const id = parseInt(params[0], 10);
      const req = fallbackDb.requests.find(r => r.request_id === id);
      if (!req) return { rows: [], rowCount: 0 };
      const user = fallbackDb.users.find(u => u.user_id === req.requester_id);
      return {
        rows: [{
          ...req,
          requester_name: user?.name || 'Student',
          requester_year: user?.year || 1,
          requester_karma: user?.karma_balance || 50,
        }],
        rowCount: 1,
      };
    }

    let list = fallbackDb.requests.map(r => {
      const user = fallbackDb.users.find(u => u.user_id === r.requester_id);
      const offersCount = fallbackDb.offers.filter(o => o.request_id === r.request_id).length;
      return {
        ...r,
        requester_name: user?.name || 'Student',
        requester_year: user?.year || 1,
        requester_karma: user?.karma_balance || 50,
        offers_count: offersCount,
      };
    });

    return { rows: list, rowCount: list.length };
  }

  // 6. INSERT INTO Requests
  if (upper.startsWith('INSERT INTO REQUESTS')) {
    const newId = (fallbackDb.requests.reduce((max, r) => Math.max(max, r.request_id), 0) || 0) + 1;
    const newReq = {
      request_id: newId,
      requester_id: params[0],
      category: params[1],
      title: params[2],
      description: params[3],
      preferred_mode: params[4] || 'in-person',
      campus_location: params[5] || 'Campus',
      return_date: params[6] || null,
      skills_required: params[7] || null,
      status: 'open',
      created_date: new Date().toISOString().split('T')[0],
    };
    fallbackDb.requests.unshift(newReq);
    saveFallbackDb();
    return { rows: [newReq], rowCount: 1 };
  }

  if (upper.startsWith('UPDATE REQUESTS')) {
    const id = parseInt(params[params.length - 1], 10);
    const req = fallbackDb.requests.find(r => r.request_id === id);
    if (req) {
      if (upper.includes("STATUS = 'IN_PROGRESS'")) {
        req.status = 'in_progress';
      } else if (upper.includes("STATUS = 'COMPLETED'")) {
        req.status = 'completed';
      } else if (upper.includes("STATUS = 'CANCELLED'")) {
        req.status = 'cancelled';
      }
    }
    saveFallbackDb();
    return { rows: req ? [req] : [], rowCount: req ? 1 : 0 };
  }

  // 7. OFFERS
  if (upper.startsWith('INSERT INTO OFFERS')) {
    const newId = (fallbackDb.offers.reduce((max, o) => Math.max(max, o.offer_id), 0) || 0) + 1;
    const newOffer = {
      offer_id: newId,
      request_id: params[0],
      helper_id: params[1],
      message: params[2],
      status: 'pending',
      offer_date: new Date().toISOString().split('T')[0],
    };
    fallbackDb.offers.push(newOffer);
    saveFallbackDb();
    return { rows: [newOffer], rowCount: 1 };
  }

  if (upper.includes('FROM OFFERS')) {
    if (upper.includes('WHERE OFFER_ID =')) {
      const oId = parseInt(params[0], 10);
      const offer = fallbackDb.offers.find(o => o.offer_id === oId);
      return { rows: offer ? [{ ...offer }] : [], rowCount: offer ? 1 : 0 };
    }
    if (upper.includes('WHERE REQUEST_ID =')) {
      const reqId = parseInt(params[0], 10);
      const offers = fallbackDb.offers
        .filter(o => o.request_id === reqId)
        .map(o => {
          const helper = fallbackDb.users.find(u => u.user_id === o.helper_id);
          return {
            ...o,
            helper_name: helper?.name || 'Helper',
            helper_year: helper?.year || 1,
            helper_karma: helper?.karma_balance || 50,
            helper_contact: helper?.contact_info || '',
          };
        });
      return { rows: offers, rowCount: offers.length };
    }
  }

  if (upper.startsWith('UPDATE OFFERS')) {
    if (upper.includes("SET STATUS = 'ACCEPTED'")) {
      const oId = parseInt(params[0], 10);
      const offer = fallbackDb.offers.find(o => o.offer_id === oId);
      if (offer) offer.status = 'accepted';
    }
    if (upper.includes("SET STATUS = 'REJECTED'")) {
      const rId = parseInt(params[0], 10);
      const excludeId = parseInt(params[1], 10);
      fallbackDb.offers.forEach(o => {
        if (o.request_id === rId && o.offer_id !== excludeId) {
          o.status = 'rejected';
        }
      });
    }
    saveFallbackDb();
    return { rows: [], rowCount: 1 };
  }

  // 8. EXCHANGES
  if (upper.startsWith('INSERT INTO EXCHANGES')) {
    const newId = (fallbackDb.exchanges.reduce((max, e) => Math.max(max, e.exchange_id), 0) || 0) + 1;
    const newEx = {
      exchange_id: newId,
      request_id: params[0],
      requester_id: params[1],
      helper_id: params[2],
      due_date: params[3] || null,
      completion_date: null,
      status: 'active',
    };
    fallbackDb.exchanges.push(newEx);
    // Update request status to in_progress
    const req = fallbackDb.requests.find(r => r.request_id === params[0]);
    if (req) req.status = 'in_progress';
    saveFallbackDb();
    return { rows: [newEx], rowCount: 1 };
  }

  if (upper.includes('FROM EXCHANGES')) {
    if (upper.includes('WHERE E.EXCHANGE_ID =') || upper.includes('WHERE EXCHANGE_ID =')) {
      const id = parseInt(params[0], 10);
      const ex = fallbackDb.exchanges.find(e => e.exchange_id === id);
      if (!ex) return { rows: [], rowCount: 0 };
      const req = fallbackDb.requests.find(r => r.request_id === ex.request_id);
      const requester = fallbackDb.users.find(u => u.user_id === ex.requester_id);
      const helper = fallbackDb.users.find(u => u.user_id === ex.helper_id);
      return {
        rows: [{
          ...ex,
          title: req?.title,
          category: req?.category,
          requester_name: requester?.name,
          requester_contact: requester?.contact_info,
          requester_room: requester?.room_number || null,
          helper_name: helper?.name,
          helper_contact: helper?.contact_info,
          helper_room: helper?.room_number || null,
        }],
        rowCount: 1,
      };
    }

    const list = fallbackDb.exchanges.map(ex => {
      const req = fallbackDb.requests.find(r => r.request_id === ex.request_id);
      const requester = fallbackDb.users.find(u => u.user_id === ex.requester_id);
      const helper = fallbackDb.users.find(u => u.user_id === ex.helper_id);
      return {
        ...ex,
        title: req?.title,
        category: req?.category,
        requester_name: requester?.name,
        requester_contact: requester?.contact_info,
        requester_room: requester?.room_number || null,
        helper_name: helper?.name,
        helper_contact: helper?.contact_info,
        helper_room: helper?.room_number || null,
      };
    });
    return { rows: list, rowCount: list.length };
  }

  if (upper.startsWith('UPDATE EXCHANGES')) {
    const id = parseInt(params[params.length - 1], 10);
    const ex = fallbackDb.exchanges.find(e => e.exchange_id === id);
    if (ex) {
      if (upper.includes("STATUS = 'COMPLETED'")) {
        ex.status = 'completed';
        ex.completion_date = new Date().toISOString().split('T')[0];
        const req = fallbackDb.requests.find(r => r.request_id === ex.request_id);
        if (req) req.status = 'completed';
      }
    }
    saveFallbackDb();
    return { rows: ex ? [ex] : [], rowCount: ex ? 1 : 0 };
  }

  // 9. KARMA_TXNS
  if (upper.startsWith('INSERT INTO KARMA_TXNS')) {
    const newId = (fallbackDb.karma_txns.reduce((max, k) => Math.max(max, k.txn_id), 0) || 0) + 1;
    const newTxn = {
      txn_id: newId,
      user_id: params[0],
      exchange_id: params[1],
      amount: params[2],
      type: params[3],
    };
    fallbackDb.karma_txns.push(newTxn);
    saveFallbackDb();
    return { rows: [newTxn], rowCount: 1 };
  }

  if (upper.includes('FROM KARMA_TXNS')) {
    if (upper.includes('WHERE EXCHANGE_ID =')) {
      const eid = parseInt(params[0], 10);
      const txns = fallbackDb.karma_txns.filter(t => t.exchange_id === eid);
      return { rows: txns, rowCount: txns.length };
    }
    if (upper.includes('WHERE USER_ID =')) {
      const uid = parseInt(params[0], 10);
      const txns = fallbackDb.karma_txns.filter(t => t.user_id === uid);
      return { rows: txns, rowCount: txns.length };
    }
    return { rows: fallbackDb.karma_txns, rowCount: fallbackDb.karma_txns.length };
  }

  // 10. RATINGS
  if (upper.startsWith('INSERT INTO RATINGS')) {
    const newId = (fallbackDb.ratings.reduce((max, r) => Math.max(max, r.rating_id), 0) || 0) + 1;
    const newRate = {
      rating_id: newId,
      exchange_id: params[0],
      rater_id: params[1],
      rated_id: params[2],
      score: params[3],
      comment: params[4],
    };
    fallbackDb.ratings.push(newRate);
    saveFallbackDb();
    return { rows: [newRate], rowCount: 1 };
  }

  if (upper.includes('FROM RATINGS') && upper.includes('WHERE RATED_ID =')) {
    const ratedId = parseInt(params[0], 10);
    const ratings = fallbackDb.ratings
      .filter(r => r.rated_id === ratedId)
      .map(r => {
        const rater = fallbackDb.users.find(u => u.user_id === r.rater_id);
        return { ...r, rater_name: rater?.name || 'Student' };
      });
    return { rows: ratings, rowCount: ratings.length };
  }

  // 11. ITEMS
  if (upper.startsWith('INSERT INTO ITEMS')) {
    const newId = (fallbackDb.items.reduce((max, i) => Math.max(max, i.item_id), 0) || 0) + 1;
    const newItem = {
      item_id: newId,
      owner_id: params[0],
      item_name: params[1],
      condition: params[2],
      available_from: params[3],
      available_to: params[4],
      status: 'available',
    };
    fallbackDb.items.push(newItem);
    saveFallbackDb();
    return { rows: [newItem], rowCount: 1 };
  }

  if (upper.includes('FROM ITEMS')) {
    if (upper.includes('WHERE OWNER_ID =')) {
      const ownerId = parseInt(params[0], 10);
      const items = fallbackDb.items.filter(i => i.owner_id === ownerId);
      return { rows: items, rowCount: items.length };
    }
    const allItems = fallbackDb.items.map(item => {
      const owner = fallbackDb.users.find(u => u.user_id === item.owner_id);
      return { ...item, owner_name: owner?.name || 'Student' };
    });
    return { rows: allItems, rowCount: allItems.length };
  }

  // 12. REPORTS
  if (upper.startsWith('INSERT INTO REPORTS')) {
    const newId = (fallbackDb.reports.reduce((max, r) => Math.max(max, r.report_id), 0) || 0) + 1;
    const newRep = {
      report_id: newId,
      reported_by_id: params[0],
      reported_user_id: params[1],
      reason: params[2],
      status: 'pending',
      created_date: new Date().toISOString().split('T')[0],
    };
    fallbackDb.reports.push(newRep);
    saveFallbackDb();
    return { rows: [newRep], rowCount: 1 };
  }

  if (upper.includes('FROM REPORTS')) {
    const reps = fallbackDb.reports.map(r => {
      const by = fallbackDb.users.find(u => u.user_id === r.reported_by_id);
      const target = fallbackDb.users.find(u => u.user_id === r.reported_user_id);
      return {
        ...r,
        reported_by_name: by?.name || 'Student',
        reported_user_name: target?.name || 'Student',
      };
    });
    return { rows: reps, rowCount: reps.length };
  }

  // 13. OTPS
  if (upper.startsWith('INSERT INTO OTPS') || upper.startsWith('REPLACE INTO OTPS')) {
    fallbackDb.otps = fallbackDb.otps.filter(o => o.email.toLowerCase() !== params[0]?.toLowerCase());
    const newOtp = {
      otp_id: (fallbackDb.otps.length || 0) + 1,
      email: params[0],
      otp_code: params[1],
      expires_at: params[2],
    };
    fallbackDb.otps.push(newOtp);
    saveFallbackDb();
    return { rows: [newOtp], rowCount: 1 };
  }

  if (upper.includes('FROM OTPS') && upper.includes('WHERE EMAIL =')) {
    const email = params[0]?.toLowerCase();
    const otp = fallbackDb.otps.find(o => o.email.toLowerCase() === email);
    return { rows: otp ? [otp] : [], rowCount: otp ? 1 : 0 };
  }

  // Fallback default
  return { rows: [], rowCount: 0 };
}

export function isUsingFallback() {
  return useFallback;
}
