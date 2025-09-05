
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import PriceTag from '@/components/PriceTag'
import { Pencil, Trash2, Plus, Eye } from 'lucide-react'
import ProductForm from '@/components/NewProductForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProductStore } from '@/lib/productStore'
import { useToast } from '@/hooks/use-toast'

export default function AdminProductsPage() {
    const { products, addProduct, updateProduct, deleteProduct, isLoading, refetch } = useProductStore()
    const [isFormOpen, setFormOpen] = useState(false)
    const [isDetailOpen, setDetailOpen] = useState(false)
    const [isAlertOpen, setAlertOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined)
    const [productToDelete, setProductToDelete] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        // Refresh products when component mounts
        refetch()
    }, [])

    const handleAddProduct = () => {
        setSelectedProduct(undefined)
        setFormOpen(true)
    }

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product)
        setFormOpen(true)
    }

    const handleViewProduct = (product: Product) => {
        setSelectedProduct(product)
        setDetailOpen(true)
    }

    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (selectedProduct?._id) {
                // Editing existing product - use MongoDB _id
                await updateProduct(selectedProduct._id, productData);
                toast({ title: "Product Updated", description: `${productData.name} has been updated.` });
            } else {
                // Adding new product
                await addProduct(productData);
                toast({ title: "Product Added", description: `${productData.name} has been added.` });
            }
            setFormOpen(false)
            setSelectedProduct(undefined)
            // Refresh the product list
            await refetch()
        } catch (error) {
            console.error("Failed to save product:", error)
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast({ title: "Save Failed", description: errorMessage, variant: 'destructive' });
        }
    }

    const confirmDelete = (productId: string) => {
        setProductToDelete(productId)
        setAlertOpen(true)
    }

    const handleDeleteProduct = async () => {
        if (productToDelete) {
            try {
                await deleteProduct(productToDelete);
                toast({ title: "Product Deleted", description: "The product has been permanently deleted." });
                // Refresh the product list
                await refetch()
            } catch (error) {
                console.error("Failed to delete product:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
                toast({ title: "Delete Failed", description: errorMessage, variant: 'destructive' });
            } finally {
                setAlertOpen(false)
                setProductToDelete(null)
            }
        }
    }

    if (isLoading) {
      return (
          <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
      )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Manage Products</h1>
                    <p className="text-gray-600 mt-1">Total Products: {products.length}</p>
                </div>
                <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if (!isOpen) { setFormOpen(false); setSelectedProduct(undefined); } else { setFormOpen(true); } }}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        </DialogHeader>
                        <ProductForm 
                            product={selectedProduct} 
                            onSave={handleSaveProduct}
                            onCancel={() => { setFormOpen(false); setSelectedProduct(undefined); }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg shadow border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 border-b">
                            <tr>
                                <th className="p-4 font-semibold">Product</th>
                                <th className="p-4 font-semibold">Brand</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold">Rating</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id || product.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <Image 
                                                    src={product.image || product.extraImages?.[0] || '/placeholder-product.jpg'} 
                                                    alt={product.name} 
                                                    width={50} 
                                                    height={50} 
                                                    className="rounded-md object-cover border"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-gray-500 text-xs truncate">{product._id || product.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-700">{product.brand || 'N/A'}</td>
                                    <td className="p-4">
                                        <div className="text-gray-700">
                                            <p className="font-medium">{product.category}</p>
                                            <p className="text-xs text-gray-500">{product.subcategory}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-700">
                                            <p className="font-semibold">{product.price?.currency || '₹'}{product.price?.original}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                            product.quantity > 0 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.quantity} units
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {product.ratings?.average > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-sm">{product.ratings.average}</span>
                                                <span className="text-xs text-gray-500">({product.ratings.count})</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">No ratings</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewProduct(product)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditProduct(product)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => confirmDelete(product._id || product.id)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Plus className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first product.</p>
                        <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </div>
                )}
            </div>

            {/* Product Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Product Details</DialogTitle>
                    </DialogHeader>
                    {selectedProduct && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Image 
                                        src={selectedProduct.image || selectedProduct.extraImages?.[0] || '/placeholder-product.jpg'} 
                                        alt={selectedProduct.name} 
                                        width={200} 
                                        height={200} 
                                        className="rounded-lg object-cover border w-full"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Product Name</label>
                                        <p className="text-lg font-semibold">{selectedProduct.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Brand</label>
                                        <p>{selectedProduct.brand || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Category</label>
                                        <p>{selectedProduct.category} / {selectedProduct.subcategory}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Price</label>
                                        <p className="text-xl font-bold text-green-600">
                                            {selectedProduct.price?.currency || '₹'}{selectedProduct.price?.original}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Stock</label>
                                        <p>{selectedProduct.quantity} units</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1 text-gray-700">{selectedProduct.description}</p>
                            </div>
                            {selectedProduct.features && selectedProduct.features.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Features</label>
                                    <ul className="mt-1 list-disc list-inside space-y-1">
                                        {selectedProduct.features.map((feature, index) => (
                                            <li key={index} className="text-gray-700">{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {selectedProduct.extraImages && selectedProduct.extraImages.length > 1 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Additional Images</label>
                                    <div className="mt-2 grid grid-cols-4 gap-2">
                                        {selectedProduct.extraImages.slice(1).map((image, index) => (
                                            <Image 
                                                key={index}
                                                src={image} 
                                                alt={`${selectedProduct.name} ${index + 2}`} 
                                                width={80} 
                                                height={80} 
                                                className="rounded object-cover border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product
                        from your database.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
