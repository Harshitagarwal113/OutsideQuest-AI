'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ShieldCheck, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export function AppHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Build a Quest' },
    { href: '/history', label: 'My Journal' },
    { href: '/about-ai', label: 'About the AI' },
    { href: '/privacy', label: 'Privacy' },
  ];

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 w-full bg-earth-bg/95 backdrop-blur-none border-b border-earth-border/80"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-earth-charcoal hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest rounded-lg p-1"
          aria-label="OutsideQuest AI Home"
        >
          <div className="w-9 h-9 rounded-lg bg-earth-forest text-white flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5 text-earth-sage" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-none text-earth-forest">
              OutsideQuest
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-earth-accent">
              Touch Grass AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden md:flex items-center gap-1 text-sm font-medium"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                  isActive
                    ? 'bg-earth-sand text-earth-forest font-semibold'
                    : 'text-earth-muted hover:text-earth-charcoal hover:bg-earth-sand/50'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Private / On-Device Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="sage" className="gap-1 py-1 px-2.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-earth-forest" />
            <span>100% On-Device</span>
          </Badge>
          <Badge variant="outline" className="hidden lg:inline-flex gap-1 py-1 px-2 text-[11px] text-earth-muted">
            <Cpu className="w-3 h-3 text-earth-muted" />
            <span>Local Compute</span>
          </Badge>
        </div>
      </div>
    </header>
  );
}
