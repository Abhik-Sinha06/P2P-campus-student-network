import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const res = await query('SELECT user_id, name, email, role, year, contact_info, karma_balance, is_verified, status, room_number, room_status FROM users WHERE user_id = $1', [auth.user_id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
