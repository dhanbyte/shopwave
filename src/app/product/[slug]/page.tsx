
'use client'
import { useMemo, useState, Suspense, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Head from 'next/head'
import Gallery from '@/components/Gallery'
import PriceTag from '@/components/PriceTag'
import RatingStars from '@/components/RatingStars'
import QtyCounter from '@/components/QtyCounter'
import { useCart } from '@/lib/cartStore'
import WishlistButton from '@/components/WishlistButton'
import { ChevronLeft, Share2, ShieldCheck, RotateCw, BellRing, Check } from 'lucide-react'
import CustomerReviews from '@/components/CustomerReviews'
import ProductGrid from '@/components/ProductGrid'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/ClerkAuthContext'
import { useProductStore } from '@/lib/productStore'
import type { Product } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useNotificationStore } from '@/lib/notificationStore'

function ProductDetailContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { slug } = useParams()
  const { toast } = useToast()
  const { products } = useProductStore()
  const { addNotification, hasNotification } = useNotificationStore()
  
  const [p, setP] = useState<Product | null | undefined>(undefined);
  const [qty, setQty] = useState(1)
  const { add } = useCart()

  useEffect(() => {
    // Set to undefined initially to show loading state
    setP(undefined); 
    if (products.length > 0) {
      const foundProduct = products.find(prod => prod.slug === slug);
      // Set to the product if found, or null if not found
      setP(foundProduct || null);
    }
  }, [slug, products]);

  if (p === undefined) {
    return (
      <div className="flex justify-center py-10">
          <LoadingSpinner />
      </div>
    )
  }

  if (p === null) {
    return <div>Product not found</div>
  }

  const price = p.price.discounted ?? p.price.original
  const images = [p.image, ...(p.extraImages||[])]
  const related = products.filter(x => x.category===p.category && x.id!==p.id).slice(0,4)

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to add items to cart", variant: "destructive" });
      return;
    }
    add(user.id, { id:p.id, qty, price, name:p.name, image:p.image });
    toast({ title: "Added to Cart", description: `${p.name} has been added to your cart.` });
  }

  const handleBuyNow = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to buy items", variant: "destructive" });
      return;
    }
    add(user.id, { id:p.id, qty, price, name:p.name, image:p.image });
    router.push('/checkout');
  }

  const handleNotifyMe = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to get notifications", variant: "destructive" });
      return;
    }
    if (!hasNotification(p.id)) {
      addNotification(user.id, p.id);
      toast({ title: "You're on the list!", description: `We'll notify you when ${p.name} is back in stock.` });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: p.name,
      text: p.shortDescription,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied!", description: "Product link copied to clipboard." });
      }
    } catch (error) {
      console.error('Share failed:', error);
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Product link copied to clipboard." });
    }
  };
  
  const ProductInfo = ({ icon: Icon, title, subtitle }: { icon: React.ElementType, title: string, subtitle?: string }) => (
    <div className="flex items-center gap-3">
        <Icon className="h-8 w-8 text-gray-500" />
        <div>
            <div className="font-semibold text-sm">{title}</div>
            {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
    </div>
  )

  const ActionButtons = () => {
    if (p.quantity > 0) {
      return (
        <>
          <div className="mt-4">
            <div className="text-sm font-medium mb-1">Quantity</div>
            <QtyCounter value={qty} onChange={n => setQty(Math.max(1, Math.min(10, n)))} />
          </div>
          <div className="hidden md:flex gap-3 mt-4">
            <button onClick={handleAddToCart} className="flex-1 rounded-xl bg-brand/90 py-3 text-white font-semibold transition-colors hover:bg-brand">Add to Cart</button>
            <button onClick={handleBuyNow} className="flex-1 rounded-xl bg-brand py-3 text-white font-semibold transition-colors hover:bg-brand/90">Buy Now</button>
          </div>
        </>
      )
    }

    return (
      <div className="mt-6">
        {hasNotification(p.id) ? (
          <Button variant="outline" className="w-full" disabled>
            <Check className="h-4 w-4 mr-2" /> We'll Notify You
          </Button>
        ) : (
          <Button onClick={handleNotifyMe} variant="outline" className="w-full">
            <BellRing className="h-4 w-4 mr-2" /> Notify Me When Available
          </Button>
        )}
      </div>
    );
  };
  
  const StickyActionButtons = () => {
    if (p.quantity > 0) {
      return (
         <div className="sticky-cta p-3 md:hidden">
            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="flex-1 rounded-xl bg-brand/90 py-3 text-white font-semibold transition-colors hover:bg-brand">Add to Cart</button>
              <button onClick={handleBuyNow} className="flex-1 rounded-xl bg-brand py-3 text-white font-semibold transition-colors hover:bg-brand/90">Buy Now</button>
            </div>
          </div>
      )
    }

    return (
       <div className="sticky-cta p-3 md:hidden">
          {hasNotification(p.id) ? (
            <Button variant="outline" className="w-full" disabled>
              <Check className="h-4 w-4 mr-2" /> Notifying
            </Button>
          ) : (
            <Button onClick={handleNotifyMe} variant="outline" className="w-full">
               <BellRing className="h-4 w-4 mr-2" /> Notify Me
            </Button>
          )}
        </div>
    )
  }

  return (
    <>
      <Head>
        <title>{p.name} - Buy Online at ShopWave</title>
        <meta name="description" content={p.shortDescription || p.description} />
        <meta name="keywords" content={`${p.name}, ${p.brand}, ${p.category}, ${p.tags?.join(', ')}, buy online, ShopWave`} />
        <meta property="og:title" content={`${p.name} - ShopWave`} />
        <meta property="og:description" content={p.shortDescription || p.description} />
        <meta property="og:image" content={p.image} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={String(p.price.discounted || p.price.original)} />
        <meta property="product:price:currency" content={p.price.currency || 'INR'} />
        <meta property="product:availability" content={p.quantity > 0 ? 'in stock' : 'out of stock'} />
        <meta property="product:brand" content={p.brand} />
        <meta property="product:category" content={p.category} />
        <link rel="canonical" href={`https://shopwave.com/product/${p.slug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": p.name,
              "description": p.description,
              "image": [p.image, ...(p.extraImages || [])],
              "brand": {
                "@type": "Brand",
                "name": p.brand
              },
              "category": p.category,
              "sku": p.sku,
              "offers": {
                "@type": "Offer",
                "price": p.price.discounted || p.price.original,
                "priceCurrency": p.price.currency || "INR",
                "availability": p.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": "ShopWave"
                }
              },
              "aggregateRating": p.ratings ? {
                "@type": "AggregateRating",
                "ratingValue": p.ratings.average,
                "reviewCount": p.ratings.count
              } : undefined
            })
          }}
        />
      </Head>
      <div>
      <button onClick={() => router.back()} className="md:hidden flex items-center gap-1 text-sm text-gray-600 mb-2">
        <ChevronLeft size={16} /> Back
      </button>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
        <div className="md:col-span-2">
          <Gallery images={images} isOutOfStock={p.quantity === 0} />
        </div>
        <div className="md:col-span-3 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-semibold md:text-2xl">{p.name}</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="rounded-full p-2 bg-gray-100/80 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <WishlistButton id={p.id} />
              </div>
            </div>
            {p.brand && <div className="mt-1 text-sm text-gray-500">by {p.brand}</div>}
            {p.ratings && <div className="mt-2"><RatingStars value={p.ratings?.average ?? 0} /></div>}
            <div className="mt-3"><PriceTag original={p.price.original} discounted={p.price.discounted} /></div>
            
            {p.shortDescription && <div className="mt-4 text-sm text-gray-700">
              <p>{p.shortDescription}</p>
            </div>}
            <ActionButtons />

          <div className="mt-8 space-y-6">
            {p.description && 
              <div>
                <h3 className="text-sm font-semibold mb-1">Description</h3>
                <p className="text-sm text-gray-700">{p.description}</p>
              </div>
            }

            {p.features && p.features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-1">Highlights</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {p.features.map((f,i)=> <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-3">
              {p.returnPolicy?.eligible && <ProductInfo icon={RotateCw} title={`${p.returnPolicy.duration} Day Return`} subtitle="If defective or wrong item" />}
              {p.warranty && <ProductInfo icon={ShieldCheck} title={p.warranty} subtitle="Brand warranty included" />}
            </div>

            {p.specifications && Object.keys(p.specifications).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold">Specifications</h3>
                <table className="mt-2 w-full text-sm">
                    <tbody>
                    {Object.entries(p.specifications||{}).map(([k,v]) => (
                        <tr key={k} className="border-b last:border-0">
                        <td className="w-1/3 py-2 text-gray-500">{k}</td>
                        <td className="py-2 text-gray-800">{v}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-center">Related Products</h2>
          <ProductGrid products={related} />
        </div>
      )}

      {p.ratings && (
        <div className="mt-12">
            <CustomerReviews product={p} />
        </div>
      )}

      <StickyActionButtons />
    </div>
    </>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><LoadingSpinner /></div>}>
      <ProductDetailContent />
    </Suspense>
  )
}
