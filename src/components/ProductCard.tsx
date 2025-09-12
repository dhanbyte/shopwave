'use client'
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BellRing, Check, ShoppingCart, Heart } from 'lucide-react';

// Local components
import PriceTag from './PriceTag';
import RatingStars from './RatingStars';
import WishlistButton from './WishlistButton';
import ProductSuggestionsRow from './ProductSuggestionsRow';
import { Button } from './ui/button';
import { useCart } from '../lib/cartStore';
import { toast } from '../hooks/use-toast';

// Types
type Product = {
  id: string;
  name: string;
  image: string;
  price: {
    original: number;
    discounted?: number;
  };
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  category?: string;
};

interface ProductCardProps {
  p?: Product;
  product?: Product;
  suggest?: any[];
}

export default function ProductCard({ p, product, suggest = [] }: ProductCardProps) {
  const productData = p || product;
  if (!productData) return null;
  
  const { add: addToCart } = useCart();
  const price = productData.price.discounted ?? productData.price.original;
  
  // Mock user - in a real app, this would come from your auth context
  const user = { id: '1' }; 
  
  // Mock notification functions
  const hasNotification = (id: string) => false;
  const addNotification = (userId: string, productId: string) => {
    console.log(`Notification set for product ${productId}`);
  };
  
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (isAdded) return;
    
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to add items to cart',
        action: (
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        ),
      });
      return;
    }
    
    addToCart(user.id, {
      id: productData.id,
      name: productData.name,
      image: productData.image,
      price: price,
      qty: 1
    });
    
    setIsAdded(true);
    
    toast({
      title: 'Added to cart',
      description: `${productData.name} has been added to your cart`,
      action: (
        <Link href="/cart" className="text-blue-600 hover:underline">
          View Cart
        </Link>
      ),
    });
  };

  const handleNotifyMe = () => {
    if (!user) {
      toast({ 
        title: "Login Required", 
        description: "Please login to get notifications", 
        type: "destructive" 
      });
      return;
    }
    if (!hasNotification(productData.id)) {
      addNotification(user.id, productData.id);
      toast({ title: "You're on the list!", description: `We'll notify you when ${productData.name} is back in stock.` });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full relative"
    >
      {/* Wishlist Button */}
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton id={productData.id} />
      </div>

      {/* Product Image */}
      <Link href={`/product/${productData.id}`} className="block relative h-48 overflow-hidden group">
        <Image
          src={productData.image}
          alt={productData.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {productData.price.discounted && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round(((productData.price.original - productData.price.discounted) / productData.price.original) * 100)}% OFF
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        {/* Product Name */}
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
          <Link href={`/product/${productData.id}`} className="hover:text-primary">
            {productData.name}
          </Link>
        </h3>

        {/* Rating */}
        {productData.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded">
              <span className="text-yellow-500 font-bold text-sm">{productData.rating.toFixed(1)}</span>
              <svg className="w-3 h-3 text-yellow-400 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 ml-1">({productData.reviewCount || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">₹{productData.price.discounted || productData.price.original}</span>
            {productData.price.discounted && (
              <>
                <span className="text-sm text-gray-500 line-through">₹{productData.price.original}</span>
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">
                  Save ₹{productData.price.original - productData.price.discounted}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart} 
          className={`h-8 px-3 text-sm ${isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          size="sm"
          disabled={isAdded}
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Add
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
