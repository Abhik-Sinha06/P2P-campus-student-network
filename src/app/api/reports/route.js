import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { reported_user_id, reason } = await request.json();

    if (!reported_user_id || !reason) {
      return NextResponse.json({ error: 'Target user ID and reason are required' }, { status: 400 });
    }

    if (parseInt(reported_user_id, 10) === user.user_id) {
      return NextResponse.json({ error: 'You cannot report yourself' }, { status: 400 });
    }

    const repRes = await query(
      `INSERT INTO reports (reported_by_id, reported_user_id, reason, status, created_date)
       VALUES ($1, $2, $3, 'pending', CURRENT_DATE) RETURNING *`,
      [user.user_id, parseInt(reported_user_id, 10), reason.trim()]
    );

    return NextResponse.json({
      success: true,
      message: 'Report submitted to platform administration for review.',
      report: repRes.rows[0],
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json({ error: 'Failed to submit report: ' + error.message }, { status: 500 });
  }
}
