import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const dataFilePath = path.join(process.cwd(), '.db_fallback.json');
    if (fs.existsSync(dataFilePath)) {
      fs.unlinkSync(dataFilePath);
    }
    return NextResponse.json({ success: true, message: 'Database reset to initial demo seeds.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
