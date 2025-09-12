import { Phone, Mail, MessageCircle, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Help & Support</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card p-6">
          <Phone className="h-8 w-8 text-brand mb-4" />
          <h2 className="text-xl font-semibold mb-2">Call Us</h2>
          <p className="text-gray-600 mb-4">Talk to our support team</p>
          <a href="tel:+919157499884" className="text-brand font-semibold">+91 91574 99884</a>
          <p className="text-sm text-gray-500 mt-2">Mon-Sun: 9 AM - 9 PM</p>
        </div>
        
        <div className="card p-6">
          <MessageCircle className="h-8 w-8 text-green-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">WhatsApp</h2>
          <p className="text-gray-600 mb-4">Quick support via WhatsApp</p>
          <a href="https://wa.me/919157499884" className="text-green-600 font-semibold">Chat Now</a>
          <p className="text-sm text-gray-500 mt-2">Instant replies</p>
        </div>
      </div>

      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">How do I track my order?</h3>
            <p className="text-gray-600">Go to your account page and check the orders section for tracking details.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What is the return policy?</h3>
            <p className="text-gray-600">We offer 7-day return policy for most products. Contact support for returns.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How do referral codes work?</h3>
            <p className="text-gray-600">Share your referral code with friends. They get ₹5 discount, you earn coins when they purchase.</p>
          </div>
        </div>
      </div>
    </div>
  )
}