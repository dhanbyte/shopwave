
import type { Product } from '@/lib/types'
import RatingStars from './RatingStars'
import Image from 'next/image'

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
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Customer Reviews</h2>
            <div className="card p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="text-center">
                        <div className="text-5xl font-bold">{(product.ratings?.average ?? 0).toFixed(1)}</div>
                        <RatingStars value={product.ratings?.average ?? 0} />
                        <div className="text-sm text-gray-500 mt-1">Based on {product.ratings?.count ?? 0} reviews</div>
                    </div>
                    <div className="w-full flex-1">
                        {/* Placeholder for rating breakdown bars */}
                        <div className="text-sm text-center text-gray-400">Rating breakdown unavailable</div>
                    </div>
                </div>
                <div className="mt-6 space-y-6">
                    {mockReviews.map((review, index) => (
                        <div key={index} className="border-t pt-4">
                            <div className="flex items-center gap-2">
                                <RatingStars value={review.rating} />
                                <div className="font-semibold">{review.title}</div>
                            </div>
                            <p className="mt-2 text-sm text-gray-700">{review.body}</p>
                            {review.image && (
                                <div className="mt-2">
                                    <Image src={review.image} alt="Customer review image" width={100} height={100} className="rounded-lg object-cover" />
                                </div>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                                <span className="font-medium">{review.author}</span> on {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
