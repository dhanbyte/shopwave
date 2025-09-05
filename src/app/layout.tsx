
import './globals.css';
import type { Metadata } from 'next';
import RootContent from './RootContent';
import { ClerkProvider } from '@clerk/nextjs';
import { ClerkAuthProvider } from '@/context/ClerkAuthContext';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';


export const metadata: Metadata = {
  title: 'ShopWave - Premium Online Shopping | Tech, Home & Ayurvedic Products',
  description: 'Shop premium tech accessories, home essentials & authentic ayurvedic products. Fast delivery, secure payments, easy returns. Best prices guaranteed.',
  keywords: 'online shopping, tech accessories, home products, ayurvedic products, electronics, mobile accessories, home decor, natural products',
  authors: [{ name: 'ShopWave' }],
  creator: 'ShopWave',
  publisher: 'ShopWave',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://shopwave.com',
    title: 'ShopWave - Premium Online Shopping',
    description: 'Shop premium tech accessories, home essentials & authentic ayurvedic products. Fast delivery, secure payments, easy returns.',
    siteName: 'ShopWave',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopWave - Premium Online Shopping',
    description: 'Shop premium tech accessories, home essentials & authentic ayurvedic products.',
    creator: '@shopwave',
  },

};

const WhatsAppButton = () => {
  const whatsappUrl = `https://wa.me/919157499884?text=${encodeURIComponent("Hello! I have a question about your products.")}`;
  return (
    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="fixed bottom-10 right-5 z-50" aria-label="Contact us on WhatsApp">
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
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="canonical" href="https://shopwave.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ShopWave",
              "url": "https://shopwave.com",
              "description": "Premium online shopping for tech accessories, home essentials & ayurvedic products",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://shopwave.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
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
