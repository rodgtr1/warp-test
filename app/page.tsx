'use client';

import { useState, useEffect } from 'react';
import { Room, Booking } from '@/lib/types';
import { RoomCard } from '@/components/room-card';
import { BookingModal } from '@/components/booking-modal';
import { logger } from '@/lib/logger';

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.action('Home page mounted, fetching data');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      logger.api('Fetching rooms and bookings');
      
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/bookings'),
      ]);

      const roomsData = await roomsRes.json();
      const bookingsData = await bookingsRes.json();

      logger.state('Data fetched successfully', {
        roomsCount: roomsData.rooms?.length,
        bookingsCount: bookingsData.bookings?.length,
      });

      setRooms(roomsData.rooms || []);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      logger.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      logger.action('Opening booking modal', { roomId, roomName: room.name });
      setSelectedRoom(room);
    }
  };

  const handleBookingComplete = (booking: Omit<Booking, 'id'>) => {
    logger.state('Booking completed, refreshing data');
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meeting Rooms</h1>
        <p className="text-gray-600 mt-1">
          Select a room to book for your next meeting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onBook={handleBookRoom}
          />
        ))}
      </div>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          existingBookings={bookings}
          onClose={() => setSelectedRoom(null)}
          onBook={handleBookingComplete}
        />
      )}
    </div>
  );
}
