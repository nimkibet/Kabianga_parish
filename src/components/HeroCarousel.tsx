'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Slide {
  id?: string;
  image_url: string;
  title: string;
  quote?: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    image_url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1200',
    title: 'Welcome to Kabianga Parish',
    quote: '"I was glad when they said to me, \'Let us go to the house of the Lord.\'" — Psalm 122:1',
  },
  {
    image_url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200',
    title: 'Growing Together in Faith',
    quote: '"For where two or three gather in my name, there am I with them." — Matthew 18:20',
  },
  {
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200',
    title: 'Serving Our Community',
    quote: '"Let your light so shine before men, that they may see your good works." — Matthew 5:16',
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Touch coordinates for swiping
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data, error } = await supabase
          .from('carousel_slides')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setSlides(data);
        }
      } catch (err) {
        console.error('Error fetching carousel slides:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  // Set up auto-play
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [slides, currentIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimer.current = setInterval(() => {
      nextSlide();
    }, 6000); // 6 seconds per slide
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    stopAutoPlay();
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    startAutoPlay();
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const minSwipeDistance = 50; // pixels

    if (distance > minSwipeDistance) {
      nextSlide(); // Swipe left -> Next slide
    } else if (distance < -minSwipeDistance) {
      prevSlide(); // Swipe right -> Prev slide
    }
  };

  return (
    <section 
      className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden shadow-xl bg-indigo-950"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      aria-label="Welcome image slideshow"
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image */}
              <img
                src={slide.image_url}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              
              {/* Overlay with Accessible Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex flex-col justify-end p-6 sm:p-10 md:p-14">
                <div className="max-w-3xl animate-fade-in">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
                    {slide.title}
                  </h2>
                  {slide.quote && (
                    <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-purple-100 font-medium italic leading-relaxed drop-shadow">
                      {slide.quote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Navigation Controls (Hidden on small screens, click targets > 44px) */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/45 hover:bg-black/60 text-white items-center justify-center backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary active:scale-95 touch-target"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/45 hover:bg-black/60 text-white items-center justify-center backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary active:scale-95 touch-target"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators / Dots (styled for touch sizing) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-3 bg-black/35 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="group relative flex items-center justify-center w-4 h-4 focus:outline-none"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Visual Dot */}
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary scale-125' : 'bg-white/60 group-hover:bg-white'
              }`}
            />
            {/* Expanded Touch Hit Target (Invisible, 44x44px for a11y) */}
            <span className="absolute -inset-4 cursor-pointer" />
          </button>
        ))}
      </div>
    </section>
  );
}
