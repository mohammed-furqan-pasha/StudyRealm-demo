import type { MetadataRoute } from 'next';

// The noindex meta tag in layout.tsx controls indexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  };
}

