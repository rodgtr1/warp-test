'use client';

import { useState } from 'react';
import { Room, Booking } from '@/lib/types';
import { logger } from '@/lib/logger';
import { getUpcomingDates, formatDateForDisplay } from '@/lib/dates';

interface BookingModalProps {
  room: Room;
  existingBookings: Booking[];
  onClose: () => void;
  onBook: (booking: Omit<Booking, 'id'>) => void;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function BookingModal({ room, existingBookings, onClose, onBook }: BookingModalProps) {
  // BUG #3 is triggered here - getUpcomingDates uses buggy date offset calculation
  const availableDates = getUpcomingDates(5);
  
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateChange = (date: string) => {
    logger.action('Date selected in booking modal', { date, roomId: room.id });
    setSelectedDate(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    logger.action('Booking form submitted', {
      roomId: room.id,
      date: selectedDate,
      startTime,
      endTime,
      title,
      organizer
    });

    if (!title || !organizer) {
      setError('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          date: selectedDate,
          startTime,
          endTime,
          title,
          organizer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Booking API returned error', { status: response.status, data });
        setError(data.error || 'Failed to create booking');
        return;
      }

      logger.state('Booking created via API', { booking: data.booking });
      onBook(data.booking);
      onClose();
    } catch (err) {
      logger.error('Booking request failed', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Book {room.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDateForDisplay(date)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
                <option value="18:00">18:00</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sprint Planning"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              type="email"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="e.g., you@company.com"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
