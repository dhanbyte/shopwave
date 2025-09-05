'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const categories = ['Tech', 'Home', 'Ayurvedic', 'Beauty', 'Groceries', 'Pooja', 'Food & Drinks']
const subcategories: Record<string, string[]> = {
    Tech: ['Mobiles', 'Laptops', 'Audio', 'Cameras', 'Wearables', 'Accessories', 'Tablets'],
    Home: ['Decor', 'Lighting', 'Kitchenware', 'Wall Decor', 'Appliances', 'Smart-Home', 'Puja-Essentials'],
    Ayurvedic: ['Ayurvedic Medicine', 'Homeopathic Medicines', 'Personal-Care'],
    Beauty: ['Makeup', 'Skincare', 'Hair-Care'],
    Groceries: ['Staples', 'Snacks', 'Oils'],
    Pooja: ['Dhoop', 'Agarbatti', 'Aasan and Mala', 'Photo Frame'],
    'Food & Drinks': ['Beverages', 'Dry Fruits', 'Healthy Juice']
}

interface ProductFormProps {
    product?: Product
    onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
    onCancel: () => void
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        slug: product?.slug || '',
        brand: product?.brand || '',
        category: product?.category || 'Pooja',
        subcategory: product?.subcategory || 'Aasan and Mala',
        price_original: product?.price_original || 0,
        price_currency: product?.price_currency || '₹',
        quantity: product?.quantity || 0,
        description: product?.description || '',
        features: product?.features || [],
        ratings_average: product?.ratings_average || 0,
        ratings_count: product?.ratings_count || 0,
        extraImages: product?.extraImages || []
    })

    const [newFeature, setNewFeature] = useState('')
    const [newImageUrl, setNewImageUrl] = useState('')
    const { toast } = useToast()

    // Auto-generate slug from name
    useEffect(() => {
        if (formData.name && !product) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-')
            setFormData(prev => ({ ...prev, slug }))
        }
    }, [formData.name, product])

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCategoryChange = (category: string) => {
        setFormData(prev => ({
            ...prev,
            category,
            subcategory: subcategories[category]?.[0] || ''
        }))
    }

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }))
            setNewFeature('')
        }
    }

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }

    const addImage = () => {
        if (newImageUrl.trim()) {
            setFormData(prev => ({
                ...prev,
                extraImages: [...prev.extraImages, newImageUrl.trim()]
            }))
            setNewImageUrl('')
        }
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            extraImages: prev.extraImages.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.name.trim()) {
            toast({ title: "Error", description: "Product name is required", variant: "destructive" })
            return
        }
        if (!formData.category) {
            toast({ title: "Error", description: "Category is required", variant: "destructive" })
            return
        }
        if (formData.price_original <= 0) {
            toast({ title: "Error", description: "Price must be greater than 0", variant: "destructive" })
            return
        }

        onSave(formData)
    }

    return (
        <div className="max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug (URL-friendly name)
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => handleInputChange('slug', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="product-slug"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand
                            </label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleInputChange('brand', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brand name"
                            />
                        </div>
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Category</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                aria-label="Select product category"
                                title="Select product category"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subcategory
                            </label>
                            <select
                                value={formData.subcategory}
                                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Select product subcategory"
                                title="Select product subcategory"
                            >
                                {subcategories[formData.category]?.map(subcat => (
                                    <option key={subcat} value={subcat}>{subcat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Price & Stock */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Price & Stock</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price *
                            </label>
                            <input
                                type="number"
                                value={formData.price_original}
                                onChange={(e) => handleInputChange('price_original', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                value={formData.price_currency}
                                onChange={(e) => handleInputChange('price_currency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Select currency"
                                title="Select currency"
                            >
                                <option value="₹">₹ (INR)</option>
                                <option value="$">$ (USD)</option>
                                <option value="€">€ (EUR)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Quantity
                            </label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your product..."
                        />
                    </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Features</h3>
                    
                    <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => {
                                        const newFeatures = [...formData.features]
                                        newFeatures[index] = e.target.value
                                        handleInputChange('features', newFeatures)
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter product feature"
                                    title="Enter product feature"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFeature(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Add a feature..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addFeature}
                            >
                                <PlusCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                    
                    <div className="space-y-2">
                        {formData.extraImages.map((image, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="url"
                                    value={image}
                                    onChange={(e) => {
                                        const newImages = [...formData.extraImages]
                                        newImages[index] = e.target.value
                                        handleInputChange('extraImages', newImages)
                                    }}
                                    placeholder="https://example.com/image.jpg"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        
                        <div className="flex items-center gap-2">
                            <input
                                type="url"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="Add image URL..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addImage}
                            >
                                <PlusCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Ratings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Ratings (Optional)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Average Rating (0-5)
                            </label>
                            <input
                                type="number"
                                value={formData.ratings_average}
                                onChange={(e) => handleInputChange('ratings_average', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="0.0"
                                title="Average rating from 0 to 5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Ratings
                            </label>
                            <input
                                type="number"
                                value={formData.ratings_count}
                                onChange={(e) => handleInputChange('ratings_count', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                placeholder="0"
                                title="Number of ratings"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {product ? 'Update Product' : 'Add Product'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
