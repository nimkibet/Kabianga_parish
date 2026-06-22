'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Phone, MapPin, Calendar, Loader2, ArrowUpRight } from 'lucide-react';

export default function Jumuiyas() {
  const [jumuiyas, setJumuiyas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');

  useEffect(() => {
    fetchJumuiyas();
  }, []);

  const fetchJumuiyas = async () => {
    try {
      const { data, error } = await supabase
        .from('jumuiyas')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setJumuiyas(data || []);
    } catch (err: any) {
      console.error('Error fetching Jumuiyas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get list of unique zones for filter pill selection
  const zones = ['All', ...Array.from(new Set(jumuiyas.map((j) => j.zone)))];

  // Filter logic
  const filteredJumuiyas = jumuiyas.filter((j) => {
    const matchesSearch =
      j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.leader_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.zone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesZone = selectedZone === 'All' || j.zone === selectedZone;

    return matchesSearch && matchesZone;
  });

  return (
    <div className="space-y-6 pb-16 px-1">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Small Christian Communities
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Jumuiyas Directory</h1>
        <p className="text-xs text-muted-foreground">Find and join a Jumuiya close to your home</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, zone, or leader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
          />
        </div>

        {/* Zone Filter (Horizontal Scroll of Pills) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Filter by Zone</label>
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`touch-target px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                  selectedZone === zone
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-muted text-foreground/80 border-border/40 hover:bg-border'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading directory...</p>
        </div>
      ) : filteredJumuiyas.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-extrabold text-sm text-foreground">No Jumuiyas Found</h3>
          <p className="text-xs text-muted-foreground mt-1 px-4 max-w-xs mx-auto">
            Try adjusting your search filters or check spelling.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredJumuiyas.map((j) => (
            <div
              key={j.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground leading-tight">{j.name}</h3>
                    <div className="flex items-center space-x-1 mt-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span>{j.zone}</span>
                    </div>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {j.name.charAt(0)}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-foreground/80 bg-muted/30 p-3 rounded-xl border border-border/20">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span>{j.meeting_day}</span>
                  </div>
                  {j.meeting_location && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="leading-snug">Venue: {j.meeting_location}</span>
                    </div>
                  )}
                </div>

                {/* Leader Contact */}
                <div className="border-t border-border/60 pt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Leader / Mwenyekiti</p>
                  <p className="text-xs font-bold text-foreground">{j.leader_name}</p>
                </div>

              </div>

              {/* Call Action Button */}
              <a
                href={`tel:${j.leader_phone}`}
                className="touch-target w-full bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-sm hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>Call {j.leader_phone}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>

            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          About Small Christian Communities
        </h4>
        <p className="text-xs text-foreground/80 leading-relaxed">
          Small Christian Communities (Jumuiyas) are the basic cells of Kabianga Parish. 
          Members meet weekly in local neighborhoods for Bible sharing, prayers, charity, and 
          mutual support. Join a Jumuiya in your zone to connect deeply with your neighbors in faith!
        </p>
      </div>

    </div>
  );
}
