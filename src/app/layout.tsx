import './globals.css';
import type { Metadata } from 'next';
import RootContent from './RootContent';
import { ClerkProvider } from '@clerk/nextjs';
import { ClerkAuthProvider } from '@/context/ClerkAuthContext';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';


export const metadata: Metadata = {
  title: 'ShopWave - India\'s #1 Social Shopping Platform | Best Deals | Free Delivery',
  description: 'ShopWave.social - India\'s premier social shopping destination! Discover trending products, get exclusive deals, earn rewards through referrals. Tech, Home & Ayurvedic products with guaranteed lowest prices.',
  keywords: 'ShopWave.social, shopwave social, social shopping India, online shopping India, best deals India, tech accessories, home products, ayurvedic products, referral rewards, social commerce, trending products, discount shopping, free delivery India, mobile accessories, kitchen items, personal care, electronics deals, home decor, social marketplace',
  authors: [{ name: 'ShopWave.social' }],
  creator: 'ShopWave.social',
  publisher: 'ShopWave.social',
  applicationName: 'ShopWave.social',
  generator: 'ShopWave.social',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  alternates: {
    canonical: 'https://shopwave.social',
  },
  verification: {
    google: 'shopwave-social-verification',
    yandex: 'shopwave-social-yandex',
    yahoo: 'shopwave-social-yahoo',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://shopwave.social',
    title: 'ShopWave.social - India\'s #1 Social Shopping Platform',
    description: 'Discover trending products, get exclusive deals, and earn rewards through social shopping. Tech, Home & Ayurvedic products with guaranteed lowest prices.',
    siteName: 'ShopWave.social',
    images: [{
      url: 'https://shopwave.social/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'ShopWave.social - Social Shopping Platform',
      type: 'image/jpeg',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopWave.social - India\'s #1 Social Shopping Platform',
    description: 'Discover trending products, get exclusive deals, and earn rewards through social shopping. Join the revolution!',
    creator: '@shopwavesocial',
    site: '@shopwavesocial',
    images: ['https://shopwave.social/twitter-card.jpg'],
  },
  category: 'E-commerce',
};

const WhatsAppButton = () => {
  const whatsappUrl = `https://wa.me/919157499884?text=${encodeURIComponent("Hello! I have a question about your products.")}`;
  return (
    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="fixed bottom-10 right-5 py-10 z-50" aria-label="Contact us on WhatsApp">
       <div className="bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-transform hover:scale-110">
         <FaWhatsapp size={24} aria-hidden="true" />
       </div>
    </Link>
  );
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA';
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1S9CD9GPJS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1S9CD9GPJS');
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="canonical" href="https://shopwave.social" />
        <meta name="google-site-verification" content="shopwave-social-verification" />
        <meta name="msvalidate.01" content="shopwave-social-bing" />
        <meta name="yandex-verification" content="shopwave-social-yandex" />
        <meta name="facebook-domain-verification" content="shopwave-social-fb" />
        <meta name="pinterest-site-verification" content="shopwave-social-pinterest" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ShopWave.social" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Geo Tags */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <meta name="geo.placename" content="India" />
        
        {/* Business Info */}
        <meta name="rating" content="5" />
        <meta name="price" content="Free" />
        <meta name="priceCurrency" content="INR" />
        <meta name="availability" content="InStock" />
        
        {/* Social Media Tags */}
        <meta property="fb:app_id" content="shopwave-social-fb-app" />
        <meta property="ia:markup_url" content="https://shopwave.social" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ShopWave.social",
              "alternateName": ["ShopWave Social", "Shop Wave Social", "Social Shopping India"],
              "url": "https://shopwave.social",
              "description": "Best online shopping in India for tech accessories, home essentials & ayurvedic products",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://shopwave.social/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://shopwave.social"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ShopWave.social",
              "legalName": "ShopWave.social",
              "brand": "ShopWave.social",
              "url": "https://shopwave.social",
              "logo": "https://shopwave.social/logo.png",
              "description": "ShopWave.social - India's premier social shopping platform connecting shoppers with trending products, exclusive deals, and referral rewards",
              "slogan": "India's #1 Social Shopping Platform - Discover, Share, Save",
              "priceRange": "₹",
              "hasOfferCatalog": true,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "areaServed": "IN",
              "currenciesAccepted": "INR",
              "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-91574-99884",
                "contactType": "customer service"
              }
            })
          }}
        />
      </head>
      <body className="font-body antialiased bg-background">
        <ClerkProvider publishableKey={clerkPublishableKey}>
          <ClerkAuthProvider>
            <RootContent>{children}</RootContent>
            <WhatsAppButton />
          </ClerkAuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}