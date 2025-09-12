import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogImage?: string
}

export default function SEOHead({ 
  title = "ShopWave - Best Online Shopping in India",
  description = "ShopWave India - Best online shopping site for tech accessories, home essentials, ayurvedic products. Lowest prices, fast delivery across India.",
  keywords = "ShopWave, ShopWave India, online shopping India, best online shopping, tech accessories India, home products online, ayurvedic products online",
  canonical,
  ogImage = "https://shopwave.dhanbyte.me/og-image.jpg"
}: SEOHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="author" content="ShopWave" />
      <meta name="publisher" content="ShopWave India" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical || "https://shopwave.dhanbyte.me"} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ShopWave" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Structured Data for Brand */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Brand",
            "name": "ShopWave",
            "url": "https://shopwave.dhanbyte.me",
            "logo": "https://shopwave.dhanbyte.me/logo.png",
            "description": "Best online shopping platform in India for tech, home and ayurvedic products"
          })
        }}
      />
    </Head>
  )
}