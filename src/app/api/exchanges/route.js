import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { processExchangeKarma } from '@/lib/karma';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const res = await query('SELECT * FROM exchanges ORDER BY exchange_id DESC');
    // Filter exchanges where user is either requester or helper
    const userExchanges = res.rows.filter(
      (e) => e.requester_id === user.user_id || e.helper_id === user.user_id
    );

    // Attach ratings if already given
    const ratingsRes = await query('SELECT * FROM ratings WHERE rater_id = $1', [user.user_id]);
    const ratedExchangeIds = new Set(ratingsRes.rows.map(r => r.exchange_id));

    const enriched = userExchanges.map(e => ({
      ...e,
      has_rated: ratedExchangeIds.has(e.exchange_id),
      user_role: e.requester_id === user.user_id ? 'requester' : 'helper',
    }));

    return NextResponse.json({ exchanges: enriched });
  } catch (error) {
    console.error('Fetch exchanges error:', error);
    return NextResponse.json({ error: 'Failed to load exchanges' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { exchange_id, action } = await request.json();

    if (action !== 'complete') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    // 1. Verify exchange
    const exRes = await query('SELECT * FROM exchanges WHERE exchange_id = $1', [exchange_id]);
    if (exRes.rows.length === 0) {
      return NextResponse.json({ error: 'Exchange not found' }, { status: 404 });
    }

    const exchange = exRes.rows[0];

    // Must be either requester or helper
    if (exchange.requester_id !== user.user_id && exchange.helper_id !== user.user_id) {
      return NextResponse.json({ error: 'You are not a participant in this exchange' }, { status: 403 });
    }

    if (exchange.status === 'completed') {
      return NextResponse.json({ message: 'Exchange is already completed' });
    }

    // 2. Mark as completed
    await query(
      "UPDATE exchanges SET status = 'completed', completion_date = CURRENT_DATE WHERE exchange_id = $1",
      [exchange_id]
    );

    // 3. Mark request as completed
    await query(
      "UPDATE requests SET status = 'completed' WHERE request_id = $1",
      [exchange.request_id]
    );

    // 4. Process Karma: -10 for requester, +20 for helper
    const karmaResult = await processExchangeKarma(exchange_id);

    return NextResponse.json({
      success: true,
      message: 'Exchange completed successfully! Karma points updated (+20 for Helper, -10 for Requester).',
      karmaResult,
      promptRating: true,
    });
  } catch (error) {
    console.error('Complete exchange error:', error);
    return NextResponse.json({ error: 'Failed to complete exchange: ' + error.message }, { status: 500 });
  }
}
