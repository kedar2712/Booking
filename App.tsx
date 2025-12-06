import React, { useState, useEffect, useRef } from 'react';
import { Booking, BookingStatus } from './types';
import { BookingForm } from './components/BookingForm';
import { StatCard } from './components/StatCard';
import { Dashboard } from './components/Dashboard';
import { Assistant } from './components/Assistant';
import { CalendarView } from './components/CalendarView';
import { STATUS_COLORS } from './constants';
import { generateVoucher } from './utils/pdfGenerator';

const App = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [view, setView] = useState<'dashboard' | 'list' | 'calendar'>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('hsh_bookings');
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookings", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('hsh_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleSaveBooking = (booking: Booking) => {
    if (editingBooking) {
      setBookings(prev => prev.map(b => b.id === booking.id ? booking : b));
    } else {
      setBookings(prev => [...prev, booking]);
    }
    setShowForm(false);
    setEditingBooking(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this booking permanently?')) {
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  // --- Data Management Functions ---
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `HSH_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        if (Array.isArray(parsedData)) {
          if (confirm(`Found ${parsedData.length} bookings in this file. This will REPLACE your current data. Are you sure?`)) {
            setBookings(parsedData);
            setShowSettings(false);
            alert('Data imported successfully!');
          }
        } else {
          alert('Invalid file format: Data must be an array of bookings.');
        }
      } catch (error) {
        alert('Error parsing file. Please make sure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Stats Logic
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalBalance = bookings.reduce((acc, b) => {
      const received = (b.amountHeightSight || 0) + (b.amountPrakruti || 0) + (b.amountCash || 0);
      return acc + ((b.totalAmount || 0) - received);
  }, 0);
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-none">Height & Sight</h1>
                <p className="text-xs text-slate-500 font-medium">Holidays Manager</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors"
                title="Settings & Data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <button 
                onClick={() => { setEditingBooking(null); setShowForm(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="hidden sm:inline">New Booking</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 mt-1 overflow-x-auto">
          <button 
            onClick={() => setView('dashboard')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${view === 'dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${view === 'calendar' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Calendar 📅
          </button>
          <button 
            onClick={() => setView('list')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${view === 'list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            All Bookings ({bookings.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="bg-emerald-500 text-emerald-500"
          />
          <StatCard 
            title="Pending Collection" 
            value={`₹${totalBalance.toLocaleString('en-IN')}`} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="bg-amber-500 text-amber-500"
          />
          <StatCard 
            title="Active Trips" 
            value={activeBookings.toString()} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            color="bg-blue-500 text-blue-500"
          />
        </div>

        {view === 'dashboard' && <Dashboard bookings={bookings} />}
        
        {view === 'calendar' && <CalendarView bookings={bookings} onEdit={handleEdit} />}

        {view === 'list' && (
          /* Bookings List View */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="font-bold text-slate-700">Booking Database</h2>
              
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <div className="relative w-full md:w-64">
                  <input 
                    type="text" 
                    placeholder="Search client, destination..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Client / Phone</th>
                    <th className="px-6 py-3 font-medium">Trip Info</th>
                    <th className="px-6 py-3 font-medium">Dates</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Balance</th>
                    <th className="px-6 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                           No bookings found matching your search.
                        </td>
                     </tr>
                  ) : filteredBookings.map(booking => {
                     const received = (booking.amountHeightSight || 0) + (booking.amountPrakruti || 0) + (booking.amountCash || 0);
                     const balance = (booking.totalAmount || 0) - received;
                    
                     return (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{booking.clientName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{booking.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{booking.destination}</div>
                          {booking.hotelName && <div className="text-xs text-slate-500">🏨 {booking.hotelName}</div>}
                          {booking.carName && <div className="text-xs text-slate-500">🚗 {booking.carName}</div>}
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-slate-700 whitespace-nowrap">{booking.checkIn}</div>
                           <div className="text-xs text-slate-400">to {booking.checkOut}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[booking.status]}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            ₹{balance.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-slate-400">Total: ₹{booking.totalAmount?.toLocaleString('en-IN') || 0}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => generateVoucher(booking)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded" 
                              title="Download PDF Voucher"
                            >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </button>
                            <button onClick={() => handleEdit(booking)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(booking.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <BookingForm 
          initialData={editingBooking}
          existingBookings={bookings}
          onSave={handleSaveBooking}
          onCancel={() => { setShowForm(false); setEditingBooking(null); }}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Settings & Data</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h3 className="font-semibold text-indigo-900 mb-2">Backup Your Data</h3>
                <p className="text-sm text-indigo-700 mb-4">
                  Download a secure copy of all your bookings. Use this to transfer data to another device (like your phone).
                </p>
                <button 
                  onClick={handleExportData}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export Data (Download)
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Restore Data</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Select a backup file (.json) to restore. <strong className="text-red-600">Warning: This replaces current data.</strong>
                </p>
                <input 
                  type="file" 
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImportData}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Import Data (Upload)
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
                <p>Data is currently stored in your browser's LocalStorage.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Assistant bookings={bookings} />
    </div>
  );
};

export default App;