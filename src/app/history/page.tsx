import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { BookOpen, Calendar, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Church History',
  description: 'Learn about the rich history and heritage of ACK Kabianga Parish, from early missionary foundations to our growth as a parish.',
};

interface HistoryEntry {
  id?: string;
  title: string;
  content: string;
  year?: number;
  image_url?: string;
}

const DEFAULT_HISTORY: HistoryEntry[] = [
  {
    year: 1972,
    title: 'The Humble Beginning',
    content: 'ACK Kabianga Parish started as a small fellowship under a tree. A group of seven faithful families gathered regularly for prayers, laying the foundation for what would become a cornerstone of faith in Kabianga.',
    image_url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=600',
  },
  {
    year: 1984,
    title: 'Acquisition of Land & First Church',
    content: 'With the growth of the congregation, land was acquired near the present-day Kabianga University. The congregation built its first mud-walled, iron-roofed structure, which served as their sanctuary for over fifteen years.',
  },
  {
    year: 2001,
    title: 'Elevation to Parish Status',
    content: 'Acknowledging the rapid growth of the local congregation and its surrounding outstations, the ACK Diocese of Kericho officially elevated Kabianga to a full Parish. Rev. John Langat was posted as the first resident Vicar.',
    image_url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=600',
  },
  {
    year: 2015,
    title: 'Consecration of the Modern Sanctuary',
    content: 'The construction of our modern, 800-seater sanctuary was completed and consecrated by the Bishop. This sanctuary stands as a testament to the generosity, sacrifice, and faith of the Kabianga community.',
  },
];

async function getHistoryEntries(): Promise<HistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('history_entries')
      .select('*')
      .order('year', { ascending: true });

    if (error) {
      console.error('Error fetching history entries:', error);
      return DEFAULT_HISTORY;
    }

    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Exception fetching history entries:', err);
  }
  return DEFAULT_HISTORY;
}

export default async function HistoryPage() {
  const historyEntries = await getHistoryEntries();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-4 space-y-2">
        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Our Heritage</span>
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Church History</h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Tracing our steps of faith and community building from 1972 to the present day.
        </p>
      </div>

      {/* Vertical Timeline Layout for Mobile-First */}
      <div className="relative border-l-2 border-primary/20 ml-3 md:ml-6 pl-6 sm:pl-8 py-4 space-y-12">
        {historyEntries.map((entry, index) => (
          <div key={entry.id || index} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -left-[35px] md:-left-[43px] top-1.5 w-6 h-6 rounded-full border-4 border-background bg-primary shadow-sm flex items-center justify-center transition-all group-hover:scale-110">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Timeline Card */}
            <div className="p-6 rounded-2xl bg-card border border-border/85 shadow-sm hover:shadow-md hover:border-primary/20 transition-all space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center space-x-1 text-xs font-extrabold text-accent bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{entry.year || 'Milestone'}</span>
                </span>
                <span className="text-xs text-muted-foreground font-semibold flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>ACK Kabianga</span>
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{entry.title}</h2>
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                    {entry.content}
                  </p>
                </div>
                {entry.image_url && (
                  <div className="w-full h-44 sm:h-52 lg:h-40 rounded-xl overflow-hidden shadow-inner border border-border/40 relative">
                    <img
                      src={entry.image_url}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
