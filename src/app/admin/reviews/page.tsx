'use client'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import RatingStars from '@/components/RatingStars'

interface Review {
    _id: string
    productId: string
    userId: string
    userName: string
    rating: number
    title: string
    body: string
    createdAt: string
    approved: boolean
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        try {
            const response = await fetch('/api/admin/reviews')
            const data = await response.json()
            setReviews(data)
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Customer Reviews</h1>

            <div className="card p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-3">Product</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Rating</th>
                                <th className="p-3">Review</th>
                                <th className="p-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(review => (
                                <tr key={review._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="text-xs text-gray-500">{review.productId}</div>
                                    </td>
                                    <td className="p-3 font-medium">{review.userName}</td>
                                    <td className="p-3">
                                        <RatingStars value={review.rating} />
                                    </td>
                                    <td className="p-3">
                                        <div className="font-medium">{review.title}</div>
                                        <div className="text-sm text-gray-600 line-clamp-2">{review.body}</div>
                                    </td>
                                    <td className="p-3">{new Date(review.createdAt).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {reviews.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No reviews found yet.
                    </div>
                )}
            </div>
        </div>
    )
}