import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/orders/',
          '/profile/',
          '/cart/',
          '/_next/',
          '/static/',
          '/private/',
          '/*.json$',
          '/search?*sort=*&*sort=*', // Prevent duplicate sort parameters
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/orders/',
          '/profile/',
          '/cart/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/orders/',
          '/profile/',
          '/cart/',
        ],
      }
    ],
    sitemap: 'https://shopwave.dhanbyte.me/sitemap.xml',
    host: 'https://shopwave.dhanbyte.me',
  }
}