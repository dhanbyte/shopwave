import { Users, Target, Award, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About ShopWave</h1>
        <p className="text-xl text-gray-600">India's Premier Social Shopping Platform</p>
      </div>

      <div className="card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Our Story</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          ShopWave.social was born from a simple idea: shopping should be social, rewarding, and fun. 
          We believe that the best product recommendations come from friends and community members who 
          have actually used the products.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Our platform combines the convenience of online shopping with the power of social recommendations 
          and referral rewards, creating a unique shopping experience that benefits everyone in our community.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card p-6 text-center">
          <Users className="h-12 w-12 text-brand mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Community First</h3>
          <p className="text-gray-600">Building a community of smart shoppers who help each other find the best deals</p>
        </div>
        
        <div className="card p-6 text-center">
          <Target className="h-12 w-12 text-brand mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
          <p className="text-gray-600">Curated selection of tech, home, and ayurvedic products from trusted brands</p>
        </div>
        
        <div className="card p-6 text-center">
          <Award className="h-12 w-12 text-brand mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Reward System</h3>
          <p className="text-gray-600">Earn coins and discounts by sharing products and referring friends</p>
        </div>
        
        <div className="card p-6 text-center">
          <Heart className="h-12 w-12 text-brand mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Customer Care</h3>
          <p className="text-gray-600">Dedicated support team available 9 AM - 9 PM to help you</p>
        </div>
      </div>

      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-4">Why Choose ShopWave.social?</h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">•</span>
            <span>Social shopping experience with community recommendations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">•</span>
            <span>Referral rewards system - earn while you shop and share</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">•</span>
            <span>Curated products across Tech, Home, and Ayurvedic categories</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">•</span>
            <span>Fast delivery and excellent customer support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">•</span>
            <span>Secure payments and hassle-free returns</span>
          </li>
        </ul>
      </div>
    </div>
  )
}