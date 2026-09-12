import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const res = await query('SELECT * FROM ratings WHERE rated_id = $1 ORDER BY rating_id DESC', [userId]);
    const ratings = res.rows;

    const count = ratings.length;
    const avgScore = count > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / count).toFixed(1)
      : 5.0;

    // Get completed exchange count
    const exRes = await query(
      "SELECT COUNT(*) as completed_count FROM exchanges WHERE (requester_id = $1 OR helper_id = $1) AND status = 'completed'",
      [userId]
    );
    const completedCount = parseInt(exRes.rows[0]?.completed_count || 0, 10);

    return NextResponse.json({
      average_rating: parseFloat(avgScore),
      total_reviews: count,
      completed_exchanges: completedCount,
      ratings,
    });
  } catch (error) {
    console.error('Fetch ratings error:', error);
    return NextResponse.json({ error: 'Failed to load ratings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { exchange_id, score, comment } = await request.json();

    if (!exchange_id || !score) {
      return NextResponse.json({ error: 'Exchange ID and rating score (1-5) are required' }, { status: 400 });
    }

    const numScore = parseInt(score, 10);
    if (numScore < 1 || numScore > 5) {
      return NextResponse.json({ error: 'Score must be between 1 and 5 stars' }, { status: 400 });
    }

    // Verify exchange
    const exRes = await query('SELECT * FROM exchanges WHERE exchange_id = $1', [exchange_id]);
    if (exRes.rows.length === 0) {
      return NextResponse.json({ error: 'Exchange not found' }, { status: 404 });
    }
    const exchange = exRes.rows[0];

    // Determine who is being rated
    const ratedId = exchange.requester_id === user.user_id ? exchange.helper_id : exchange.requester_id;

    // Check if user already rated this exchange
    const existing = await query(
      'SELECT * FROM ratings WHERE exchange_id = $1 AND rater_id = $2',
      [exchange_id, user.user_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'You have already submitted a rating for this exchange' }, { status: 400 });
    }

    const ratingRes = await query(
      `INSERT INTO ratings (exchange_id, rater_id, rated_id, score, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [exchange_id, user.user_id, ratedId, numScore, comment?.trim() || '']
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you! Rating and feedback submitted.',
      rating: ratingRes.rows[0],
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return NextResponse.json({ error: 'Failed to submit rating: ' + error.message }, { status: 500 });
  }
}
