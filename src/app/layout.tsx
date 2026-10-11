import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export const metadata: Metadata = {
  title: 'OutsideQuest AI | Touch Grass Micro-Adventures',
  description:
    'Turn daily strolls into sensory outdoor micro-adventures with an open-weight AI model running directly in your browser. 100% private, on-device, and offline ready.',
  keywords: [
    'OutsideQuest',
    'touch grass',
    'outdoor adventure',
    'browser AI',
    'on-device AI',
    'micro-adventure',
    'mindfulness walk',
    'local first AI',
  ],
  authors: [{ name: 'OutsideQuest Contributors' }],
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#315D44',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex flex-col min-h-screen bg-earth-bg text-earth-charcoal font-sans antialiased">
        {/* Skip to Main Content Link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-earth-forest focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        {/* Header with desktop navigation */}
        <AppHeader />

        {/* Main Application Container */}
        <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
          {children}
        </main>

        {/* Global Footer */}
        <AppFooter />

        {/* Mobile Touch Navigation */}
        <MobileNavigation />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(err => {
                    console.debug('SW registration notice:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
