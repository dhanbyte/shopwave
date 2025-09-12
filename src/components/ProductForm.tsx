
'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const categories = ['Tech', 'Home', 'Ayurvedic', 'Beauty', 'Groceries', 'Pooja', 'Food & Drinks']
const subcategories: Record<string, string[]> = {
    Tech: ['Mobiles', 'Laptops', 'Audio', 'Cameras', 'Wearables', 'Accessories', 'Tablets'],
    Home: ['Decor', 'Lighting', 'Kitchenware', 'Wall Decor', 'Appliances', 'Smart-Home', 'Puja-Essentials', 'Bathroom-Accessories', 'Cleaning-Supplies', 'Household-Appliances', 'HomeDecor', 'Home-storage'],
    Ayurvedic: ['Ayurvedic Medicine', 'Homeopathic Medicines', 'Personal-Care'],
    Beauty: ['Makeup', 'Skincare', 'Hair-Care'],
    Groceries: ['Staples', 'Snacks', 'Oils'],
    Pooja: ['Dhoop', 'Agarbatti', 'Aasan and Mala', 'Photo Frame'],
    'Food & Drinks': ['Beverages', 'Dry Fruits', 'Healthy Juice']
}

interface ProductFormProps {
    product?: Product
    onSave: (product: Omit<Product, 'id' | 'ratings'>) => void
    onCancel: () => void
}

type FormData = Omit<Product, 'id' | 'ratings'>;

const getInitialFormData = (product?: Product): FormData => ({
    name: product?.name || '',
    slug: product?.slug || '',
    brand: product?.brand || '',
    category: product?.category || 'Tech',
    subcategory: product?.subcategory || (product?.category ? subcategories[product.category]?.[0] : 'Mobiles'),
    tertiaryCategory: product?.tertiaryCategory || '',
    price: { 
        original: product?.price?.original || 0, 
        discounted: product?.price?.discounted || undefined, 
        currency: product?.price?.currency || '₹' 
    },
    quantity: product?.quantity || 0,
    image: product?.image || '',
    extraImages: product?.extraImages || [],
    video: product?.video || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    features: product?.features || [],
    specifications: product?.specifications || {},
    tags: product?.tags || [],
    sku: product?.sku || '',
    shippingCost: product?.shippingCost || 0,
    taxPercent: product?.taxPercent || 18,
    inventory: product?.inventory || { inStock: true, lowStockThreshold: 5 },
    returnPolicy: product?.returnPolicy || { eligible: true, duration: 7 },
    warranty: product?.warranty || '1 Year Warranty',
    status: product?.status || 'active'
});


