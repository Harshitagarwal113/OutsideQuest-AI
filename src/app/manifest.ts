import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OutsideQuest AI - Outdoor Micro-Adventures',
    short_name: 'OutsideQuest',
    description: 'Personalized outdoor micro-adventures with browser on-device AI. Touch grass and explore nature.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F6EF',
    theme_color: '#315D44',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
