import React from 'react';
import Link from 'next/link';
import { Compass, Leaf, Heart } from 'lucide-react';

export function AppFooter() {
  return (
    <footer
      role="contentinfo"
      className="w-full border-t border-earth-border/80 bg-white/50 text-earth-charcoal mt-16 pb-20 md:pb-8"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-earth-forest text-white flex items-center justify-center">
                <Compass className="w-4 h-4 text-earth-sage" />
              </div>
              <span className="font-bold text-base text-earth-forest">OutsideQuest AI</span>
            </div>
            <p className="text-xs text-earth-muted max-w-sm leading-relaxed">
              Crafting personalized outdoor micro-adventures using lightweight, open-weight AI that runs entirely within your browser. Touch grass, explore nature, and disconnect from screen clutter.
            </p>
            <div className="flex items-center gap-2 text-xs text-earth-forest font-medium">
              <Leaf className="w-3.5 h-3.5" />
              <span>Built for the Touch Grass Open-Source AI Challenge</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-earth-forest">
              Explore
            </h4>
            <ul className="space-y-1.5 text-xs text-earth-muted">
              <li>
                <Link
                  href="/"
                  className="hover:text-earth-charcoal transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Build a Quest
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="hover:text-earth-charcoal transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  My Journal
                </Link>
              </li>
              <li>
                <Link
                  href="/offline"
                  className="hover:text-earth-charcoal transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Offline Mode
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Tech */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-earth-forest">
              Architecture & Trust
            </h4>
            <ul className="space-y-1.5 text-xs text-earth-muted">
              <li>
                <Link
                  href="/about-ai"
                  className="hover:text-earth-charcoal transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  About On-Device AI
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-earth-charcoal transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Privacy Guarantee
                </Link>
              </li>
              <li>
                <span className="text-earth-muted/80">IndexedDB Local Storage</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-earth-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-earth-muted gap-2">
          <p>© 2026 OutsideQuest AI. Open Source under the MIT License.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-earth-accent fill-earth-accent" /> for outdoor explorers.
          </p>
        </div>
      </div>
    </footer>
  );
}
