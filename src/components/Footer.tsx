import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-white">ShopWave</h3>
            <p className="text-sm text-gray-400 mt-2">India's premier social shopping platform.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Categories</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li><Link href="/category/tech" className="text-gray-400 hover:text-white">Tech Accessories</Link></li>
              <li><Link href="/category/home" className="text-gray-400 hover:text-white">Home & Kitchen</Link></li>
              <li><Link href="/category/ayurvedic" className="text-gray-400 hover:text-white">Ayurvedic Products</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white">All Products</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Support</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><a href="tel:+919157499884" className="text-gray-400 hover:text-white">+91 91574 99884</a></li>
              <li><a href="https://wa.me/919157499884" className="text-gray-400 hover:text-white">WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Follow Us</h3>
            <div className="flex items-center gap-4 mt-2">
              <Link href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></Link>
              <Link href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></Link>
              <Link href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} ShopWave. All rights reserved.</p>
            <div className="flex gap-4 text-xs">
              <Link href="/about" className="text-gray-400 hover:text-white">About</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
