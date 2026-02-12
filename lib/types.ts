export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  amenities: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  organizer: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}
