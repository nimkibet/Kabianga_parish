'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, Calendar, Loader2, Play, Volume2, User, Search } from 'lucide-react';

export default function SermonArchive() {
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (err: any) {
      console.error('Error fetching sermons:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSermons = sermons.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.scripture_reference && s.scripture_reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-1 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Homilies & Teachings
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Sermon Archive</h1>
        <p className="text-xs text-muted-foreground">Access Sunday homilies, scriptures reflections, and audio recordings</p>
      </div>

      {/* Search Input */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, preacher, or scripture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading sermons...</p>
        </div>
      ) : filteredSermons.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-extrabold text-sm text-foreground">No Reflections Found</h3>
          <p className="text-xs text-muted-foreground mt-1 px-4">
            Try checking spelling or adjust your search keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSermons.map((s) => (
            <div
              key={s.id}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{new Date(s.date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-border hidden sm:inline">•</span>
                  <div className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground">{s.preacher}</span>
                  </div>
                </div>

                {/* Title & Scripture */}
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base sm:text-lg text-foreground leading-tight">{s.title}</h3>
                  {s.scripture_reference && (
                    <p className="text-xs text-accent font-bold">Scripture: {s.scripture_reference}</p>
                  )}
                </div>

                {/* Reflection Text */}
                {s.summary && (
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans whitespace-pre-line line-clamp-4">
                    {s.summary}
                  </p>
                )}
              </div>

              {/* Audio Player if available */}
              {s.audio_url && (
                <div className="border-t border-border/60 pt-3">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Voice Recording</p>
                  <div className="flex items-center space-x-2 bg-muted/40 p-2.5 rounded-xl border border-border/20">
                    <Volume2 className="w-4 h-4 text-primary shrink-0" />
                    <audio
                      src={s.audio_url}
                      controls
                      className="w-full h-8 outline-none text-xs focus:ring-0"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
