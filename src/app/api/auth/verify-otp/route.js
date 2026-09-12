import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check OTP
    const otpRes = await query(
      `SELECT * FROM otps WHERE email = $1 ORDER BY otp_id DESC LIMIT 1`,
      [normalizedEmail]
    );

    if (otpRes.rows.length === 0) {
      return NextResponse.json({ error: 'No OTP requested for this email' }, { status: 400 });
    }

    const record = otpRes.rows[0];
    if (record.otp_code !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // 2. Mark user verified and record signup bonus karma transaction
    await query(`UPDATE users SET is_verified = TRUE WHERE email = $1`, [normalizedEmail]);

    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [normalizedEmail]);
    const user = userRes.rows[0];

    // Check if signup bonus already logged
    const existingBonus = await query(
      `SELECT * FROM karma_txns WHERE user_id = $1 AND type = 'signup_bonus'`,
      [user.user_id]
    );

    if (existingBonus.rows.length === 0) {
      await query(
        `INSERT INTO karma_txns (user_id, exchange_id, amount, type) VALUES ($1, $2, $3, $4)`,
        [user.user_id, null, 50, 'signup_bonus']
      );
    }

    // 3. Issue JWT token
    const token = signToken({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account verified successfully! 50 Karma points granted.',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        year: user.year,
        karma_balance: user.karma_balance,
        is_verified: true,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Verification failed: ' + error.message }, { status: 500 });
  }
}
