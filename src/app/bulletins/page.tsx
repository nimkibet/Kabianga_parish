'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, FileText, Loader2, Calendar } from 'lucide-react';

export default function Bulletins() {
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBulletins();
  }, []);

  const fetchBulletins = async () => {
    try {
      const { data, error } = await supabase
        .from('bulletin_archives')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setBulletins(data || []);
    } catch (err: any) {
      console.error('Error fetching bulletins:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-1 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Weekly Announcements
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Digital Bulletin Archive</h1>
        <p className="text-xs text-muted-foreground">Download weekly announcement documents and church programs</p>
      </div>

      {/* Bulletins List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading bulletin archives...</p>
        </div>
      ) : bulletins.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-extrabold text-sm text-foreground">No Bulletins Available</h3>
          <p className="text-xs text-muted-foreground mt-1">Please check back later or check in with the church secretary.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bulletins.map((b) => (
            <div
              key={b.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 border border-primary/10">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground leading-tight truncate">{b.title}</h3>
                  <div className="flex items-center space-x-1 text-[10px] text-muted-foreground font-semibold">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Published: {new Date(b.publish_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <a
                href={b.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="touch-target sm:self-center bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Parish Office Info */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2.5">
        <h4 className="font-extrabold text-sm text-foreground">About the Bulletin</h4>
        <p className="text-xs text-foreground/80 leading-relaxed">
          The weekly parish bulletin contains details about services, liturgical readings, banns of marriage, 
          committee announcements, and development updates. Bulletins are updated every Sunday morning. 
          If you have an announcement to place, please submit it to the secretary before Thursday 4:00 PM.
        </p>
      </div>

    </div>
  );
}
