import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { request_id, message } = await request.json();

    if (!request_id || !message) {
      return NextResponse.json({ error: 'Request ID and message are required' }, { status: 400 });
    }

    // Verify request exists and is open
    const reqRes = await query('SELECT * FROM requests WHERE request_id = $1', [request_id]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const targetReq = reqRes.rows[0];
    if (targetReq.status !== 'open') {
      return NextResponse.json({ error: 'This request is no longer accepting offers' }, { status: 400 });
    }

    if (targetReq.requester_id === user.user_id) {
      return NextResponse.json({ error: 'You cannot make an offer on your own request' }, { status: 400 });
    }

    // Gatekeeping: Helper must have verified room number
    const helperRes = await query('SELECT role, room_status FROM users WHERE user_id = $1', [user.user_id]);
    const helperUser = helperRes.rows[0];
    if (helperUser && helperUser.role !== 'admin' && helperUser.room_status !== 'verified') {
      return NextResponse.json({
        error: 'Hostel room verification required! As a campus security measure, please enter your hostel room number in your Profile and get it verified by the Admin before offering help or lending items.',
        needs_room_verification: true,
        room_status: helperUser.room_status || 'unverified',
      }, { status: 403 });
    }

    // Insert offer
    const offerRes = await query(
      `INSERT INTO offers (request_id, helper_id, message, status, offer_date)
       VALUES ($1, $2, $3, 'pending', CURRENT_DATE) RETURNING *`,
      [request_id, user.user_id, message.trim()]
    );

    return NextResponse.json({
      success: true,
      message: 'Offer submitted successfully!',
      offer: offerRes.rows[0],
    });
  } catch (error) {
    console.error('Submit offer error:', error);
    return NextResponse.json({ error: 'Failed to submit offer: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { offer_id, action } = await request.json();

    if (action !== 'accept') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    // Get offer details
    const offerRes = await query('SELECT * FROM offers WHERE offer_id = $1', [offer_id]);
    if (offerRes.rows.length === 0) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    const offer = offerRes.rows[0];

    // Verify requester ownership
    const reqRes = await query('SELECT * FROM requests WHERE request_id = $1', [offer.request_id]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: 'Associated request not found' }, { status: 404 });
    }
    const targetReq = reqRes.rows[0];

    if (targetReq.requester_id !== user.user_id) {
      return NextResponse.json({ error: 'Only the requester can accept offers' }, { status: 403 });
    }

    if (targetReq.status !== 'open') {
      return NextResponse.json({ error: 'This request already has an active or completed exchange' }, { status: 400 });
    }

    // 1. Update accepted offer status
    await query("UPDATE offers SET status = 'accepted' WHERE offer_id = $1", [offer_id]);

    // 2. Reject other offers for this request
    await query("UPDATE offers SET status = 'rejected' WHERE request_id = $1 AND offer_id != $2", [offer.request_id, offer_id]);

    // 3. Update request status to in_progress (FR-3.1.4)
    await query("UPDATE requests SET status = 'in_progress' WHERE request_id = $1", [offer.request_id]);

    // 4. Create exchange record locking in terms & return date
    const dueDate = targetReq.return_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const exRes = await query(
      `INSERT INTO exchanges (request_id, requester_id, helper_id, due_date, status)
       VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
      [offer.request_id, targetReq.requester_id, offer.helper_id, dueDate]
    );

    return NextResponse.json({
      success: true,
      message: 'Offer accepted! Match confirmed and exchange is now In Progress.',
      exchange: exRes.rows[0],
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    return NextResponse.json({ error: 'Failed to process offer: ' + error.message }, { status: 500 });
  }
}
