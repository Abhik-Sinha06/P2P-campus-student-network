import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // 1. Fetch reports sorted by date raised (FR-3.5.1)
    const reportsRes = await query('SELECT * FROM reports ORDER BY report_id DESC');

    // 2. Fetch users summary
    const usersRes = await query('SELECT user_id, name, email, role, year, karma_balance, status FROM users ORDER BY user_id ASC');

    // 3. Platform metrics
    const stats = {
      total_students: usersRes.rows.filter(u => u.role === 'student').length,
      open_reports: reportsRes.rows.filter(r => r.status === 'pending').length,
      suspended_users: usersRes.rows.filter(u => u.status === 'suspended').length,
    };

    return NextResponse.json({
      stats,
      reports: reportsRes.rows,
      users: usersRes.rows,
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { action, report_id, user_id, request_id } = await request.json();

    if (action === 'warn_user') {
      await query("UPDATE users SET status = 'warned' WHERE user_id = $1", [user_id]);
      if (report_id) {
        await query("UPDATE reports SET status = 'warned' WHERE report_id = $1", [report_id]);
      }
      return NextResponse.json({ success: true, message: 'Student has been warned.' });
    }

    if (action === 'suspend_user') {
      await query("UPDATE users SET status = 'suspended' WHERE user_id = $1", [user_id]);
      if (report_id) {
        await query("UPDATE reports SET status = 'suspended' WHERE report_id = $1", [report_id]);
      }
      return NextResponse.json({ success: true, message: 'Student account has been suspended.' });
    }

    if (action === 'reinstate_user') {
      await query("UPDATE users SET status = 'active' WHERE user_id = $1", [user_id]);
      return NextResponse.json({ success: true, message: 'Student account has been reinstated to active.' });
    }

    if (action === 'dismiss_report') {
      if (report_id) {
        await query("UPDATE reports SET status = 'dismissed' WHERE report_id = $1", [report_id]);
      }
      return NextResponse.json({ success: true, message: 'Report dismissed.' });
    }

    if (action === 'remove_request') {
      await query("UPDATE requests SET status = 'cancelled' WHERE request_id = $1", [request_id]);
      return NextResponse.json({ success: true, message: 'Inappropriate request removed.' });
    }

    return NextResponse.json({ error: 'Unknown admin action' }, { status: 400 });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Action failed: ' + error.message }, { status: 500 });
  }
}
