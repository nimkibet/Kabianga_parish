'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History as HistoryIcon, Image as GalleryIcon, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'History', href: '/history', icon: HistoryIcon },
    { name: 'Gallery', href: '/gallery', icon: GalleryIcon },
    { name: 'Admin', href: '/admin', icon: ShieldAlert },
  ];

  return (
    <>
      {/* Desktop Header Navigation (hidden on mobile) */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
              KP
            </div>
            <div>
              <Link href="/" className="text-xl font-bold tracking-tight text-foreground hover:opacity-90">
                Kabianga Parish
              </Link>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">ACK Community</p>
            </div>
          </div>
          <nav className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
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
          </nav>
        </div>
      </header>

      {/* Mobile Top Bar (provides context, hides nav links) */}
      <div className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 flex items-center justify-between md:hidden">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow">
            KP
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">ACK Kabianga Parish</h1>
          </div>
        </div>
        <Link
          href="/admin"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
            pathname.startsWith('/admin')
              ? 'bg-primary text-white'
              : 'bg-muted text-foreground/80 hover:bg-border'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin</span>
        </Link>
      </div>

      {/* Mobile Bottom Tab Bar (sticky at bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border py-1 px-2 flex justify-around items-center md:hidden pb-safe-bottom shadow-lg">
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all touch-target ${
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/10' : ''}`}>
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
