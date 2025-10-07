
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    const data = await fs.readFile(dbPath, 'utf-8');
    const jsonData = JSON.parse(data);
    return NextResponse.json(jsonData.tasks);
  } catch (error) {
    console.error('Error reading database:', error);
    return NextResponse.json({ error: 'Error reading database' }, { status: 500 });
  }
}
