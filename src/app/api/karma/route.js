import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get live user balance
    const userRes = await query('SELECT karma_balance FROM users WHERE user_id = $1', [user.user_id]);
    const balance = userRes.rows[0]?.karma_balance || 0;

    // Get karma ledger history (without timestamp)
    const txnsRes = await query(
      'SELECT * FROM karma_txns WHERE user_id = $1 ORDER BY txn_id DESC',
      [user.user_id]
    );

    return NextResponse.json({
      balance,
      transactions: txnsRes.rows,
    });
  } catch (error) {
    console.error('Karma fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch karma ledger' }, { status: 500 });
  }
}
