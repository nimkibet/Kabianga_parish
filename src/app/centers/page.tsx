'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Landmark, Users, Calendar, Phone, Image as GalleryIcon, ArrowRight, MapPin } from 'lucide-react';

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [jumuiyas, setJumuiyas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCenterId, setActiveCenterId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [centersRes, jumuiyasRes] = await Promise.all([
        supabase.from('centers').select('*').order('name', { ascending: true }),
        supabase.from('jumuiyas').select('*').order('name', { ascending: true })
      ]);

      if (centersRes.error) throw centersRes.error;
      if (jumuiyasRes.error) throw jumuiyasRes.error;

      setCenters(centersRes.data || []);
      setJumuiyas(jumuiyasRes.data || []);

      if (centersRes.data && centersRes.data.length > 0) {
        setActiveCenterId(centersRes.data[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching centers and jumuiyas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCenter = centers.find(c => c.id === activeCenterId);
  
  // Filter jumuiyas that belong to the active center
  const activeJumuiyas = activeCenter
    ? jumuiyas.filter(j => j.center_name === activeCenter.name)
    : [];

  return (
    <div className="space-y-6 pb-16 px-1">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Parish Hierarchy
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Outstation Centers</h1>
        <p className="text-xs text-muted-foreground">Parish → Outstation Centers → Small Christian Communities (Jumuiyas)</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading centers...</p>
        </div>
      ) : centers.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Landmark className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-extrabold text-sm text-foreground">No Centers Found</h3>
          <p className="text-xs text-muted-foreground mt-1">Please check back later or add them in the admin dashboard.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Centers Tabs scrollbar (Mobile-first friendly) */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 border-b border-border/80">
            {centers.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCenterId(c.id)}
                className={`touch-target px-5 py-2.5 rounded-t-xl text-xs font-extrabold whitespace-nowrap border-b-2 transition-all flex items-center space-x-2 ${
                  activeCenterId === c.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>{c.name.replace("St. Peter's ", "").replace("St. Augustine ", "").replace("St. Rita ", "").replace("St. Padre Pio ", "")}</span>
              </button>
            ))}
          </div>

          {activeCenter && (
            <div className="space-y-6 animate-fade-in">
              {/* 1. Center Description */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Landmark className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-foreground leading-tight">{activeCenter.name}</h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Outstation Center</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed pt-2">
                  {activeCenter.description || 'No description available for this outstation.'}
                </p>
              </div>

              {/* 2. Top 4 Leaders Card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-foreground border-b border-border/60 pb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  Center Leadership (Top 4)
                </h3>
                
                {activeCenter.leaders && activeCenter.leaders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCenter.leaders.map((leader: any, index: number) => (
                      <div
                        key={index}
                        className="bg-muted/40 border border-border/30 p-3 rounded-xl flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                            {leader.role}
                          </span>
                          <h4 className="font-bold text-xs text-foreground mt-1">{leader.name}</h4>
                        </div>
                        
                        {leader.phone && (
                          <a
                            href={`tel:${leader.phone}`}
                            className="touch-target p-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-all flex items-center justify-center"
                            title={`Call ${leader.name}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No leadership details uploaded for this center yet.</p>
                )}
              </div>

              {/* 3. Center Photo Gallery */}
              {activeCenter.images && activeCenter.images.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground border-b border-border/60 pb-2 flex items-center gap-1.5">
                    <GalleryIcon className="w-4 h-4 text-primary" />
                    Center Gallery
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeCenter.images.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-xl overflow-hidden border border-border/50 group"
                      >
                        <img
                          src={img}
                          alt={`${activeCenter.name} photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Associated Jumuiyas (SCCs) */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    Jumuiyas (SCCs) in this Center
                  </h3>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                    {activeJumuiyas.length} Active
                  </span>
                </div>

                {activeJumuiyas.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No Small Christian Communities listed under this center yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeJumuiyas.map((j) => (
                      <div
                        key={j.id}
                        className="p-4 bg-muted/30 border border-border/30 rounded-xl flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <h4 className="font-extrabold text-sm text-foreground leading-tight">{j.name}</h4>
                          <div className="flex items-center space-x-1 mt-1 text-[10px] text-muted-foreground font-semibold">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            <span>{j.zone}</span>
                          </div>
                          <p className="text-xs text-foreground/80 mt-2 leading-relaxed">
                            📅 Meets: <strong>{j.meeting_day}</strong>
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-border/40 pt-2 text-[11px]">
                          <span className="text-muted-foreground font-semibold">Mwenyekiti: {j.leader_name}</span>
                          <a
                            href={`tel:${j.leader_phone}`}
                            className="text-primary font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Call</span>
                            <Phone className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
