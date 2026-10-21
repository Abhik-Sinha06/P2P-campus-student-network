import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const requestId = parseInt(params.id, 10);
    const user = getUserFromRequest(request);

    // Fetch request details
    const reqRes = await query('SELECT * FROM requests WHERE request_id = $1', [requestId]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    const reqData = reqRes.rows[0];

    // Fetch requester profile & trust rating
    const userRes = await query(
      'SELECT user_id, name, email, year, karma_balance, contact_info, room_number FROM users WHERE user_id = $1',
      [reqData.requester_id]
    );
    const requester = userRes.rows[0] || {};

    // Get average rating for requester
    const ratingRes = await query('SELECT score FROM ratings WHERE rated_id = $1', [reqData.requester_id]);
    const avgScore = ratingRes.rows.length > 0
      ? (ratingRes.rows.reduce((sum, r) => sum + r.score, 0) / ratingRes.rows.length).toFixed(1)
      : null;

    // Fetch offers for this request
    const offersRes = await query('SELECT * FROM offers WHERE request_id = $1', [requestId]);

    // Check if exchange already created
    const exRes = await query('SELECT * FROM exchanges WHERE request_id = $1', [requestId]);
    const exchange = exRes.rows[0] || null;

    // Contact info and Room privacy rule:
    // Only visible after a match is accepted
    const isRequester = user && user.user_id === reqData.requester_id;
    const isAcceptedHelper = exchange && user && user.user_id === exchange.helper_id;
    const canSeeContact = isRequester || isAcceptedHelper;

    return NextResponse.json({
      request: {
        ...reqData,
        requester_name: requester.name,
        requester_year: requester.year,
        requester_karma: requester.karma_balance,
        requester_avg_rating: avgScore,
        requester_contact: canSeeContact ? requester.contact_info : 'Available once match is confirmed',
        requester_room: canSeeContact ? requester.room_number : 'Available once match is confirmed',
      },
      offers: offersRes.rows,
      exchange,
      canSeeContact,
    });
  } catch (error) {
    console.error('Fetch request details error:', error);
    return NextResponse.json({ error: 'Failed to load request details' }, { status: 500 });
  }
}
