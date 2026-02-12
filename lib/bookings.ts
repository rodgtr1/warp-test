import { Booking } from './types';
import logger from './logger';

/**
 * Check if a time slot is available for booking
 * Returns true if the slot is free, false if there's a conflict
 */
export function isTimeSlotAvailable(
  existingBookings: Booking[],
  roomId: string,
  date: string,
  startTime: string,
  endTime: string
): boolean {
  logger.debug('Checking time slot availability', {
    roomId,
    date,
    startTime,
    endTime,
    existingBookingsCount: existingBookings.length
  });

  const roomBookings = existingBookings.filter(
    b => b.roomId === roomId && b.date === date
  );

  logger.debug('Found existing bookings for room on date', {
    roomId,
    date,
    count: roomBookings.length,
    bookings: roomBookings.map(b => ({ start: b.startTime, end: b.endTime, title: b.title }))
  });

  const requestedStart = timeToMinutes(startTime);
  const requestedEnd = timeToMinutes(endTime);

  for (const booking of roomBookings) {
    const existingStart = timeToMinutes(booking.startTime);
    const existingEnd = timeToMinutes(booking.endTime);

    logger.debug('Comparing with existing booking', {
      existing: { start: booking.startTime, end: booking.endTime, minutes: { start: existingStart, end: existingEnd } },
      requested: { start: startTime, end: endTime, minutes: { start: requestedStart, end: requestedEnd } }
    });

    // =================================================================
    // BUG #2: Overlap detection logic is INVERTED
    // This condition checks if slots DON'T overlap, but we return false
    // when they DON'T overlap (meaning we incorrectly block free slots)
    // and return true when they DO overlap (allowing double bookings)
    // 
    // Correct logic: overlap exists if NOT (requestedEnd <= existingStart OR requestedStart >= existingEnd)
    // Current logic: returns "unavailable" when there's NO overlap
    // =================================================================
    const noOverlap = requestedEnd <= existingStart || requestedStart >= existingEnd;
    
    if (noOverlap) {
      logger.state('Overlap check result: treating non-overlapping as conflict', {
        noOverlap,
        result: 'returning FALSE (incorrectly blocking)',
        existingBooking: booking.title
      });
      return false; // BUG: Should return true (available) when no overlap
    }
  }

  logger.state('No conflicts detected (but logic is inverted)', {
    result: 'returning TRUE (incorrectly allowing)',
    note: 'This may allow double-booking if there ARE overlapping bookings'
  });
  
  return true; // BUG: Reaches here only if ALL bookings overlap (should be blocked)
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Generate available time slots for a room on a given date
 */
export function getAvailableSlots(
  existingBookings: Booking[],
  roomId: string,
  date: string
): { startTime: string; endTime: string }[] {
  const slots = [];
  const dayStart = 8; // 8 AM
  const dayEnd = 18;  // 6 PM

  for (let hour = dayStart; hour < dayEnd; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    if (isTimeSlotAvailable(existingBookings, roomId, date, startTime, endTime)) {
      slots.push({ startTime, endTime });
    }
  }

  return slots;
}
