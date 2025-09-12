

'use client'
import { useMemo, Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link';
import Image from 'next/image';
import { filterProducts } from '@/lib/search'
import Filters from '@/components/Filters'
import SortBar from '@/components/SortBar'
import ProductCard from '@/components/ProductCard'
import CategoryPills from '@/components/CategoryPills'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CategoryGrid from '@/components/CategoryGrid';
import { cn } from '@/lib/utils';
import { useProductStore } from '@/lib/productStore';
import LoadingSpinner from '@/components/LoadingSpinner';

const techCategories = [
  { name: 'Mobile Accessories', href: '/search?category=Tech&q=mobile', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166', dataAiHint: 'mobile accessories' },
  { name: 'Fans & Cooling', href: '/search?category=Tech&q=fan', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/12249d16-5521-4931-b03a-e672fc47fb87.webp?updatedAt=1757057794638', dataAiHint: 'cooling fans' },
  { name: 'Audio & Headphones', href: '/search?category=Tech&q=headphone', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/79d27a5e-9a1b-4172-a0de-38b988d75132.webp?updatedAt=1757060196152', dataAiHint: 'headphones audio' },
  { name: 'Lighting & LED', href: '/search?category=Tech&q=light', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/1_2_f01846ee-41f6-47f2-a32a-b779928bc234.avif?updatedAt=1757059018234', dataAiHint: 'led lights' },
  { name: 'Computer Accessories', href: '/search?category=Tech&q=mouse', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/2image_316276e3-8e6e-45b7-a4e7-823700729212.webp?updatedAt=1756629696556', dataAiHint: 'computer accessories' },
  { name: 'Power & Cables', href: '/search?category=Tech&q=cable', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/07_4a3ac08b-5f90-4f47-9c6f-a48d0999f3e7.webp?updatedAt=1756628649421', dataAiHint: 'cables power' },
];

const homeCategories = [
    { name: 'Bathroom Accessories', href: '/search?category=Home&subcategory=Bathroom-Accessories', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/02_fa708df0-d2c7-454a-b15b-bb321a5a0efe.webp', dataAiHint: 'Bathroom Accessories' },
    { name: 'Puja Essentials', href: '/search?category=Pooja', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/4_86ddff46-3968-4413-9b38-e66bcd792aae_10_11zon.webp', dataAiHint: 'Puja Essentials' },
    { name: 'Kitchenware', href: '/search?category=Home&subcategory=Kitchenware', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop', dataAiHint: 'kitchenware tools' },
    { name: 'Household Appliances', href: '/search?category=Home&subcategory=Household-Appliances', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/1_37b9809b-d67b-40bb-aa14-f9e109013c88.webp', dataAiHint: 'Household Appliances' },
    { name: 'Home Decor', href: '/search?category=Home&subcategory=HomeDecor', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/01_be46bb9f-00b8-4373-80f2-47d1de4ccf06.webp', dataAiHint: 'Home Decor' },
    { name: 'Home storage', href: '/search?category=Home&subcategory=Home-storage', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/hangers_wordrobe_storage%20(1).webp', dataAiHint: 'Home storage' },
];

const ayurvedicSubCategories = [
  { name: 'Healthy Juice', href: '/search?category=Food%20%26%20Drinks&subcategory=Healthy%20Juice', image: 'https://images.unsplash.com/photo-1652122788538-9aba111c550e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'juice bottles' },
  { name: 'Ayurvedic Medicine', href: '/search?category=Ayurvedic&subcategory=Ayurvedic Medicine', image: 'https://images.unsplash.com/photo-1705083649602-03c5fbae2e89?q=80&w=800&auto=format&fit=crop', dataAiHint: 'ayurvedic herbs' },
  { name: 'Homeopathic Medicines', href: '/search?category=Ayurvedic&subcategory=Homeopathic Medicines', image: 'https://images.unsplash.com/photo-1694035449621-8fe51b28f59f?q=80&w=800&auto=format&fit=crop', dataAiHint: 'herbal remedy' },
  { name: 'Churna', href: '/search?category=Ayurvedic&subcategory=Ayurvedic Medicine&tertiaryCategory=Churna', image: 'https://images.unsplash.com/photo-1704650312022-ed1a76dbed1b?q=80&w=800&auto=format&fit=crop', dataAiHint: 'herbal powder' },
  { name: 'Pooja Items', href: '/search?category=Pooja', image: 'https://images.unsplash.com/photo-1723937188995-beac88d36998?q=80&w=800&auto=format&fit=crop', dataAiHint: 'pooja items' },
  { name: 'Groceries', href: '/search?category=Groceries', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=800&auto=format&fit=crop', dataAiHint: 'grocery store' },
];

const poojaSubCategories = [
    { name: 'Dhoop', href: '/search?category=Pooja&subcategory=Dhoop', image: 'https://images.unsplash.com/photo-1604543213568-963e6e8a4947?q=80&w=800&auto=format&fit=crop', dataAiHint: 'incense dhoop' },
    { name: 'Agarbatti', href: '/search?category=Pooja&subcategory=Agarbatti', image: 'https://images.unsplash.com/photo-1596701878278-2de47143b4eb?q=80&w=800&auto=format&fit=crop', dataAiHint: 'incense sticks' },
    { name: 'Aasan and Mala', href: '/search?category=Pooja&subcategory=Aasan%20and%20Mala', image: 'https://images.unsplash.com/photo-1616836109961-c8a74e5b2e5e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'prayer beads' },
    { name: 'Photo Frame', href: '/search?category=Pooja&subcategory=Photo%20Frame', image: 'https://images.unsplash.com/photo-1579541620958-c6996119565e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'photo frame' },
];

const foodAndDrinksCategories = [
  { name: 'Beverages', href: '/search?category=Food%20%26%20Drinks&subcategory=Beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'refreshing drinks' },
  { name: 'Dry Fruits', href: '/search?category=Food%20%26%20Drinks&subcategory=Dry%20Fruits', image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?q=80&w=800&auto=format&fit=crop', dataAiHint: 'premium dry fruits' },
  { name: 'Healthy Juice', href: '/search?category=Food%20%26%20Drinks&subcategory=Healthy%20Juice', image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=800&auto=format&fit=crop', dataAiHint: 'fresh healthy juices' },
];

const groceriesCategories = [
  { name: 'Ayurvedic Products', href: '/search?category=Ayurvedic', image: 'https://images.unsplash.com/photo-1544131750-2985d621da30?q=80&w=800&auto=format&fit=crop', dataAiHint: 'ayurvedic herbs' },
  { name: 'Food & Drinks', href: '/search?category=Food%20%26%20Drinks', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy beverages' },
  { name: 'Dry Fruits', href: '/search?category=Food%20%26%20Drinks&subcategory=Dry%20Fruits', image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?q=80&w=800&auto=format&fit=crop', dataAiHint: 'premium dry fruits' },
];


function CategoryHeader({ title, description, linkText, bannerImages, categories, bannerColor = "bg-gray-100", buttonColor = "bg-primary" }: { title: string, description: string, linkText: string, bannerImages: string[], categories?: any[], bannerColor?: string, buttonColor?:string }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (bannerImages.length === 0) return;
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [bannerImages.length]);

    return (
        <div className="space-y-8 mb-8">
            <section>
                <div className={cn("relative overflow-hidden rounded-2xl p-4 md:py-2 md:px-6", bannerColor)}>
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div className="text-center md:text-left z-10">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
                            <p className="mt-2 text-sm md:text-base text-gray-600 max-w-md mx-auto md:mx-0">{description}</p>
                            <Button asChild className={cn("mt-4 text-white px-6 py-2 rounded-lg font-semibold transition-colors", buttonColor)}>
                                <Link href="#product-grid">
                                    {linkText}
                                </Link>
                            </Button>
                        </div>
                        <div className="relative h-32 md:h-40">
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1, ease: 'easeInOut' }}
                                    className="absolute inset-0"
                                >
                                    {bannerImages.length > 0 && (
                                        <Image
                                            src={bannerImages[currentImageIndex]}
                                            alt="Category Banner"
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
            
            {categories && <CategoryGrid categories={categories} buttonColor={buttonColor} />}
        </div>
    );
}

function SearchContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const { products, isLoading } = useProductStore();
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(true)
  const [showAllCategories, setShowAllCategories] = useState(false);

  const opts = {
    q: sp.get('query') || undefined,
    category: sp.get('category') || undefined,
    subcategory: sp.get('subcategory') || undefined,
    tertiaryCategory: sp.get('tertiaryCategory') || undefined,
    min: sp.get('min') ? Number(sp.get('min')) : undefined,
    max: sp.get('max') ? Number(sp.get('max')) : undefined,
    brand: sp.get('brand') || undefined,
    rating: sp.get('rating') ? Number(sp.get('rating')) : undefined,
    sort: (sp.get('sort') as any) || undefined,
  }
  
  const list = useMemo(() => filterProducts(products, opts), [products, sp])

  const bestSellers = useMemo(() => {
    const inStockProducts = products.filter(p => p.quantity > 0);
    const shuffled = [...inStockProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 50);
  }, [products]);
  
  const mobileAccessories = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('mobile') || p.name.toLowerCase().includes('phone') || p.name.toLowerCase().includes('stand'))).slice(0, 8);
  }, [products]);
  
  const fansAndCooling = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('fan') || p.name.toLowerCase().includes('cooling') || p.name.toLowerCase().includes('cooler'))).slice(0, 8);
  }, [products]);
  
  const audioProducts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('audio') || p.name.toLowerCase().includes('speaker'))).slice(0, 8);
  }, [products]);
  
  const lightingProducts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('light') || p.name.toLowerCase().includes('led') || p.name.toLowerCase().includes('bulb'))).slice(0, 8);
  }, [products]);
  
  const computerAccessories = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('mouse') || p.name.toLowerCase().includes('computer') || p.name.toLowerCase().includes('laptop'))).slice(0, 8);
  }, [products]);
  
  const powerAndCables = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('cable') || p.name.toLowerCase().includes('adapter') || p.name.toLowerCase().includes('charger') || p.name.toLowerCase().includes('usb'))).slice(0, 8);
  }, [products]);
  
  const allCategoryLinks = [
      { name: 'Tech', href: '/search?category=Tech', image: 'https://images.unsplash.com/photo-1550009158-94ae76552485?q=80&w=400&auto=format&fit=crop', dataAiHint: 'latest gadgets' },
      { name: 'Home', href: '/search?category=Home', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200&auto=format&fit=crop', dataAiHint: 'stylish apparel' },
      { name: 'Ayurvedic', href: '/search?category=Ayurvedic', image: ayurvedicSubCategories[1].image, dataAiHint: 'natural remedies' },
      { name: 'Food & Drinks', href: '/search?category=Food%20%26%20Drinks', image: foodAndDrinksCategories[0].image, dataAiHint: 'delicious food' },
      { name: 'Pooja', href: '/search?category=Pooja', image: poojaSubCategories[0].image, dataAiHint: 'pooja items' },
      { name: 'Groceries', href: '/search?category=Groceries', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=800&auto=format&fit=crop', dataAiHint: 'fresh groceries' },
  ];
  
  const renderCategoryHeader = () => {
    if (opts.q || opts.subcategory || opts.tertiaryCategory || showAllCategories) return null;

    switch (opts.category) {
        case 'Ayurvedic':
            return <CategoryHeader 
                title="100% Pure Ayurvedic Products"
                description="Get authentic Ashram products delivered right to your doorstep, anywhere in India!"
                linkText="Shop Now"
                bannerImages={[
                    "https://images.unsplash.com/photo-1544131750-2985d621da30?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1605952671385-a04ea67ade59?q=80&w=1200&auto=format&fit=crop"
                ]}
                categories={ayurvedicSubCategories}
                bannerColor="bg-green-50"
                buttonColor="bg-green-700 hover:bg-green-800"
            />
        case 'Tech':
            return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Latest in Tech"
                      description="Explore the newest gadgets and accessories to elevate your lifestyle."
                      linkText="Shop Tech"
                      bannerImages={[
                          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1200&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1200&auto=format&fit=crop",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/01_be46bb9f-00b8-4373-80f2-47d1de4ccf06.webp",
                      ]}
                      bannerColor="bg-blue-50"
                      buttonColor="bg-blue-600 hover:bg-blue-700"
                  />
                  <div>
                      <h2 className="text-2xl font-bold mb-4 text-center">Top Tech Categories</h2>
                       <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                        {techCategories.map((category) => (
                          <Link key={category.name} href={category.href} className="group block text-center">
                            <div className="relative w-24 h-24 mx-auto rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden transition-all duration-300 group-hover:border-brand group-hover:shadow-lg">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="33vw"
                                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                                  data-ai-hint={category.dataAiHint}
                                />
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-brand">{category.name}</h3>
                          </Link>
                        ))}
                      </div>
                  </div>
                  
                  {mobileAccessories.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Mobile Accessories</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {mobileAccessories.map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                  
                  {fansAndCooling.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Fans & Cooling</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {fansAndCooling.map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                  
                  {audioProducts.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Audio & Headphones</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {audioProducts.map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                  
                  {lightingProducts.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Lighting & LED</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {lightingProducts.map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                  
                  {computerAccessories.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Computer Accessories</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {computerAccessories.map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                  
                  {powerAndCables.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Power & Cables</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {powerAndCables.map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                </div>
            );
        case 'Home':
             return <CategoryHeader 
                title="Beautiful Home & Kitchen"
                description="Elevate your living space with our curated collection of home and kitchen accessories."
                linkText="Shop Home & Kitchen"
                bannerImages={[
                    "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?q=80&w=1200&auto=format&fit=crop",
                ]}
                categories={homeCategories}
                bannerColor="bg-pink-50"
                buttonColor="bg-pink-500 hover:bg-pink-600"
            />
        case 'Food & Drinks':
             return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Delicious Food & Drinks"
                      description="Explore our range of healthy and tasty beverages and dry fruits."
                      linkText="Shop Now"
                      bannerImages={[
                          "https://images.unsplash.com/photo-1578852632225-17a4c48a472c?q=80&w=1200&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1595425126622-db139b5523f0?q=80&w=1200&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1551024709-8f232a510e52?q=80&w=1200&auto=format&fit=crop",
                      ]}
                      categories={foodAndDrinksCategories}
                      bannerColor="bg-orange-50"
                      buttonColor="bg-orange-500 hover:bg-orange-600"
                  />
                  
                  {/* Show Beverages */}
                  {products.filter(p => p.category === 'Food & Drinks' && p.subcategory === 'Beverages' && p.quantity > 0).length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Refreshing Beverages</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {products.filter(p => p.category === 'Food & Drinks' && p.subcategory === 'Beverages' && p.quantity > 0).slice(0, 8).map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                  
                  {/* Show Dry Fruits */}
                  {products.filter(p => p.category === 'Food & Drinks' && p.subcategory === 'Dry Fruits' && p.quantity > 0).length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Premium Dry Fruits</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {products.filter(p => p.category === 'Food & Drinks' && p.subcategory === 'Dry Fruits' && p.quantity > 0).slice(0, 8).map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                  
                  {/* Show Healthy Juices */}
                  {products.filter(p => p.category === 'Food & Drinks' && p.subcategory === 'Healthy Juice' && p.quantity > 0).length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Healthy Juices</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {products.filter(p => p.category === 'Food & Drinks' && p.subcategory === 'Healthy Juice' && p.quantity > 0).slice(0, 8).map(p => <ProductCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                </div>
             )
         case 'Pooja':
            return <CategoryHeader 
                title="Sacred Pooja Essentials"
                description="Find all your pooja samagri in one place. Pure and authentic items for your rituals."
                linkText="Explore Items"
                bannerImages={[
                    "https://images.unsplash.com/photo-1604543213568-963e6e8a4947?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1596701878278-2de47143b4eb?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1616836109961-c8a74e5b2e5e?q=80&w=1200&auto=format&fit=crop",
                ]}
                categories={poojaSubCategories}
                bannerColor="bg-amber-50"
                buttonColor="bg-amber-600 hover:bg-amber-700"
            />
        case 'Groceries':
            return <CategoryHeader 
                title="Fresh Groceries & Daily Needs"
                description="Get all your daily essentials delivered fresh to your doorstep."
                linkText="Shop Groceries"
                bannerImages={[
                    "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200&auto=format&fit=crop",
                ]}
                categories={groceriesCategories}
                bannerColor="bg-green-50"
                buttonColor="bg-green-600 hover:bg-green-700"
            />
        default:
             if (!opts.category) {
                return null;
            }
            return null;
    }
  }

  const renderTertiaryCategoryHeader = () => {
      const sub = opts.subcategory;
      if (!sub || opts.tertiaryCategory) return null;
      
      const subcategoryTertiary = [...new Set(products
          .filter(p => p.subcategory === sub && p.tertiaryCategory)
          .map(p => p.tertiaryCategory!)
      )].map(tc => ({
          name: tc.replace(/-/g, ' '),
          href: `/search?category=${opts.category}&subcategory=${sub}&tertiaryCategory=${tc}`,
          image: products.find(p => p.tertiaryCategory === tc)?.image || 'https://images.unsplash.com/photo-1617470732899-736c4f3a743b?q=80&w=800&auto=format&fit=crop',
          dataAiHint: tc.toLowerCase()
      }));

      if(subcategoryTertiary.length === 0) return null;

      return <CategoryHeader 
            title={sub.replace(/-/g, ' ')}
            description="Traditional and effective remedies for your health and well-being."
            linkText="Explore Now"
            bannerImages={[
                'https://images.unsplash.com/photo-1594495894542-a46cc73e081a?q=80&w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1704650312022-ed1a76dbed1b?q=80&w=1200&auto=format&fit=crop'
            ]}
            categories={subcategoryTertiary}
            bannerColor="bg-emerald-50"
            buttonColor="bg-emerald-700 hover:bg-emerald-800"
        />
  }
  
  const PageTitle = () => {
    if (opts.q) {
      return <h1 className="text-2xl font-bold mb-4">Search results for &quot;{opts.q}&quot;</h1>
    }
    
    if (!opts.category && !showAllCategories) {
        return (
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Our Best Sellers</h1>
                <p className="text-gray-600 mt-1">Handpicked for you from our most popular items.</p>
            </div>
        )
    }

    if (!opts.category && showAllCategories) {
         return (
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Shop by Category</h1>
                <p className="text-gray-600 mt-1">Find what you're looking for from our wide selection of categories.</p>
            </div>
        )
    }

    const Breadcrumb = () => (
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/search" className="hover:text-brand">Home</Link>
        {opts.category && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <Link href={`/search?category=${opts.category}`} className="hover:text-brand">
              {opts.category.replace(/%20/g, ' ')}
            </Link>
          </>
        )}
        {opts.subcategory && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <Link href={`/search?category=${opts.category}&subcategory=${opts.subcategory}`} className="hover:text-brand">
              {opts.subcategory.replace(/-/g, ' ')}
            </Link>
          </>
        )}
        {opts.tertiaryCategory && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <span className="font-semibold text-gray-700">
                {opts.tertiaryCategory.replace(/-/g, ' ')}
            </span>
          </>
        )}
      </nav>
    );

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft size={20} />
            </button>
            <Breadcrumb />
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
          <LoadingSpinner />
      </div>
    )
  }

  const renderContent = () => {
    if (!opts.q && !opts.category && !opts.subcategory && !opts.tertiaryCategory && !showAllCategories) {
      // Best Seller View
      return (
        <>
          <PageTitle />
          <div className="text-center mb-8">
            <Button onClick={() => setShowAllCategories(true)} variant="outline">
              Or, Shop All Categories &rarr;
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {bestSellers.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </>
      );
    }

    if (showAllCategories) {
      // All Categories View
       return (
        <>
            <PageTitle />
             <div className="text-center mb-8">
                <Button onClick={() => setShowAllCategories(false)} variant="outline">
                  &larr; Back to Best Sellers
                </Button>
            </div>
            <CategoryGrid categories={allCategoryLinks} />
        </>
       )
    }

    // Default Filtered View
    return (
      <div id="product-grid" className="scroll-mt-20">
        <div className="md:hidden">
          <CategoryPills />
        </div>
        <div className="grid md:grid-cols-[auto_1fr] gap-6">
          <AnimatePresence>
            {isFilterVisible && (
              <motion.aside 
                className="hidden md:block w-[240px]"
                initial={{ width: 0, opacity: 0, x: -100 }}
                animate={{ width: 240, opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="sticky top-24">
                  <Filters />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <section>
            <PageTitle />
            <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="md:hidden">
                        <Sheet open={isFilterOpen} onOpenChange={setFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <div className="p-4 overflow-y-auto">
                                    <h3 className="text-lg font-semibold mb-4">Filters</h3>
                                    <Filters />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setIsFilterVisible(!isFilterVisible)}
                      className="hidden md:inline-flex"
                    >
                      {isFilterVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                    </Button>
                    <div className="hidden sm:block">
                      <div className="text-sm text-gray-600">Showing {list.length} result{list.length === 1 ? '' : 's'}</div>
                      {opts.q && !opts.subcategory && <div className="text-xs text-gray-500">for &quot;{opts.q}&quot;</div>}
                    </div>
                </div>
              <SortBar />
            </div>
            {list.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {list.map(p => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center py-10 rounded-xl border bg-white">
                    <p className="text-gray-600">No products found in this category.</p>
                    <p className="text-sm text-gray-500">But here are some related products you might like:</p>
                </div>
                
                {/* Show related products when category is empty */}
                {(() => {
                  let relatedProducts = [];
                  
                  // If searching in Tech category, show all tech products
                  if (opts.category === 'Tech') {
                    relatedProducts = products.filter(p => p.category === 'Tech' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Home category, show home products
                  else if (opts.category === 'Home') {
                    relatedProducts = products.filter(p => p.category === 'Home' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Ayurvedic category, show ayurvedic products
                  else if (opts.category === 'Ayurvedic') {
                    relatedProducts = products.filter(p => p.category === 'Ayurvedic' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Food & Drinks category
                  else if (opts.category === 'Food & Drinks') {
                    relatedProducts = products.filter(p => p.category === 'Food & Drinks' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Pooja category
                  else if (opts.category === 'Pooja') {
                    relatedProducts = products.filter(p => p.category === 'Pooja' && p.quantity > 0).slice(0, 12);
                  }
                  // Default: show popular products from all categories
                  else {
                    relatedProducts = products.filter(p => p.quantity > 0 && p.price.discounted).slice(0, 12);
                  }
                  
                  if (relatedProducts.length === 0) {
                    relatedProducts = products.filter(p => p.quantity > 0).slice(0, 12);
                  }
                  
                  return relatedProducts.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-center">Related Products</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                        {relatedProducts.map(p => (
                          <ProductCard key={p.id} p={p} />
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {renderCategoryHeader()}
      {renderTertiaryCategoryHeader()}
      {renderContent()}
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><LoadingSpinner /></div>}>
      <SearchContent />
    </Suspense>
  )
}
