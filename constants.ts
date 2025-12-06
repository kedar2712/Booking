import { Booking } from './types';

export const INITIAL_BOOKING: Omit<Booking, 'id'> = {
  clientName: '',
  phone: '',
  destination: '',
  hotelName: '',
  checkIn: '',
  checkOut: '',
  guests: 0,
  rooms: 0,
  extraBed: 0,
  roomCategory: '',
  carOperator: '',
  carName: '',
  totalAmount: 0,
  amountHeightSight: 0,
  amountPrakruti: 0,
  amountCash: 0,
  balanceAmount: 0,
  status: 'confirmed',
  notes: ''
};

export const STATUS_COLORS = {
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200'
};
