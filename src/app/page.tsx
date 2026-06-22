import Link from 'next/link';
import { Clock, MapPin, Calendar, BookOpen, Image as GalleryIcon, ArrowRight } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';

export default function Home() {
  const serviceTimes = [
    {
      title: 'English Service',
      time: '8:00 AM - 10:00 AM',
      day: 'Every Sunday',
      details: 'Holy Communion & Sermon',
    },
    {
      title: 'Kiswahili Service',
      time: '10:30 AM - 12:30 PM',
      day: 'Every Sunday',
      details: 'Ibada ya Asubuhi na Mahubiri',
    },
    {
      title: 'Youth Service',
      time: '2:00 PM - 4:00 PM',
      day: 'Every Sunday',
      details: 'Praise, Worship & Bible Study',
    },
  ];

  return (
    <div className="space-y-10 md:space-y-16">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Welcome & About Brief */}
      <section className="text-center max-w-3xl mx-auto space-y-4 px-2">
        <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Welcome to our Community
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Parish Kabianga
        </h2>
        <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
          We are a thriving community of faith nestled in the beautiful hills of Kabianga. 
          Our mission is to worship God, grow in spiritual maturity, and share Christ’s love 
          through service and fellowship. Whether you are visiting or looking for a church home, 
          you are warmly welcome!
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

      {/* 3. Service Times Section */}
      <section id="services" className="space-y-6 scroll-mt-20">
        <div className="flex justify-between items-end border-b border-border pb-3">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Worship Services</h3>
            <p className="text-sm text-muted-foreground">Join us in fellowship and worship this Sunday</p>
          </div>
          <Calendar className="w-6 h-6 text-primary hidden sm:block" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {serviceTimes.map((service, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                  {service.day}
                </span>
                <h4 className="text-lg font-bold text-foreground">{service.title}</h4>
                <p className="text-xs text-muted-foreground">{service.details}</p>
              </div>
              <div className="flex items-center space-x-2 text-primary font-bold text-sm bg-primary/5 p-3 rounded-xl border border-primary/10">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{service.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Navigation Teasers (History & Gallery) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* History Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Our Church History</h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Discover the rich heritage of Parish Kabianga. Trace our humble beginnings, 
              from early missionary works in Kabianga, to our growth as a parish leading community 
              development and spiritual nourishment.
            </p>
          </div>
          <div className="pt-6">
            <Link
              href="/history"
              className="touch-target inline-flex items-center space-x-2 text-primary font-bold text-sm hover:underline"
            >
              <span>Read Church History</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Gallery Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <GalleryIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Photo Gallery</h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Experience the vibrant life of our congregation. View photos from recent Sunday services, 
              parish outreach activities, community gatherings, choir performances, and special events.
            </p>
          </div>
          <div className="pt-6">
            <Link
              href="/gallery"
              className="touch-target inline-flex items-center space-x-2 text-accent font-bold text-sm hover:underline"
            >
              <span>Explore Photo Gallery</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
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
                <p className="font-bold text-foreground">Parish Kabianga</p>
                <p>Located near Kabianga University, under Kericho Diocese</p>
                <p>P.O. Box 22 - 20200, Kericho, Kenya</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Office Hours</p>
                <p>Tuesday - Friday: 9:00 AM - 4:00 PM</p>
                <p>Saturday: Closed (By Appointment)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center space-y-2 border border-border/60">
            <h4 className="font-bold text-sm">Need prayer or pastoral care?</h4>
            <p className="text-xs text-muted-foreground">
              Our parish clergy are always available to stand with you. Reach out through our office email or telephone.
            </p>
            <p className="text-sm font-bold text-primary pt-1">
              Email: parishkabianga@gmail.com
              Phone: 0704285127
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
