import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { isTimeSlotAvailable } from '@/lib/bookings';
import { Booking } from '@/lib/types';
import data from '@/data/rooms.json';

// In-memory store (resets on server restart)
let bookings: Booking[] = [...data.bookings];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const roomId = searchParams.get('roomId');
  
  logger.api('GET /api/bookings', { date, roomId });
  
  let filtered = bookings;
  
  if (date) {
    filtered = filtered.filter(b => b.date === date);
  }
  if (roomId) {
    filtered = filtered.filter(b => b.roomId === roomId);
  }
  
  logger.state('Returning bookings', { count: filtered.length });
  return NextResponse.json({ bookings: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.api('POST /api/bookings - Creating new booking', body);
    
    const { roomId, date, startTime, endTime, title, organizer } = body;
    
    // Validate required fields
    if (!roomId || !date || !startTime || !endTime || !title || !organizer) {
      logger.error('Missing required booking fields', body);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check availability (this uses the buggy function)
    logger.state('Checking slot availability before booking');
    const available = isTimeSlotAvailable(bookings, roomId, date, startTime, endTime);
    
    logger.state('Availability check result', { 
      available, 
      note: 'This result may be incorrect due to inverted logic bug' 
    });
    
    if (!available) {
      logger.error('Booking rejected: Time slot not available', {
        roomId,
        date,
        startTime,
        endTime
      });
      return NextResponse.json(
        { error: 'Time slot is not available' },
        { status: 409 }
      );
    }
    
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      roomId,
      date,
      startTime,
      endTime,
      title,
      organizer,
    };
    
    bookings.push(newBooking);
    
    logger.state('Booking created successfully', { booking: newBooking });
    return NextResponse.json({ booking: newBooking }, { status: 201 });
    
  } catch (error) {
    logger.error('Failed to create booking', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
