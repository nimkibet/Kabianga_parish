'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Image as GalleryIcon, 
  ArrowRight, 
  Users, 
  Heart, 
  Coins, 
  FileText, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';

export default function Home() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [upcomingService, setUpcomingService] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Dynamic Site Settings States
  const [brandingName, setBrandingName] = useState('Kabianga Catholic Parish');
  const [welcomeText, setWelcomeText] = useState('We are a thriving community of faith nestled in the beautiful hills of Kabianga. Our mission is to worship God, grow in spiritual maturity, and share Christ’s love through service and fellowship. Whether you are visiting or looking for a church home, you are warmly welcome!');
  const [contactEmail, setContactEmail] = useState('parishkabianga@gmail.com');
  const [contactPhone, setContactPhone] = useState('0704285127');
  const [contactAddress, setContactAddress] = useState('P.O. Box 22 - 20200, Kericho, Kenya');
  const [officeHours, setOfficeHours] = useState('Tuesday - Friday: 9:00 AM - 4:00 PM | Saturday: Closed');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await supabase.from('site_settings').select('*');
        if (data && data.length > 0) {
          const settingsMap = new Map(data.map(item => [item.key, item.value]));
          if (settingsMap.has('branding_name')) setBrandingName(settingsMap.get('branding_name')!);
          if (settingsMap.has('welcome_text')) setWelcomeText(settingsMap.get('welcome_text')!);
          if (settingsMap.has('contact_email')) setContactEmail(settingsMap.get('contact_email')!);
          if (settingsMap.has('contact_phone')) setContactPhone(settingsMap.get('contact_phone')!);
          if (settingsMap.has('contact_address')) setContactAddress(settingsMap.get('contact_address')!);
          if (settingsMap.has('office_hours')) setOfficeHours(settingsMap.get('office_hours')!);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (schedules.length === 0) return;
    
    const calculateUpcoming = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeString = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:00`;

      // Map schedules to absolute next occurrences
      const occurrences = schedules.map(s => {
        // Calculate days until next occurrence
        let daysUntil = s.day_of_week - currentDay;
        
        // If it's today but the time has passed, set it for next week
        if (daysUntil === 0 && s.start_time <= currentTimeString) {
          daysUntil = 7;
        } else if (daysUntil < 0) {
          daysUntil += 7;
        }

        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + daysUntil);
        
        const [sh, sm] = s.start_time.split(':').map(Number);
        nextDate.setHours(sh, sm, 0, 0);

        return {
          ...s,
          nextOccurrence: nextDate,
          msRemaining: nextDate.getTime() - now.getTime()
        };
      });

      // Sort by soonest
      occurrences.sort((a, b) => a.msRemaining - b.msRemaining);
      const soonest = occurrences[0];

      if (soonest) {
        setUpcomingService(soonest);
        
        // Format time remaining
        const hours = Math.floor(soonest.msRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((soonest.msRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeLeft(`in ${days} day${days > 1 ? 's' : ''}`);
        } else if (hours > 0) {
          setTimeLeft(`in ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`in ${minutes} minutes`);
        }
      }
    };

    calculateUpcoming();
    const interval = setInterval(calculateUpcoming, 1000 * 60);
    return () => clearInterval(interval);
  }, [schedules]);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('service_schedules')
        .select('*');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setSchedules(data);
      } else {
        // Fallback local schema
        setSchedules([
          { title: 'English Mass', day_of_week: 0, start_time: '08:00:00', end_time: '10:00:00', details: 'Holy Communion & Sermon', type: 'Mass' },
          { title: 'Kiswahili Mass', day_of_week: 0, start_time: '10:30:00', end_time: '12:30:00', details: 'Ibada ya Asubuhi na Mahubiri', type: 'Mass' },
          { title: 'Youth Mass', day_of_week: 0, start_time: '14:00:00', end_time: '16:00:00', details: 'Praise, Worship & Topical discussions', type: 'Mass' },
          { title: 'Confessions', day_of_week: 6, start_time: '15:00:00', end_time: '17:00:00', details: 'Sacrament of Reconciliation', type: 'Confession' },
        ]);
      }
    } catch (err: any) {
      console.warn('Error fetching service times, using fallback:', err.message);
    }
  };

  const getDayName = (dayNum: number) => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayNum];
  };

  const formatTimeString = (timeStr: string) => {
    // 08:00:00 -> 8:00 AM
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="space-y-10 md:space-y-16 pb-16">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* Dynamic Next Upcoming Service Card */}
      {upcomingService && (
        <section className="px-2 max-w-4xl mx-auto -mt-6 sm:-mt-10 relative z-10">
          <div className="bg-card border border-border shadow-xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-primary">
            <div className="flex items-center space-x-3.5 w-full sm:w-auto">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Next Service
                </span>
                <h3 className="font-extrabold text-base text-foreground leading-tight mt-1">
                  {upcomingService.title} ({getDayName(upcomingService.day_of_week)})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatTimeString(upcomingService.start_time)} to {formatTimeString(upcomingService.end_time)} • {upcomingService.details}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto text-center sm:text-right bg-muted/40 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block tracking-wider">Starts</span>
              <span className="text-base font-black text-primary">{timeLeft}</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. Welcome & About Brief */}
      <section className="text-center max-w-3xl mx-auto space-y-4 px-2">
        <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Welcome to our Community
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          {brandingName}
        </h2>
        <p className="text-base sm:text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
          {welcomeText}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href="#services"
            className="touch-target px-5 py-2.5 bg-primary text-white font-semibold rounded-xl shadow-md hover:bg-primary-hover active:scale-95 transition-all flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Service Times</span>
          </a>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target px-5 py-2.5 bg-muted text-foreground/80 font-semibold rounded-xl border border-border hover:bg-border active:scale-95 transition-all flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Find Us</span>
          </a>
        </div>
      </section>

      {/* Interactive Hub Grid (Community Pillars) */}
      <section className="space-y-6">
        <div className="border-b border-border pb-3">
          <h3 className="text-2xl font-bold tracking-tight">Parish Services & Community</h3>
          <p className="text-sm text-muted-foreground">Select a section below to get involved or access resources</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Daily Readings Link */}
          <Link href="/readings" className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all hover:shadow-sm space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">Daily Readings</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Scriptures in Swahili/English</p>
            </div>
          </Link>

          {/* Jumuiyas Directory Link */}
          <Link href="/jumuiyas" className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all hover:shadow-sm space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20">
              <Users className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">Jumuiyas Directory</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Local SCC neighborhood zones</p>
            </div>
          </Link>

          {/* Prayer Request Wall Link */}
          <Link href="/prayer-wall" className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all hover:shadow-sm space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-500/20">
              <Heart className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">Prayer Wall</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Share intercessions live</p>
            </div>
          </Link>

          {/* Giving / Paybill Link */}
          <Link href="/projects" className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all hover:shadow-sm space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20">
              <Coins className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">Giving Tracker</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">M-Pesa details & projects</p>
            </div>
          </Link>

          {/* Sacramental Registration Link */}
          <Link href="/registration" className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all hover:shadow-sm space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">Sacraments</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Baptism & Matrimony forms</p>
            </div>
          </Link>

          {/* Bulletin Archive Link */}
          <Link href="/bulletins" className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all hover:shadow-sm space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">Announcements</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Weekly bulletin downloads</p>
            </div>
          </Link>

          {/* Homilies / Sermons Link */}
          <Link href="/sermons" className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all hover:shadow-sm space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/20">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">Homily Archive</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Past reflections & audios</p>
            </div>
          </Link>

          {/* Equipment Bookings Link */}
          <Link href="/booking" className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all hover:shadow-sm space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20">
              <Calendar className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">Asset Booking</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">mixers, speakers, piano reservations</p>
            </div>
          </Link>

        </div>
      </section>

      {/* 3. Service Times Section */}
      <section id="services" className="space-y-6 scroll-mt-20">
        <div className="flex justify-between items-end border-b border-border pb-3">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Full Timetable</h3>
            <p className="text-sm text-muted-foreground">Detailed schedule of parish services</p>
          </div>
          <Calendar className="w-6 h-6 text-primary hidden sm:block" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schedules.map((service, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                  {service.day_of_week === 0 ? 'Every Sunday' : service.day_of_week === 6 ? 'Every Saturday' : 'Weekday'}
                </span>
                <h4 className="text-lg font-bold text-foreground">{service.title}</h4>
                <p className="text-xs text-muted-foreground">{service.details}</p>
              </div>
              <div className="flex items-center space-x-2 text-primary font-bold text-sm bg-primary/5 p-3 rounded-xl border border-primary/10">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{formatTimeString(service.start_time)} - {formatTimeString(service.end_time)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Contact & Find Us Details */}
      <section className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-bold text-foreground">Contact & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 text-sm text-foreground/80">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">{brandingName}</p>
                <p>Located near Kabianga University, under Kericho Diocese</p>
                <p>{contactAddress}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Office Hours</p>
                <p className="whitespace-pre-line">{officeHours}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center space-y-2 border border-border/60">
            <h4 className="font-bold text-sm">Need prayer or pastoral care?</h4>
            <p className="text-xs text-muted-foreground">
              Our parish clergy are always available to stand with you. Reach out through our office email or telephone.
            </p>
            <div className="text-sm font-bold text-primary pt-1 space-y-1">
              <p>Email: {contactEmail}</p>
              <p>Phone: {contactPhone}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
