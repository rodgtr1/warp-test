import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import data from '@/data/rooms.json';

export async function GET() {
  logger.api('GET /api/rooms - Fetching all rooms');
  logger.state('Rooms count', { count: data.rooms.length });
  
  return NextResponse.json({ rooms: data.rooms });
}
