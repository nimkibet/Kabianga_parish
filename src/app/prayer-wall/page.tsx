'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PrayerWall() {
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPrayers();
    
    // Subscribe to Realtime changes for prayer_requests table
    const channel = supabase
      .channel('prayer-wall-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prayer_requests' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newPrayer = payload.new;
            // Only add if it is moderated, or if it is our submission
            if (newPrayer.is_moderated) {
              setPrayers((prev) => [newPrayer, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            setPrayers((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setPrayers((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPrayers = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('is_moderated', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayers(data || []);
    } catch (err: any) {
      console.error('Error fetching prayers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intention.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('prayer_requests').insert({
        name: name.trim() || 'Anonymous',
        intention: intention.trim(),
        is_moderated: false, // Must be moderated by admin before display
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Your prayer request has been submitted! It will appear on the wall once reviewed by the parish admin.',
      });
      setName('');
      setIntention('');
    } catch (err: any) {
      setMessage({ type: 'error', text: `Failed to submit: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrayFor = async (id: string, currentCount: number) => {
    try {
      // Optimistically update local state for immediate feedback
      setPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, prayers_count: currentCount + 1 } : p))
      );

      const { error } = await supabase
        .from('prayer_requests')
        .update({ prayers_count: currentCount + 1 })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Failed to increment prayer count:', err.message);
      // Revert optimistic update
      fetchPrayers();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-1 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Community Intercession
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Prayer Request Wall</h1>
        <p className="text-xs text-muted-foreground">“Carry each other’s burdens, and in this way you will fulfill the law of Christ.”</p>
      </div>

      {/* Submission Form */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-foreground border-b border-border pb-2">
          Submit Prayer Intention
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
          <div className="space-y-1">
            <label htmlFor="requester-name" className="text-xs font-bold text-muted-foreground">Your Name (Optional)</label>
            <input
              id="requester-name"
              type="text"
              placeholder="e.g. Mary Wambui (Leave blank to remain Anonymous)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="prayer-intention" className="text-xs font-bold text-muted-foreground">Prayer Request / Intention</label>
            <textarea
              id="prayer-intention"
              required
              rows={3}
              placeholder="Write your intention here..."
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full touch-target bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-primary-hover active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Submit to Wall</span>
          </button>
        </form>
      </div>

      {/* Wall Listings */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-foreground border-b border-border pb-2">
          Intention Wall (Live)
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-semibold">Connecting to wall...</p>
          </div>
        ) : prayers.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-xs text-muted-foreground italic">No intentions currently posted. Be the first to submit!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prayers.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                    <span className="text-primary">{p.name}</span>
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-foreground/90 font-sans leading-relaxed whitespace-pre-wrap">
                    {p.intention}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {p.prayers_count} {p.prayers_count === 1 ? 'person has' : 'people have'} prayed for this
                  </span>
                  
                  <button
                    onClick={() => handlePrayFor(p.id, p.prayers_count || 0)}
                    className="touch-target px-3.5 py-1.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 active:scale-95 text-primary text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <Heart className="w-3.5 h-3.5 fill-primary/20" />
                    <span>I Prayed for This</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
