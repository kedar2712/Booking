import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { INITIAL_BOOKING } from '../constants';

interface BookingFormProps {
  initialData?: Booking | null;
  existingBookings: Booking[]; // Added to support auto-complete
  onSave: (booking: Booking) => void;
  onCancel: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ initialData, existingBookings, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Booking>({
    ...INITIAL_BOOKING,
    id: Date.now().toString(),
  } as Booking);

  // Extract unique clients for autocomplete
  const clientHistory = React.useMemo(() => {
    const map = new Map();
    existingBookings.forEach(b => {
      if (b.clientName && b.phone) {
        map.set(b.clientName, b.phone);
      }
    });
    return Array.from(map.entries()).map(([name, phone]) => ({ name, phone }));
  }, [existingBookings]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-complete phone number if client name matches history
    if (name === 'clientName') {
        const foundClient = clientHistory.find(c => c.name.toLowerCase() === value.toLowerCase());
        if (foundClient) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                phone: foundClient.phone
            }));
            return;
        }
    }

    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const calculateBalance = () => {
    const received = (formData.amountHeightSight || 0) + (formData.amountPrakruti || 0) + (formData.amountCash || 0);
    return (formData.totalAmount || 0) - received;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const calculatedBalance = calculateBalance();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {initialData ? 'Edit Booking' : 'New Booking'}
            </h2>
            <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Essential Info */}
            <div className="space-y-4 lg:col-span-3">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b border-indigo-100 pb-2">Trip Details</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Client Name *</label>
              <input 
                required 
                list="client-suggestions"
                name="clientName" 
                value={formData.clientName} 
                onChange={handleChange} 
                autoComplete="off"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              />
              <datalist id="client-suggestions">
                  {clientHistory.map((c, i) => (
                      <option key={i} value={c.name} />
                  ))}
              </datalist>
              {clientHistory.length > 0 && <p className="text-xs text-slate-400">💡 Tip: Type a name to auto-fill phone number</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone *</label>
              <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Destination *</label>
              <input required name="destination" value={formData.destination} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Check-In *</label>
              <input required name="checkIn" type="date" value={formData.checkIn} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Check-Out *</label>
              <input required name="checkOut" type="date" value={formData.checkOut} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Hotel Name</label>
              <input name="hotelName" value={formData.hotelName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
            </div>

            {/* Logistics */}
            <div className="space-y-4 lg:col-span-3 mt-4">
               <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b border-indigo-100 pb-2">Logistics</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
               <div>
                  <label className="text-xs font-medium text-slate-700">Guests</label>
                  <input name="guests" type="number" value={formData.guests} onChange={handleChange} className="w-full px-2 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
               <div>
                  <label className="text-xs font-medium text-slate-700">Rooms</label>
                  <input name="rooms" type="number" value={formData.rooms} onChange={handleChange} className="w-full px-2 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
               <div>
                  <label className="text-xs font-medium text-slate-700">Ex. Bed</label>
                  <input name="extraBed" type="number" value={formData.extraBed} onChange={handleChange} className="w-full px-2 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Room Category</label>
              <input name="roomCategory" placeholder="e.g. Deluxe" value={formData.roomCategory} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Car Operator</label>
              <input name="carOperator" value={formData.carOperator} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Car Name</label>
              <input name="carName" value={formData.carName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>


            {/* Financials */}
            <div className="space-y-4 lg:col-span-3 mt-4">
               <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b border-indigo-100 pb-2">Financials</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Total Amount (₹)</label>
              <input name="totalAmount" type="number" value={formData.totalAmount} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rec. Height & Sight (₹)</label>
              <input name="amountHeightSight" type="number" value={formData.amountHeightSight} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rec. Prakruti (₹)</label>
              <input name="amountPrakruti" type="number" value={formData.amountPrakruti} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rec. Cash (₹)</label>
              <input name="amountCash" type="number" value={formData.amountCash} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="space-y-2 lg:col-span-2">
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Calculated Remaining Balance:</span>
                    <span className={`text-xl font-bold ${calculatedBalance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      ₹ {calculatedBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
               </div>
            </div>

            {/* Notes */}
            <div className="lg:col-span-3 mt-4">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-slate-100 pt-6">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
              Save Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};