'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Coins, ArrowRight, Award, DollarSign } from 'lucide-react';

export default function GivingProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('giving_projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercent = (current: number, target: number) => {
    if (!target) return 0;
    const p = Math.round((current / target) * 100);
    return Math.min(p, 100); // capped at 100% visually
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
  };

  return (
    <div className="space-y-6 pb-16 px-1">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Stewardship & Building
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Giving & Projects</h1>
        <p className="text-xs text-muted-foreground">Support our parish growth and community development programs</p>
      </div>

      {/* Paybill Card */}
      <div className="bg-gradient-to-br from-primary to-purple-800 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/15">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base leading-tight">M-Pesa Paybill Contribution</h3>
            <p className="text-[10px] text-purple-100 font-semibold uppercase tracking-wider">Direct Support</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-black/15 p-4 rounded-xl border border-white/10 text-center">
          <div className="space-y-1">
            <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Business Number</p>
            <p className="text-xl font-black tracking-wider text-white">247247</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Account Name</p>
            <p className="text-xs font-black uppercase text-amber-300 tracking-wide truncate">PARISHKABIANGA</p>
          </div>
        </div>

        <p className="text-xs text-purple-100 leading-relaxed font-medium">
          💡 <strong>How to give:</strong> Go to Lipa Na M-Pesa, select Paybill, enter business number <strong>247247</strong>, and account <strong>PARISHKABIANGA</strong>. Enter amount and PIN.
        </p>
      </div>

      {/* Projects List Header */}
      <div className="border-b border-border pb-2 flex justify-between items-center">
        <h2 className="text-base font-extrabold text-foreground">Active Development Projects</h2>
        {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading project progress...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <p className="text-xs text-muted-foreground italic">No active parish projects registered at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => {
            const percent = calculatePercent(proj.current_amount || 0, proj.target_amount);
            return (
              <div
                key={proj.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md hover:border-primary/20 transition-all"
              >
                {/* Project Header Info */}
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-foreground leading-tight">{proj.title}</h3>
                  <p className="text-xs text-foreground/80 leading-relaxed">{proj.description}</p>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground uppercase tracking-wide">Raised: {formatCurrency(proj.current_amount || 0)}</span>
                    <span className="text-primary font-black">{percent}%</span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground border-t border-border/40 pt-2">
                    <span>Target: {formatCurrency(proj.target_amount)}</span>
                    {proj.paybill_account && (
                      <span className="text-accent bg-accent/10 px-2 py-0.5 rounded font-semibold uppercase">
                        Use Account: {proj.paybill_account}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Theological Note */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2.5">
        <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
          <Award className="w-4 h-4 text-primary" />
          Blessings of Giving
        </h4>
        <p className="text-xs text-foreground/80 leading-relaxed">
          “Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, 
          for God loves a cheerful giver.” (2 Corinthians 9:7) All contributions go directly toward supporting the parish 
          sanctuary maintenance, social outreach, and spiritual welfare. Thank you for your generosity!
        </p>
      </div>

    </div>
  );
}
