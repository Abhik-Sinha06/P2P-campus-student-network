import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { KARMA_RULES } from '@/lib/karma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const location = searchParams.get('location');

    const res = await query('SELECT * FROM requests ORDER BY request_id DESC');
    let requests = res.rows;

    const filter = searchParams.get('filter');
    const user = getUserFromRequest(request);

    if (filter === 'mine') {
      if (!user) {
        return NextResponse.json({ requests: [] });
      }
      requests = requests.filter(r => r.requester_id === user.user_id);
    }

    if (category && category !== 'All') {
      requests = requests.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    if (location && location !== 'All') {
      requests = requests.filter(r => r.campus_location && r.campus_location.toLowerCase().includes(location.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      requests = requests.filter(r => 
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.skills_required?.toLowerCase().includes(q) ||
        r.campus_location?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { category, title, description, preferred_mode, campus_location, return_date, skills_required } = await request.json();

    if (!category || !title || !description) {
      return NextResponse.json({ error: 'Category, title, and description are required' }, { status: 400 });
    }

    // Check user Karma balance and room verification
    const userRes = await query('SELECT karma_balance, status, room_number, room_status, role FROM users WHERE user_id = $1', [user.user_id]);
    const currentUser = userRes.rows[0];

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.status === 'suspended') {
      return NextResponse.json({ error: 'Suspended users cannot post requests' }, { status: 403 });
    }

    // Gatekeeping: Student room number must be verified by Admin
    if (currentUser.role !== 'admin' && currentUser.room_status !== 'verified') {
      return NextResponse.json({
        error: 'Hostel room verification required! As a campus security measure, please enter your hostel room number in your Profile and get it verified by the Admin before posting requests.',
        needs_room_verification: true,
        room_status: currentUser.room_status || 'unverified',
      }, { status: 403 });
    }

    if (currentUser.karma_balance < KARMA_RULES.MIN_REQUIRED_TO_POST) {
      return NextResponse.json({
        error: `Insufficient Karma points! You have ${currentUser.karma_balance} points, but a minimum of ${KARMA_RULES.MIN_REQUIRED_TO_POST} Karma points is required to post a request. Earn points by helping other students!`,
        current_balance: currentUser.karma_balance,
        min_required: KARMA_RULES.MIN_REQUIRED_TO_POST,
      }, { status: 400 });
    }

    const newReq = await query(
      `INSERT INTO requests (requester_id, category, title, description, preferred_mode, campus_location, return_date, skills_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open') RETURNING *`,
      [
        user.user_id,
        category,
        title.trim(),
        description.trim(),
        preferred_mode || 'in-person',
        campus_location || 'Campus',
        return_date || null,
        skills_required || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Request posted successfully!',
      request: newReq.rows[0],
    });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to create request: ' + error.message }, { status: 500 });
  }
}
