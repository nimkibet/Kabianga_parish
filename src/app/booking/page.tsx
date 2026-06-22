'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, User, Phone, CheckCircle, AlertCircle, Loader2, ListFilter, ShieldAlert } from 'lucide-react';

export default function EquipmentBooking() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form states
  const [assetName, setAssetName] = useState('Sound Mixer - 16 Channel');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_bookings')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err.message);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Date validations
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (start < today) {
      setMessage({ type: 'error', text: 'Start date cannot be in the past.' });
      setSubmitting(false);
      return;
    }

    if (end < start) {
      setMessage({ type: 'error', text: 'End date cannot be before start date.' });
      setSubmitting(false);
      return;
    }

    try {
      // Check for overlap of approved bookings for the same asset
      const overlapping = bookings.filter((b) => {
        if (b.asset_name !== assetName || b.status !== 'approved') return false;
        const bStart = new Date(b.start_date);
        const bEnd = new Date(b.end_date);
        return (start <= bEnd && end >= bStart);
      });

      if (overlapping.length > 0) {
        setMessage({
          type: 'error',
          text: `Conflict detected! This asset is already booked and approved between ${overlapping[0].start_date} and ${overlapping[0].end_date}.`,
        });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from('equipment_bookings').insert({
        asset_name: assetName,
        borrower_name: borrowerName.trim(),
        borrower_phone: borrowerPhone.trim(),
        start_date: startDate,
        end_date: endDate,
        status: 'pending',
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Booking request submitted successfully! It is currently pending approval by the parish administration.',
      });

      // Clear form
      setBorrowerName('');
      setBorrowerPhone('');
      setStartDate('');
      setEndDate('');
      
      // Refresh list
      fetchBookings();

    } catch (err: any) {
      setMessage({ type: 'error', text: `Booking failed: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Approved</span>;
      case 'rejected':
        return <span className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded">Rejected</span>;
      default:
        return <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Pending Review</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-1 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Parish Resource Scheduling
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Equipment Booking</h1>
        <p className="text-xs text-muted-foreground">Reserve physical parish assets (mixers, speakers, keyboard piano) for events</p>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Form Column */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 h-fit">
          <h2 className="text-base font-extrabold text-foreground border-b border-border pb-2">
            Request Asset Reservation
          </h2>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-start space-x-2 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-destructive/10 border border-destructive/20 text-destructive'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Asset Select */}
            <div className="space-y-1">
              <label htmlFor="asset-select" className="text-xs font-bold text-muted-foreground">Select Equipment</label>
              <select
                id="asset-select"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input font-bold"
              >
                <option value="Sound Mixer - 16 Channel">Sound Mixer - 16 Channel</option>
                <option value="PA Active Speaker - 15 Inch">PA Active Speaker - 15 Inch</option>
                <option value="Keyboard Piano - Yamaha PSR">Keyboard Piano - Yamaha PSR</option>
                <option value="Portable Generator - 3KVA">Portable Generator - 3KVA</option>
                <option value="High-Contrast Projector & Screen">High-Contrast Projector & Screen</option>
              </select>
            </div>

            {/* Borrower Name */}
            <div className="space-y-1">
              <label htmlFor="borrower" className="text-xs font-bold text-muted-foreground">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="borrower"
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label htmlFor="borrower-phone" className="text-xs font-bold text-muted-foreground">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="borrower-phone"
                  type="tel"
                  required
                  placeholder="e.g. 0704285127"
                  value={borrowerPhone}
                  onChange={(e) => setBorrowerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="start-date" className="text-xs font-bold text-muted-foreground">Start Date</label>
                <input
                  id="start-date"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="end-date" className="text-xs font-bold text-muted-foreground">End Date</label>
                <input
                  id="end-date"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full touch-target bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-primary-hover active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              <span>Submit Request</span>
            </button>

          </form>
        </div>

        {/* Calendar / List Column */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
            <ListFilter className="w-4 h-4 text-primary" />
            Existing Reservations
          </h2>

          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-[10px] text-muted-foreground font-semibold">Loading booking calendar...</p>
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-10">No bookings recorded yet.</p>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-muted/40 rounded-xl border border-border/40 text-xs space-y-1.5 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-foreground leading-tight">{b.asset_name}</span>
                    {getStatusBadge(b.status)}
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                    <span>Borrower: {b.borrower_name}</span>
                    <span>{b.start_date} to {b.end_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Admin info note */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
        <h4 className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-primary" />
          Equipment Guidelines
        </h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          ⚠️ Equipment is strictly for church group events, SCC assemblies, or parish-related missions. It should be returned in original working condition immediately after the reservation period ends. Approval remains at the sole discretion of the Parish Priest.
        </p>
      </div>

    </div>
  );
}