export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    const [formData, setFormData] = useState<FormData>(getInitialFormData(product));
    const { toast } = useToast();

    useEffect(() => {
        setFormData(getInitialFormData(product));
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
        setFormData(prev => {
            const newState = { ...prev };
            const keys = name.split('.');
            let currentLevel: any = newState;
    
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel = currentLevel[keys[i]] = { ...(currentLevel[keys[i]] || {}) };
            }

            const finalKey = keys[keys.length - 1];
            const numericFields = ['original', 'discounted', 'quantity', 'shippingCost', 'taxPercent', 'duration', 'lowStockThreshold'];

            if (checked !== undefined) {
                 currentLevel[finalKey] = checked;
            } else if (numericFields.includes(finalKey) && value !== '') {
                currentLevel[finalKey] = Number(value);
            } else {
                 currentLevel[finalKey] = value;
            }
    
            return newState;
        });
    };
    
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setFormData(prev => ({
            ...prev,
            category: category,
            subcategory: subcategories[category]?.[0] || '', // Reset subcategory
            tertiaryCategory: '', // Reset tertiary category
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.name && formData.price.original) {
            // Generate slug from name if not provided
            const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            
            const finalData: Omit<Product, 'id' | 'ratings'> = {
                ...formData,
                slug,
                price: {
                    original: Number(formData.price.original),
                    discounted: formData.price.discounted ? Number(formData.price.discounted) : undefined,
                    currency: '₹'
                },
                quantity: Number(formData.quantity),
                shippingCost: Number(formData.shippingCost || 0),
                taxPercent: Number(formData.taxPercent || 18)
            }
            onSave(finalData)
        } else {
            toast({ title: "Missing Information", description: "Please fill in at least Name and Original Price.", variant: "destructive" });
        }
    }
    
    const handleExtraImageChange = (index: number, value: string) => {
        setFormData(prev => {
            const newImages = [...(prev.extraImages || [])];
            newImages[index] = value;
            return { ...prev, extraImages: newImages };
        });
    };

    const addExtraImage = () => {
        setFormData(prev => ({
            ...prev,
            extraImages: [...(prev.extraImages || []), '']
        }));
    };

    const removeExtraImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            extraImages: (prev.extraImages || []).filter((_, i) => i !== index)
        }));
    };

    const handleSpecsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const specsString = e.target.value;
        const specs = specsString.split('\n').reduce((acc, line) => {
            const [key, val] = line.split(':');
            if (key && val) acc[key.trim()] = val.trim();
            return acc;
        }, {} as Record<string, string>);
        setFormData(prev => ({ ...prev, specifications: specs }));
    };

    const Input = ({ name, label, ...props }: any) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input id={name} name={name} onChange={handleChange} {...props} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:ring-brand" />
        </div>
    )
    
    const UploadInput = ({ name, label, value, ...props }: { name: string; label: string; value: string;[key: string]: any; }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center gap-2">
                <input id={name} name={name} value={value} onChange={handleChange} {...props} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:ring-brand" />
                 <Button type="button" variant="outline" size="icon" aria-label="Upload" className="flex-shrink-0" onClick={() => toast({ title: "Upload Info", description: "Pasting image URLs is supported."})}>
                    <Upload className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    const Select = ({ name, label, children, ...props }: any) => (
         <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select id={name} name={name} onChange={props.onChange || handleChange} {...props} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:ring-brand">
                {children}
            </select>
        </div>
    )
    
    const TextArea = ({ name, label, ...props }: any) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea id={name} name={name} onChange={handleChange} {...props} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:ring-brand" />
        </div>
    )
    
    const Checkbox = ({ name, label, ...props }: any) => (
        <div className="flex items-center gap-2">
            <input id={name} name={name} type="checkbox" onChange={handleChange} {...props} className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand" />
            <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
        </div>
    );
    
    const specificationsToString = (specs: Record<string, string> | undefined) => {
        if (!specs) return '';
        return Object.entries(specs).map(([key, value]) => `${key}: ${value}`).join('\n');
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1 pr-4">
            <Input name="name" label="Product Name" value={formData.name} required />
            <Input name="slug" label="Product Slug (URL)" value={formData.slug} placeholder="e.g., galaxy-a54-5g-128" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="brand" label="Brand" value={formData.brand} required />
                <Input name="sku" label="SKU (Stock Keeping Unit)" value={formData.sku} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UploadInput name="image" label="Main Image URL" value={formData.image} placeholder="Upload or paste URL" required />
                <UploadInput name="video" label="Video URL (optional)" value={formData.video} placeholder="Upload or paste URL" />
            </div>
            
             <div className="rounded-md border p-3 space-y-3">
                <h3 className="text-md font-medium">Extra Images</h3>
                {formData.extraImages?.map((imgUrl, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <UploadInput 
                            name={`extraImages.${index}`}
                            label={`Image ${index + 1}`}
                            value={imgUrl}
                            placeholder="Upload or paste URL"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExtraImage(index)} aria-label="Remove image" className="self-end">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addExtraImage} className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Image
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select name="category" label="Category" value={formData.category} onChange={handleCategoryChange}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select name="subcategory" label="Subcategory" value={formData.subcategory}>
                    {(subcategories[formData.category || 'Tech'] || []).map(sc => <option key={sc} value={sc}>{sc.replace(/-/g, ' ')}</option>)}
                </Select>
            </div>
            
            <div className="rounded-md border p-3 space-y-3">
                <h3 className="text-md font-medium">Pricing & Stock</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input name="price.original" label="Original Price" type="number" value={formData.price.original} required min="0" step="0.01" />
                    <Input name="price.discounted" label="Discounted Price" type="number" value={formData.price.discounted || ''} min="0" step="0.01" />
                    <Input name="quantity" label="Stock Quantity" type="number" value={formData.quantity} required min="0" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="shippingCost" label="Shipping Cost" type="number" value={formData.shippingCost || 0} />
                    <Input name="taxPercent" label="Tax Percent" type="number" value={formData.taxPercent || 0} />
                 </div>
            </div>

            <TextArea name="shortDescription" label="Short Description (for product card)" value={formData.shortDescription} rows={2} />
            <TextArea name="description" label="Full Description (for product page)" value={formData.description} rows={4} required />

            <div className="rounded-md border p-3 space-y-3">
                <h3 className="text-md font-medium">Details & SEO</h3>
                <TextArea name="features" label="Features (comma-separated)" value={(formData.features || []).join(', ')} onChange={(e: any) => setFormData(prev => ({ ...prev, features: e.target.value.split(',').map((s: string) => s.trim()) }))} rows={2} />
                <TextArea name="specifications" label="Specifications (one per line, e.g., RAM: 8 GB)" value={specificationsToString(formData.specifications)} onChange={handleSpecsChange} rows={3} />
                <TextArea name="tags" label="Tags for SEO (comma-separated)" value={(formData.tags || []).join(', ')} onChange={(e: any) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map((s: string) => s.trim()) }))} rows={2} />
            </div>

            <div className="rounded-md border p-3 space-y-3">
                <h3 className="text-md font-medium">Policies & Inventory</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="warranty" label="Warranty" value={formData.warranty || ''} />
                     <Select name="status" label="Product Status" value={formData.status || 'active'}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                    </Select>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <Checkbox name="returnPolicy.eligible" label="Return Eligible" checked={formData.returnPolicy?.eligible || false} />
                 </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input name="returnPolicy.duration" label="Return Duration (Days)" type="number" value={formData.returnPolicy?.duration || 7} disabled={!formData.returnPolicy?.eligible}/>
                    <Input name="inventory.lowStockThreshold" label="Low Stock Threshold" type="number" value={formData.inventory?.lowStockThreshold || 5} />
                 </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white py-3">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Product</Button>
            </div>
        </form>
    )
}
