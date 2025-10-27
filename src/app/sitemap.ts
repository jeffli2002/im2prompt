import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.im2prompt.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date('2025-10-17'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/image-to-prompt`,
      lastModified: new Date('2025-10-15'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/text-to-prompt`,
      lastModified: new Date('2025-10-15'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/text-to-image`,
      lastModified: new Date('2025-10-15'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/text-to-video`,
      lastModified: new Date('2025-10-15'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/image-to-video`,
      lastModified: new Date('2025-10-15'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2025-10-14'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/prompt-library`,
      lastModified: new Date('2025-10-15'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2025-10-13'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: new Date('2025-10-12'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
