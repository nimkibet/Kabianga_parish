import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kabiangaparish.org';

  const routes = [
    '',
    '/readings',
    '/centers',
    '/jumuiyas',
    '/societies',
    '/projects',
    '/prayer-wall',
    '/history',
    '/gallery',
    '/booking',
    '/bulletins',
    '/sermons',
    '/registration',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
