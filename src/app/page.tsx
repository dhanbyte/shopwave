
'use client';

import { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import BannerSlider from '@/components/BannerSlider';
import ProductCard from '@/components/ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import OfferCard from '@/components/OfferCard';
import type { Product } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '@/lib/productStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import MixedProductGrid from '@/components/MixedProductGrid';
import { useToast } from '@/hooks/use-toast';


const topCategories = [
  { name: 'Mobile Accessories', href: '#tech-offers', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=250&h=250&fit=crop&crop=center', dataAiHint: 'mobile accessories' },
  { name: 'Best Selling', href: '/search?sort=popular', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Pooja%20Essential%20Pooja%20Essentials/5_d1720387-45fc-43af-bcd8-ba7c37986e76.webp?updatedAt=1756553382584', dataAiHint: 'best seller' },
  { name: 'New Arrivals', href: '/search?sort=new', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/New_Arrival_W_1.avif', dataAiHint: 'new arrivals' },
  { name: 'Home & Kitchen', href: '/search?category=Home', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Home_Kitchen_W.avif', dataAiHint: 'modern kitchen' },
  { name: 'Personal Care', href: '/search?category=Ayurvedic&subcategory=Personal-Care', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/PersonalCare.avif', dataAiHint: 'personal care' },
  { name: 'Electronics', href: '#tech-offers', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Electronics_W.avif', dataAiHint: 'electronic gadgets' },
  { name: 'Household', href: '/search?category=Home', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Corporate_Gifting_250x250px_2.avif', dataAiHint: 'household items' },
  { name: 'Custom Print Products', href: '/search?category=Tech', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Custom_Print_250x250px.avif', dataAiHint: 'custom printing' },
  { name: 'Food & Drinks', href: '/search?category=Food%20%26%20Drinks', image: 'https://ashramestore.com/wp-content/uploads/2023/02/product-category-banners-700x385-1-600x330.jpg', dataAiHint: 'food and drinks' },
];


const filterCategories = ['All', 'Electronics', 'Home', 'Ayurvedic'];
const PRODUCTS_TO_SHOW = 10;
const VISIBLE_COUNT_KEY = 'home_visible_count';
const SELECTED_CATEGORY_KEY = 'home_selected_category';

export default function Home() {
  const { products, isLoading } = useProductStore();
  const { toast } = useToast();
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_TO_SHOW);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load persisted state on mount
  useEffect(() => {
    const savedVisibleCount = localStorage.getItem(VISIBLE_COUNT_KEY);
    const savedCategory = localStorage.getItem(SELECTED_CATEGORY_KEY);
    
    if (savedVisibleCount) {
      setVisibleCount(parseInt(savedVisibleCount, 10));
    }
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')
    
    if (refCode) {
      // Store referral code in localStorage for checkout
      localStorage.setItem('referralCode', refCode)
      
      toast({
        title: "🎉 Referral Code Applied!",
        description: `Code ${refCode} saved! Get ₹5 discount at checkout`,
        duration: 5000,
      })
      
      // Clean URL after storing the code
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [toast])


  
  const techDeals = useMemo(() => {
    const discounted = products.filter(p => (p.category === 'Tech' || p.category === 'Electronics') && p.price.discounted && p.quantity > 0);
    const regular = products.filter(p => (p.category === 'Tech' || p.category === 'Electronics') && !p.price.discounted && p.quantity > 0);
    return [...discounted, ...regular].slice(0, 8);
  }, [products]);
  
  const homeDeals = useMemo(() => {
    const discounted = products.filter(p => p.category === 'Home' && p.price.discounted && p.quantity > 0);
    const regular = products.filter(p => p.category === 'Home' && !p.price.discounted && p.quantity > 0);
    return [...discounted, ...regular].slice(0, 8);
  }, [products]);
  
  const ayurvedicDeals = useMemo(() => {
    const discounted = products.filter(p => p.category === 'Ayurvedic' && p.price.discounted && p.quantity > 0);
    const regular = products.filter(p => p.category === 'Ayurvedic' && !p.price.discounted && p.quantity > 0);
    return [...discounted, ...regular].slice(0, 8);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const inStockProducts = products.filter(p => p.quantity > 0);
    if (selectedCategory === 'All') {
      return inStockProducts;
    }
    if (selectedCategory === 'Electronics') {
      return inStockProducts.filter(p => p.category === 'Electronics' || p.category === 'Tech');
    }
    return inStockProducts.filter(p => p.category === selectedCategory);
  }, [selectedCategory, products]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(PRODUCTS_TO_SHOW);
    localStorage.setItem(SELECTED_CATEGORY_KEY, category);
    localStorage.setItem(VISIBLE_COUNT_KEY, PRODUCTS_TO_SHOW.toString());
  };
  
  const handleViewMore = () => {
    const newCount = visibleCount + PRODUCTS_TO_SHOW;
    setVisibleCount(newCount);
    localStorage.setItem(VISIBLE_COUNT_KEY, newCount.toString());
  };



  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
          <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "ShopWave.social",
              "alternateName": "ShopWave Social",
              "description": "ShopWave.social - India's premier social shopping platform! Discover trending products, get exclusive deals, earn referral rewards. Tech, Home & Ayurvedic products with social commerce features.",
              "url": "https://shopwave.social",
              "telephone": "+91-91574-99884",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "ShopWave Products",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Tech Accessories",
                      "category": "Electronics"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Home & Kitchen",
                      "category": "Home & Garden"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Ayurvedic Products",
                      "category": "Health & Beauty"
                    }
                  }
                ]
              }
            })
          }}
        />
      </Head>
      <div className="space-y-8">
      <BannerSlider />

      <section>
        <div className="grid grid-cols-3 gap-3">
            <Link href="/category/tech" className="relative block h-24 md:h-48 overflow-hidden rounded-xl group">
                <Image src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1000&auto=format&fit=crop" alt="Tech" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="tech gadgets" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-2">
                    <h3 className="text-md font-bold text-white text-center">Tech Accessories</h3>
                </div>
            </Link>
            <Link href="/category/home" className="relative block h-24 md:h-48 overflow-hidden rounded-xl group">
                <Image src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1000&auto=format&fit=crop" alt="Home" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="modern living room" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-2">
                    <h3 className="text-md font-bold text-white text-center">Home & Kitchen</h3>
                </div>
            </Link>
            <Link href="/category/ayurvedic" className="relative block h-24 md:h-48 overflow-hidden rounded-xl group">
                <Image src="https://images.unsplash.com/photo-1544131750-2985d621da30?q=80&w=1200&auto=format&fit=crop" alt="Ayurvedic" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="ayurvedic products" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-2">
                    <h3 className="text-md font-bold text-white text-center">Ayurvedic Essentials</h3>
                </div>
            </Link>
        </div>
      </section>
      

      
      <section id="tech-offers">
        <h2 className="text-2xl font-bold mb-4 text-center">Top Offers</h2>
         <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            <CarouselItem className="basis-1/2 md:basis-1/3"><OfferCard title="Tech Accessories" products={techDeals} href="/category/tech"/></CarouselItem>
            <CarouselItem className="basis-1/2 md:basis-1/3"><OfferCard title="Home & Kitchen" products={homeDeals} href="/category/home"/></CarouselItem>
            <CarouselItem className="basis-1/2 md:basis-1/3"><OfferCard title="Ayurvedic Essentials" products={ayurvedicDeals} href="/category/ayurvedic"/></CarouselItem>
          </CarouselContent>

        </Carousel>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-center">Top Categories</h2>
         <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {topCategories.map((category, index) => (
            <Link key={category.name} href={category.href} className={`group block text-center ${index === 8 ? 'md:hidden' : ''}`}>
              <div className="relative aspect-square w-full mx-auto max-w-[120px]">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={120}
                  height={120}
                  loading="lazy"
                  className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={category.dataAiHint}
                />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-brand">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-center">Featured Products</h2>
        
        <div className="flex justify-center mb-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 bg-gray-100 rounded-full p-1">
            {filterCategories.map(c => (
              <button 
                key={c} 
                onClick={() => handleCategoryClick(c)} 
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === c ? 'bg-brand text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap -mx-1.5 md:-mx-2">
           {visibleProducts.map(p => (
            <div key={p.id} className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 p-1.5 md:p-2">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
        
        {visibleCount < filteredProducts.length && (
          <div className="text-center mt-8">
            <motion.button
              onClick={handleViewMore}
              className="rounded-xl bg-brand/90 px-8 py-3 font-semibold text-white transition-colors hover:bg-brand"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              View More
            </motion.button>
          </div>
        )}
      </section>
      
    </div>
    </>
  );
}
