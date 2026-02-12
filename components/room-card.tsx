'use client';

import { Room } from '@/lib/types';
import { logger } from '@/lib/logger';

interface RoomCardProps {
  room: Room;
  onBook: (roomId: string) => void;
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  const handleBookClick = () => {
    logger.action('Book room button clicked', { roomId: room.id, roomName: room.name });
    onBook(room.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
          <p className="text-sm text-gray-500">Floor {room.floor}</p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
          {room.capacity} people
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Amenities:</p>
        <div className="flex flex-wrap gap-2">
          {room.amenities.map((amenity) => (
            <span
              key={amenity}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleBookClick}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Book This Room
      </button>
    </div>
  );
}
