'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Coins, Award, Copy, Check, Building, Layers } from 'lucide-react';

export default function GivingProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAcc, setCopiedAcc] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: dbProjects, error: errProj } = await supabase
        .from('giving_projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (errProj) throw errProj;

      // Fetch settings to check for custom project images
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('key, value')
        .like('key', 'project_image_%');

      const imageMap = new Map<string, string>();
      if (settingsData) {
        settingsData.forEach(item => {
          const projectId = item.key.replace('project_image_', '');
          imageMap.set(projectId, item.value);
        });
      }

      // Map them, using high quality default placeholders if no image uploaded
      const mapped = (dbProjects || []).map(p => {
        let img = imageMap.get(p.id) || '';
        if (!img) {
          // Fallback to high quality stock images for specific projects
          if (p.title.toLowerCase().includes('building') || p.title.toLowerCase().includes('construction')) {
            img = 'https://images.unsplash.com/photo-1548625361-155de0cbb565?auto=format&fit=crop&w=800&q=80'; // Beautiful Gothic/Modern Church
          } else if (p.title.toLowerCase().includes('tiling') || p.title.toLowerCase().includes('floor') || p.title.toLowerCase().includes('terrazzo')) {
            img = 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80'; // Terrazzo/tile floor interior
          } else {
            img = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80'; // Default Parish Sanctuary
          }
        }
        return { ...p, image_url: img };
      });

      setProjects(mapped);
    } catch (err: any) {
      console.error('Error fetching projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAcc(text);
    setTimeout(() => setCopiedAcc(null), 3000);
  };

  const calculatePercent = (current: number, target: number) => {
    if (!target) return 0;
    const p = Math.round((current / target) * 100);
    return Math.min(p, 100); // capped at 100% visually
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 pb-16 px-1 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-block text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Stewardship & Building
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Giving & Projects</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Support our parish growth, community programs, and sanctuary development projects.
        </p>
      </div>

      {/* Paybill Overview Banner */}
      <div className="bg-gradient-to-br from-primary to-purple-800 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg leading-tight">General Parish Contributions</h3>
            <p className="text-[10px] text-purple-200 font-extrabold uppercase tracking-wider">Lipa Na M-Pesa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 p-5 rounded-2xl border border-white/10 text-center relative z-10">
          <div className="space-y-1 py-1">
            <p className="text-[10px] text-purple-200 font-black uppercase tracking-widest">Business Number</p>
            <p className="text-2xl font-black tracking-widest text-white">247247</p>
          </div>
          <div className="space-y-1 py-1 border-t sm:border-t-0 sm:border-l border-white/10">
            <p className="text-[10px] text-purple-200 font-black uppercase tracking-widest">Account Name</p>
            <p className="text-xl font-black uppercase text-amber-300 tracking-wide truncate">PARISHKABIANGA</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-medium relative z-10">
          💡 <strong>General Offering & Tithes:</strong> To support general parish operations, select Paybill <strong>247247</strong> and use account name <strong>PARISHKABIANGA</strong>. For specific project targets, please use the specific project account numbers below.
        </p>
      </div>

      {/* Projects List Header */}
      <div className="border-b border-border pb-3 flex justify-between items-center">
        <h2 className="text-lg font-black text-foreground">Active Development Projects</h2>
        {loading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-bold">Loading active projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl">
          <p className="text-sm text-muted-foreground italic">No active parish projects registered at the moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((proj) => {
            const percent = calculatePercent(proj.current_amount || 0, proj.target_amount);
            const isBuilding = proj.title.toLowerCase().includes('building') || proj.title.toLowerCase().includes('construction');
            
            return (
              <div
                key={proj.id}
                className="bg-card border border-border rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-all grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                {/* Left Section: Image, Title, Description, Progress (lg:col-span-7) */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Project Cover Image */}
                    {proj.image_url && (
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/60 shadow-inner bg-muted">
                        <img
                          src={proj.image_url}
                          alt={proj.title}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                          {isBuilding ? <Building className="w-3.5 h-3.5 text-amber-400" /> : <Layers className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{isBuilding ? 'Building' : 'Sanctuary'}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="font-extrabold text-xl text-foreground leading-tight">{proj.title}</h3>
                      <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">{proj.description}</p>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3 pt-4 border-t border-border/60">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground uppercase tracking-wider">Total Raised</span>
                      <span className="text-primary font-black text-sm">{percent}%</span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden border border-border/40 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-extrabold pt-1">
                      <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
                        <span className="text-[10px] text-muted-foreground uppercase block tracking-wider mb-0.5">Raised So Far</span>
                        <span className="text-foreground text-sm font-black">{formatCurrency(proj.current_amount || 0)}</span>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40 text-right">
                        <span className="text-[10px] text-muted-foreground uppercase block tracking-wider mb-0.5">Project Target</span>
                        <span className="text-primary text-sm font-black">{formatCurrency(proj.target_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section: Lipa Na M-Pesa Poster Template (lg:col-span-5) */}
                <div className="lg:col-span-5 p-6 bg-muted/30 border-t lg:border-t-0 lg:border-l border-border flex items-center justify-center">
                  <div className="w-full max-w-sm bg-white rounded-2xl border-4 border-[#3c8227] shadow-md overflow-hidden font-sans text-slate-800 flex flex-col justify-between shrink-0">
                    {/* Header */}
                    <div className="bg-[#e41e26] text-white py-3 px-4 text-center relative">
                      <h4 className="text-base font-black tracking-widest uppercase">Lipa na M-PESA</h4>
                      <div className="absolute top-0 right-0 left-0 h-1 bg-[#3c8227]" />
                    </div>

                    {/* Paybill Subheader */}
                    <div className="bg-[#3c8227] text-white py-1 px-4 text-center">
                      <span className="text-[9px] font-black uppercase tracking-widest">Paybill</span>
                    </div>

                    <div className="p-4 space-y-3.5">
                      {/* Step 1: Business Number */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">1. Enter Business No.</span>
                          <span className="text-lg font-black text-slate-900 tracking-wider">{proj.paybill_number || '247247'}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(proj.paybill_number || '247247')}
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-all"
                          title="Copy Business Number"
                        >
                          {copiedAcc === (proj.paybill_number || '247247') ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Step 2: Account Number */}
                      <div className="border-2 border-[#e41e26] rounded-xl p-3 bg-[#e41e26]/5 flex items-center justify-between">
                        <div className="space-y-0.5 w-[80%]">
                          <span className="text-[8px] font-black text-[#e41e26] uppercase tracking-wider block">2. Enter Account No.</span>
                          <span className="text-base font-black text-[#e41e26] tracking-wider uppercase block truncate">{proj.paybill_account}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(proj.paybill_account)}
                          className="p-2 bg-[#e41e26]/10 hover:bg-[#e41e26]/20 rounded-lg text-[#e41e26] transition-all shrink-0"
                          title="Copy Account Code"
                        >
                          {copiedAcc === proj.paybill_account ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Payment Steps guide */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[9px] leading-relaxed text-slate-600 space-y-1">
                        <p className="font-extrabold text-slate-700 uppercase tracking-wide border-b pb-1 mb-1">M-Pesa Steps:</p>
                        <p>1. Go to M-Pesa menu & select <strong>Lipa na M-PESA</strong></p>
                        <p>2. Choose <strong>Paybill</strong></p>
                        <p>3. Enter Business No. <strong>{proj.paybill_number || '247247'}</strong></p>
                        <p>4. Enter Account No. <strong className="text-[#e41e26]">{proj.paybill_account}</strong></p>
                        <p>5. Enter Amount and M-Pesa PIN</p>
                      </div>
                    </div>

                    {/* Footer note */}
                    <div className="bg-slate-100 py-2 px-4 text-center border-t border-slate-200">
                      <span className="text-[9px] font-extrabold text-slate-500 tracking-wide uppercase">
                        For: {proj.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Theological Note */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-3">
        <h4 className="font-extrabold text-base text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Blessings of Stewardship
        </h4>
        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
          “Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, 
          for God loves a cheerful giver.” (2 Corinthians 9:7) All contributions go directly toward supporting the parish 
          sanctuary construction, tiling, and community social programs. Thank you for your continued faith and generosity!
        </p>
      </div>

    </div>
  );
}
