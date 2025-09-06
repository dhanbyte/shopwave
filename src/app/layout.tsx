
import './globals.css';
import type { Metadata } from 'next';
import RootContent from './RootContent';
import { ClerkProvider } from '@clerk/nextjs';
import { ClerkAuthProvider } from '@/context/ClerkAuthContext';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';


export const metadata: Metadata = {
  title: 'ShopWave - Best Online Shopping in India | Tech, Home & Ayurvedic Products | Buy Online',
  description: 'ShopWave India - Best online shopping site for tech accessories, home essentials, ayurvedic products. Lowest prices, fast delivery, easy returns. Shop now at ShopWave!',
  keywords: 'ShopWave, ShopWave India, online shopping India, best online shopping, tech accessories India, home products online, ayurvedic products online, mobile accessories, kitchen items, buy online India, ecommerce India, online store India, shopping website, best deals online',
  authors: [{ name: 'ShopWave' }],
  creator: 'ShopWave',
  publisher: 'ShopWave',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://shopwave.dhanbyte.me',
    title: 'ShopWave - Best Online Shopping in India',
    description: 'ShopWave India - Best online shopping site for tech accessories, home essentials, ayurvedic products. Lowest prices, fast delivery across India.',
    siteName: 'ShopWave',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopWave - Best Online Shopping India',
    description: 'ShopWave India - Best online shopping for tech, home & ayurvedic products. Lowest prices guaranteed.',
    creator: '@shopwave',
  },

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
        <link rel="canonical" href="https://shopwave.dhanbyte.me" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ShopWave",
              "alternateName": "ShopWave India",
              "url": "https://shopwave.dhanbyte.me",
              "description": "Best online shopping in India for tech accessories, home essentials & ayurvedic products",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://shopwave.dhanbyte.me/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://shopwave.dhanbyte.me"
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
              "name": "ShopWave",
              "url": "https://shopwave.dhanbyte.me",
              "logo": "https://shopwave.dhanbyte.me/logo.png",
              "description": "Best online shopping platform in India",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
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
