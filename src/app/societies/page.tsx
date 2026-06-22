'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Compass, Users, Calendar, Megaphone, Loader2, ArrowRight, BookOpen } from 'lucide-react';

export default function SocietiesHub() {
  const [societies, setSocieties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCode, setActiveCode] = useState('cwa');

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from('societies')
        .select('*');

      if (error) throw error;
      setSocieties(data || []);
      if (data && data.length > 0) {
        // default to first society code if cwa doesn't exist
        const hasCwa = data.some(s => s.code === 'cwa');
        if (!hasCwa) {
          setActiveCode(data[0].code);
        }
      }
    } catch (err: any) {
      console.error('Error fetching societies:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeSociety = societies.find((s) => s.code === activeCode);

  return (
    <div className="space-y-6 pb-16 px-1">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Parish Groups
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Societies Hub</h1>
        <p className="text-xs text-muted-foreground">Spiritual movements and lay groups in the parish</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading groups...</p>
        </div>
      ) : societies.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-extrabold text-sm text-foreground">No Societies Recorded</h3>
          <p className="text-xs text-muted-foreground mt-1">Please check back later.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Selector row (Horizontal Scroll on Mobile) */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 border-b border-border/80">
            {societies.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveCode(s.code)}
                className={`touch-target px-5 py-2.5 rounded-t-xl text-xs font-extrabold whitespace-nowrap border-b-2 transition-all flex items-center space-x-2 ${
                  activeCode === s.code
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{s.name.split(' (')[1]?.replace(')', '') || s.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Panel Content */}
          {activeSociety ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Main Banner Info Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                      {activeSociety.name}
                    </h2>
                    <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-semibold">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span>{activeSociety.meeting_pattern || 'No regular schedule set'}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed">
                  {activeSociety.description || 'No description available for this group.'}
                </p>
              </div>

              {/* Grid: Leadership & Announcements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Leadership Roll */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground border-b border-border/80 pb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Society Leadership
                  </h3>
                  
                  {activeSociety.leadership ? (
                    <div className="text-xs text-foreground/85 leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/20 whitespace-pre-line">
                      {activeSociety.leadership}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No leadership details registered.</p>
                  )}
                </div>

                {/* 2. Announcements & Notices */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground border-b border-border/80 pb-2 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-primary" />
                    Latest Announcements
                  </h3>
                  
                  {activeSociety.announcements ? (
                    <div className="bg-amber-500/5 border border-amber-500/10 text-amber-900 dark:text-amber-300 p-4 rounded-xl text-xs sm:text-sm font-medium leading-relaxed">
                      {activeSociety.announcements}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground italic">
                      No active announcements for this society.
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : null}

        </div>
      )}

      {/* General Join Notice */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2.5">
        <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-primary" />
          How to Join
        </h4>
        <p className="text-xs text-foreground/80 leading-relaxed">
          Interested in joining any of the groups above? You are welcome to attend their monthly meeting 
          or reach out to the parish office / secretary to be connected directly to the society coordinator.
        </p>
      </div>

    </div>
  );
}
