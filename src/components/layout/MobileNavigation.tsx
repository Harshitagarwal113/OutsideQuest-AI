'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookOpen, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Quest', icon: Compass },
    { href: '/history', label: 'Journal', icon: BookOpen },
    { href: '/about-ai', label: 'About AI', icon: Sparkles },
    { href: '/privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-earth-bg/95 border-t border-earth-border/80 px-2 py-1.5 shadow-md"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 py-1 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                isActive
                  ? 'text-earth-forest font-semibold'
                  : 'text-earth-muted hover:text-earth-charcoal'
              )}
            >
              <div
                className={cn(
                  'p-1 rounded-md transition-colors',
                  isActive ? 'bg-earth-sand text-earth-forest' : 'text-earth-muted'
                )}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
