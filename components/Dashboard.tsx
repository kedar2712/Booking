import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Booking } from '../types';
import { STATUS_COLORS } from '../constants';

interface DashboardProps {
  bookings: Booking[];
}

export const Dashboard: React.FC<DashboardProps> = ({ bookings }) => {
  // Logic to find upcoming trips
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings
    .filter(b => {
      const checkIn = new Date(b.checkIn);
      return checkIn >= today && b.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 5);

  // Logic for chart data (Bookings by Destination)
  const destinationStats = bookings.reduce((acc, curr) => {
    if (curr.status === 'cancelled') return acc;
    acc[curr.destination] = (acc[curr.destination] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(destinationStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 6); // Top 6 destinations

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Departures - The "Remember the Date" Solution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">📅</span>
            Upcoming Departures
          </h2>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              No upcoming trips found.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map(booking => {
                const date = new Date(booking.checkIn);
                const isToday = date.getTime() === today.getTime();
                
                return (
                  <div key={booking.id} className={`flex items-start p-3 rounded-lg border ${isToday ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                    <div className={`flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center rounded-lg ${isToday ? 'bg-indigo-200 text-indigo-800' : 'bg-white border border-slate-200 text-slate-600'}`}>
                      <span className="text-xs font-bold uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold">{date.getDate()}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-800">{booking.clientName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Traveling to <span className="font-medium text-indigo-600">{booking.destination}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {booking.phone} • {booking.hotelName || 'No Hotel'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Destinations Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
           <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-3">🌍</span>
            Top Destinations
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};