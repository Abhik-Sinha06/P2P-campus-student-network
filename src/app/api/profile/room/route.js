import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

/**
 * Validates hostel room number format
 * Blocks: A, B, C, D
 * Rooms: 100 to 1650, 50 rooms per floor (100-150, 200-250, ..., 1600-1650)
 */
export function validateRoomNumber(roomInput) {
  let roomStr = '';
  if (typeof roomInput === 'object' && roomInput !== null) {
    const b = roomInput.block || '';
    const f = roomInput.floor;
    const r = roomInput.room;
    if (f !== undefined && r !== undefined) {
      const roomPadded = String(r).padStart(2, '0');
      roomStr = `${b}-${f}${roomPadded}`;
    } else {
      roomStr = roomInput.room_number || '';
    }
  } else if (typeof roomInput === 'string') {
    roomStr = roomInput;
  }

  if (!roomStr || typeof roomStr !== 'string') return { valid: false, error: 'Room number is required' };

  // Accepts "B-325", "B 325", "B325", or separate block & num
  const match = roomStr.trim().toUpperCase().match(/^([ABCD])\s*[-_]?\s*(\d{3,4})$/);
  if (!match) {
    return {
      valid: false,
      error: 'Invalid format. Please enter Block (A, B, C, or D) and Room number (e.g. B-325, A-114).',
    };
  }

  const block = match[1];
  const num = parseInt(match[2], 10);

  if (num < 100 || num > 1650) {
    return {
      valid: false,
      error: 'Room numbers must be between 100 and 1650 (Floors 1 to 16).',
    };
  }

  const floor = Math.floor(num / 100);
  const roomOnFloor = num % 100;

  if (floor < 1 || floor > 16) {
    return { valid: false, error: 'Invalid floor number. Campus hostels have floors 1 to 16.' };
  }

  if (roomOnFloor > 50) {
    return {
      valid: false,
      error: `Invalid room ${num}. Each floor has 50 rooms (e.g. ${floor}00 to ${floor}50).`,
    };
  }

  return {
    valid: true,
    formatted: `${block}-${num}`,
  };
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRoomNumber(body.room_number || body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const formattedRoom = validation.formatted;

    // Update user: set room_number and set room_status to 'pending'
    await query(
      'UPDATE users SET room_number = $1, room_status = $2 WHERE user_id = $3',
      [formattedRoom, 'pending', user.user_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Room number submitted! Your room verification request has been sent to the Admin.',
      room_number: formattedRoom,
      room_status: 'pending',
    });
  } catch (error) {
    console.error('Room submission error:', error);
    return NextResponse.json({ error: 'Failed to submit room number: ' + error.message }, { status: 500 });
  }
}
