'use client'
import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'
import RatingStars from './RatingStars'
import Image from 'next/image'
import { Button } from './ui/button'
import { useAuth } from '@/context/ClerkAuthContext'
import { useToast } from '@/hooks/use-toast'
import { Star } from 'lucide-react'

const mockReviews = [
    {
        author: "Priya S.",
        rating: 5,
        title: "Excellent Product!",
        body: "I've been using this for a few weeks now and I'm very impressed. The quality is fantastic and it exceeded my expectations. Highly recommended!",
        date: "2023-08-15",
        image: "https://images.unsplash.com/photo-1510557880182-3f8c5f03adab?q=80&w=400&auto=format&fit=crop"
    },
    {
        author: "Amit K.",
        rating: 4,
        title: "Good value for money",
        body: "Overall, a great product for the price. It does exactly what it says it will do. The only minor issue was with the packaging, but the product itself is solid.",
        date: "2023-08-12",
        image: null
    },
    {
        author: "Sunita M.",
        rating: 5,
        title: "Just what I needed",
        body: "I was looking for a product like this for a long time. It fits my needs perfectly. The delivery was quick and the customer service was helpful.",
        date: "2023-08-10",
        image: "https://images.unsplash.com/photo-1510552776732-01acc9a4c38e?q=80&w=400&auto=format&fit=crop"
    },
     {
        author: "Rajesh V.",
        rating: 3,
        title: "It's okay",
        body: "The product is decent, but not as amazing as some other reviews suggested. It's functional, but I wish it had a few more features for the price. It's an average product.",
        date: "2023-08-09",
        image: null
    }
]

export default function CustomerReviews({ product }: { product: Product }) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [reviews, setReviews] = useState(mockReviews)
    const [rating, setRating] = useState(0)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchReviews()
    }, [product.id])

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?productId=${product.id}`)
            if (response.ok) {
                const data = await response.json()
                setReviews([...data, ...mockReviews])
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        }
    }

    const submitReview = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to write a review", variant: "destructive" })
            return
        }
        if (!rating || !title || !body) {
            toast({ title: "Missing Information", description: "Please fill all fields", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    userId: user.id,
                    userName: user.fullName || user.email?.split('@')[0] || 'Anonymous',
                    rating,
                    title,
                    body
                })
            })

            if (response.ok) {
                toast({ title: "Review Submitted!", description: "Thank you for your review" })
                setRating(0)
                setTitle('')
                setBody('')
                fetchReviews()
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to submit review", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card p-6">
                    <h3 className="text-xl font-bold text-center mb-4">Write Your Review</h3>
                    <div className="space-y-4">
                        <div className="text-center">
                            <label className="block text-sm font-medium mb-2">Rate this product</label>
                            <div className="flex justify-center gap-2">
                                {[1,2,3,4,5].map(star => (
                                    <button key={star} onClick={() => setRating(star)} className="p-2 hover:scale-110 transition-transform">
                                        <Star className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && <p className="text-sm text-gray-600 mt-2">{rating} star{rating > 1 ? 's' : ''} selected</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" 
                                placeholder="A catchy title for your review" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Your Review</label>
                            <textarea 
                                value={body} 
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" 
                                rows={4} 
                                placeholder="Share your thoughts on the product..." 
                            />
                        </div>
                        <div className="text-center">
                            <Button onClick={submitReview} disabled={loading} className="bg-brand hover:bg-brand/90 px-8 py-2 w-full">
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                            <div className="text-4xl font-bold">{(product.ratings?.average ?? 0).toFixed(1)}</div>
                            <RatingStars value={product.ratings?.average ?? 0} />
                            <div className="text-xs text-gray-500 mt-1">({product.ratings?.count ?? 0} reviews)</div>
                        </div>
                        <div className="w-full flex-1 px-4">
                            {/* Placeholder for rating breakdown bars */}
                            <div className="text-sm text-center text-gray-400">Rating breakdown unavailable</div>
                        </div>
                    </div>
                    <div className="overflow-y-auto h-96 pr-4 space-y-4">
                        {reviews.map((review, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                        {review.author.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">{review.author}</span>
                                            <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="mt-1">
                                            <RatingStars value={review.rating} size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <h4 className="font-semibold text-md">{review.title}</h4>
                                    <p className="mt-1 text-sm text-gray-600">{review.body}</p>
                                    {review.image && (
                                        <div className="mt-2">
                                            <Image src={review.image} alt="Customer review image" width={80} height={80} className="rounded-md object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
