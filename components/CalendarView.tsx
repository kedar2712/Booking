import React, { useState } from 'react';
import { Booking } from '../types';
import { STATUS_COLORS } from '../constants';

interface CalendarViewProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ bookings, onEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  // Create array of days
  const days = [];
  // Add empty slots for days before start of month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => {
      // Simple check if date is within range
      // In a real app, handle timezones strictly
      return dateStr >= b.checkIn && dateStr <= b.checkOut && b.status !== 'cancelled';
    });
  };

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
             ← Prev
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
             Today
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
             Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
        {/* Header */}
        {WEEKDAYS.map(day => (
          <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase">
            {day}
          </div>
        ))}

        {/* Calendar Grid */}
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="bg-white h-32 md:h-40" />;

          const dayBookings = getBookingsForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div key={date.toISOString()} className={`bg-white min-h-[8rem] p-1 md:p-2 border-t border-slate-100 ${isToday ? 'bg-indigo-50/30' : ''}`}>
              <div className={`text-right mb-1`}>
                 <span className={`text-xs font-medium inline-block w-6 h-6 text-center leading-6 rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                    {date.getDate()}
                 </span>
              </div>
              <div className="space-y-1 overflow-y-auto max-h-24 md:max-h-28 custom-scrollbar">
                {dayBookings.map(booking => {
                    const isStart = booking.checkIn === date.toISOString().split('T')[0];
                    return (
                        <div 
                            key={booking.id}
                            onClick={() => onEdit(booking)}
                            className={`text-[10px] md:text-xs p-1 rounded cursor-pointer truncate transition-colors hover:opacity-80 ${STATUS_COLORS[booking.status].replace('bg-', 'bg-opacity-20 bg-')}`}
                            title={`${booking.clientName} - ${booking.destination}`}
                        >
                            {isStart && '🛫'} {booking.clientName}
                        </div>
                    );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};