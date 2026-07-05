'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, Compass, ShieldCheck, Landmark, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const [brandingName, setBrandingName] = useState('Kabianga Catholic Parish');

  useEffect(() => {
    // Fetch dynamic branding name
    async function fetchBranding() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'branding_name')
          .maybeSingle();
        if (data?.value) {
          setBrandingName(data.value);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchBranding();
  }, []);

  // 5 items for mobile bottom navigation (strictly keeping 5-item limit)
  const mobileNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Readings', href: '/readings', icon: BookOpen },
    { name: 'Prayers', href: '/prayers', icon: Sparkles },
    { name: 'Societies', href: '/societies', icon: Compass },
    { name: 'Admin', href: '/admin', icon: ShieldCheck },
  ];

  // Full set of items for desktop navigation
  const desktopNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Readings', href: '/readings', icon: BookOpen },
    { name: 'Centers', href: '/centers', icon: Landmark },
    { name: 'Jumuiyas', href: '/jumuiyas', icon: Users },
    { name: 'Societies', href: '/societies', icon: Compass },
    { name: 'Admin', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Global Pinned Header */}
      <header className="sticky top-0 left-0 right-0 w-full z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between hidden md:flex">
          <div className="flex items-center">
            <div>
              <Link href="/" className="text-xl font-bold tracking-tight text-foreground hover:opacity-90">
                {brandingName}
              </Link>
            </div>
          </div>
          
          {/* Main Desktop Links */}
          <nav className="flex space-x-1 items-center">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all flex items-center space-x-1.5 touch-target ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-foreground/75 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="h-4 w-px bg-border mx-2"></div>
            <Link
              href="/history"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname === '/history' ? 'text-primary font-bold' : 'text-foreground/75 hover:text-foreground'
              }`}
            >
              History
            </Link>
            <Link
              href="/gallery"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname === '/gallery' ? 'text-primary font-bold' : 'text-foreground/75 hover:text-foreground'
              }`}
            >
              Gallery
            </Link>
            <Link
              href="/prayers"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname === '/prayers' ? 'text-primary font-bold' : 'text-foreground/75 hover:text-foreground'
              }`}
            >
              Prayers & Rosary
            </Link>
 
          </nav>
        </div>
 
        {/* Mobile Top Bar (hidden on desktop) */}
        <div className="px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center">
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">{brandingName}</h1>
            </div>
          </div>
 
          <div className="flex items-center space-x-2">
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                pathname.startsWith('/admin')
                  ? 'bg-primary text-white shadow-inner'
                  : 'bg-muted text-foreground/80 hover:bg-border'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>
 
      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border py-1 px-2 flex justify-around items-center md:hidden pb-safe-bottom shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all touch-target ${
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
