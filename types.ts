import React from 'react';

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  clientName: string;
  phone: string;
  destination: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  extraBed: number;
  roomCategory: string;
  carOperator: string;
  carName: string;
  
  // Financials
  totalAmount: number;
  amountHeightSight: number;
  amountPrakruti: number;
  amountCash: number;
  balanceAmount: number; // Manually entered balance if needed, or calculated
  
  status: BookingStatus;
  notes: string;
}

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}