export interface Booking {
  id: number;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  vehicle: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created: string;
}

export interface Subscriber {
  email: string;
  date: string;
  name: string;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: number;
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  verified: boolean;
}

export type AdminSection = 'overview' | 'bookings' | 'subscribers';
export type PageSection = 'home' | 'services' | 'booking' | 'reviews' | 'contact';
