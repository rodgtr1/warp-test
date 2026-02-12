'use client';

import { useState, useEffect } from 'react';
import { Booking, Room } from '@/lib/types';
import { logger } from '@/lib/logger';
import { formatDateForDisplay } from '@/lib/dates';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.action('My Bookings page mounted');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/rooms'),
      ]);

      const bookingsData = await bookingsRes.json();
      const roomsData = await roomsRes.json();

      logger.state('Bookings data loaded', { count: bookingsData.bookings?.length });

      setBookings(bookingsData.bookings || []);
      setRooms(roomsData.rooms || []);
    } catch (error) {
      logger.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || 'Unknown Room';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-600 mt-1">
          View all room bookings
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          No bookings yet. Book a room to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg border p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{booking.title}</h3>
                <p className="text-sm text-gray-600">
                  {getRoomName(booking.roomId)} • {formatDateForDisplay(booking.date)}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Organized by</p>
                <p className="font-medium">{booking.organizer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
