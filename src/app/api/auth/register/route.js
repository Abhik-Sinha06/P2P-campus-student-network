import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, validateVitEmail } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password, year, contact_info } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // 1. Strict VIT domain check
    if (!validateVitEmail(email)) {
      return NextResponse.json(
        { error: 'Registration is restricted strictly to @vitstudent.ac.in email addresses' },
        { status: 403 }
      );
    }

    // 2. Check if user already exists
    const existing = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this VIT email already exists' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashed = await hashPassword(password);

    // 4. Create user with is_verified = false
    const userRes = await query(
      `INSERT INTO users (name, email, password_hash, role, year, contact_info, karma_balance, is_verified, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING user_id, name, email, karma_balance`,
      [name.trim(), email.toLowerCase().trim(), hashed, 'student', year || 1, contact_info || '', 50, false, 'active']
    );

    // 5. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await query(
      `INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)`,
      [email.toLowerCase().trim(), otpCode, expiresAt]
    );

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your VIT email address',
      email: email.toLowerCase().trim(),
      // OTP preview provided for easy lab demonstration / offline testing
      otp_preview: otpCode,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Failed to create account: ' + error.message }, { status: 500 });
  }
}
