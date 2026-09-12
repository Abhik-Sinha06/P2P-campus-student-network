import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const user = getUserFromRequest(request);

    if (filter === 'mine') {
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      const res = await query('SELECT * FROM items WHERE owner_id = $1 ORDER BY item_id DESC', [user.user_id]);
      return NextResponse.json({ items: res.rows });
    }

    const res = await query('SELECT * FROM items WHERE status = $1 ORDER BY item_id DESC', ['available']);
    return NextResponse.json({ items: res.rows });
  } catch (error) {
    console.error('Fetch items error:', error);
    return NextResponse.json({ error: 'Failed to load items' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { item_name, condition, available_from, available_to } = await request.json();

    if (!item_name) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO items (owner_id, item_name, condition, available_from, available_to, status)
       VALUES ($1, $2, $3, $4, $5, 'available') RETURNING *`,
      [
        user.user_id,
        item_name.trim(),
        condition || 'Good',
        available_from || new Date().toISOString().split('T')[0],
        available_to || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Item listed for lending successfully!',
      item: res.rows[0],
    });
  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json({ error: 'Failed to list item: ' + error.message }, { status: 500 });
  }
}
