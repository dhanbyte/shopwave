'use client'

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  PlusCircle, 
  Loader2,
  Gift,
  Video,
  Edit,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN');
};

// Simple toast implementation
const useToast = () => {
  return {
    toast: (options: { title: string; description: string; variant?: string }) => {
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 p-4 rounded-md ${
        options.variant === 'destructive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`;
      toast.innerHTML = `
        <h3 class="font-bold">${options.title}</h3>
        <p>${options.description}</p>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    }
  };
};

// UI Components
const Button = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ 
  children, 
  variant = 'default',
  className = ''
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'destructive';
  className?: string;
}) => {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  colorClass = { bg: 'bg-gray-100', text: 'text-gray-600' }
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  colorClass?: { bg: string; text: string };
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClass.bg} ${colorClass.text} mr-4`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Types
type Product = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  isInReferralProgram?: boolean;
};

type PromoProduct = {
  id: string;
  name: string;
  commission: number;
  commissionType: string;
  videoUrl: string;
  referredSales: number;
  productId?: string;
};

type WithdrawalRequest = {
  id: string;
  userName: string;
  amount: number;
  upiId: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
};

// Main Component
export default function AdminReferralPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PromoProduct | null>(null);
  const [productForm, setProductForm] = useState({
    productId: '',
    name: '', 
    commission: '', 
    commissionType: 'fixed' as 'fixed' | 'percentage',
    videoUrl: ''
  });
  
  // State for real data
  const [stats, setStats] = useState({
    totalReferredSales: 0,
    totalActiveReferrers: 0,
    totalCommissionsPaid: 0,
    pendingWithdrawals: 0
  });

  const [promoProducts, setPromoProducts] = useState<PromoProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  // Fetch stats data
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/referral/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const { data } = await response.json();
      setStats({
        totalReferredSales: data.totalReferredSales || 0,
        totalActiveReferrers: data.totalActiveReferrers || 0,
        totalCommissionsPaid: data.totalCommissionsPaid || 0,
        pendingWithdrawals: data.pendingWithdrawals || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stats',
        variant: 'destructive',
      });
    }
  };

  // Fetch all products and promotional products
  const fetchAllProducts = async () => {
    try {
      // Fetch all products
      const [productsRes, promoRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/referral/products')
      ]);

      if (!productsRes.ok) throw new Error('Failed to fetch products');
      if (!promoRes.ok) throw new Error('Failed to fetch promotional products');

      const [productsData, promoData] = await Promise.all([
        productsRes.json(),
        promoRes.json()
      ]);

      // Get IDs of products already in referral program
      const promoProductIds = new Set(promoData.data.map((p: PromoProduct) => p.productId));

      // Mark products that are in the referral program
      const productsWithStatus = productsData.products.map((product: Product) => ({
        ...product,
        isInReferralProgram: promoProductIds.has(product._id)
      }));

      setAllProducts(productsWithStatus);
      setPromoProducts(promoData.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    }
  };

  // Fetch withdrawal requests
  const fetchWithdrawalRequests = async () => {
    try {
      const response = await fetch('/api/admin/referral/withdrawals');
      if (!response.ok) throw new Error('Failed to fetch withdrawals');
      const { data } = await response.json();
      setWithdrawalRequests(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load withdrawal requests',
        variant: 'destructive',
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchAllProducts(),
          fetchWithdrawalRequests()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || !productForm.productId) return;
    
    try {
      setIsProcessing(true);
      const selectedProduct = allProducts.find(p => p._id === productForm.productId);
      
      if (!selectedProduct) {
        throw new Error('Selected product not found');
      }
      
      const isEdit = !!editingProduct;
      const url = isEdit 
        ? `/api/admin/referral/products/${editingProduct?.id}`
        : '/api/admin/referral/products';
      
      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          name: selectedProduct.name,
          referralCommission: Number(productForm.commission),
          referralCommissionType: productForm.commissionType,
          videoUrl: productForm.videoUrl,
          referralEligible: true
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${isEdit ? 'update' : 'add'} product`);
      }

      // Refresh the products list
      await fetchAllProducts();
      
      // Reset form and close modal
      setProductForm({ 
        productId: '',
        name: '', 
        commission: '', 
        commissionType: 'fixed', 
        videoUrl: '' 
      });
      setEditingProduct(null);
      setIsProductModalOpen(false);
      
      toast({
        title: 'Success',
        description: `Product ${isEdit ? 'updated' : 'added to referral program'} successfully`,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle product selection for edit
  const handleEditProduct = (product: PromoProduct) => {
    setEditingProduct(product);
    setProductForm({
      productId: product.productId || '',
      name: product.name,
      commission: product.commission.toString(),
      commissionType: (product.commissionType || 'fixed') as 'fixed' | 'percentage',
      videoUrl: product.videoUrl || ''
    });
    setIsProductModalOpen(true);
  };

  // Handle product selection for add
  const handleProductSelect = (productId: string) => {
    const selected = allProducts.find(p => p._id === productId);
    if (selected) {
      setProductForm(prev => ({
        ...prev,
        productId: selected._id,
        name: selected.name,
        commission: '',
        commissionType: 'fixed',
        videoUrl: ''
      }));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the referral program?') || isProcessing) return;
    
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/admin/referral/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove product');
      }
      
      // Refresh the products list
      await fetchAllProducts();
      
      toast({
        title: 'Success',
        description: 'Product removed from referral program',
      });
      
      // If editing this product, reset the form
      if (editingProduct?.id === id) {
        setEditingProduct(null);
        setProductForm({
          productId: '',
          name: '',
          commission: '',
          commissionType: 'fixed',
          videoUrl: ''
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawalAction = async (id: string, action: 'approve' | 'reject') => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/admin/referral/withdrawals/${id}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${action} withdrawal`);
      }
      
      // Refresh the withdrawals list and stats
      await Promise.all([
        fetchWithdrawalRequests(),
        fetchStats()
      ]);
      
      toast({
        title: 'Success',
        description: `Withdrawal request ${action}d successfully`,
      });
      
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action} withdrawal request`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Referral Program Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Referred Sales" 
          value={formatCurrency(stats.totalReferredSales)}
          icon={DollarSign}
          colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
        />
        <StatCard 
          title="Total Commissions Paid" 
          value={formatCurrency(stats.totalCommissionsPaid)}
          icon={DollarSign}
          colorClass={{ bg: 'bg-green-50', text: 'text-green-600' }}
        />
        <StatCard 
          title="Active Referrers" 
          value={stats.totalActiveReferrers}
          icon={Users}
          colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
        />
        <StatCard 
          title="Pending Withdrawals" 
          value={stats.pendingWithdrawals}
          icon={Gift}
          colorClass={{ bg: 'bg-yellow-50', text: 'text-yellow-600' }}
        />
      </div>

      {/* Promotional Products */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Promotional Products</h2>
          <Button 
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                productId: '',
                name: '',
                commission: '',
                commissionType: 'fixed',
                videoUrl: ''
              });
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promoProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₹{product.commission.toLocaleString()} 
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.commissionType === 'percentage' ? '%' : 'fixed'})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.videoUrl ? (
                      <a 
                        href={product.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        View Video
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No video</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.referredSales}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900 mr-4"
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleEditProduct(product)}
                      disabled={isProcessing}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {promoProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No promotional products found. Add your first product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Requests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6">Withdrawal Requests</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPI ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawalRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{request.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.upiId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(request.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={request.status === 'pending' ? 'default' : request.status === 'approved' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'pending' && (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleWithdrawalAction(request.id, 'approve')}
                          className="text-green-600 hover:text-green-900 flex items-center"
                          disabled={isProcessing}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(request.id, 'reject')}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          disabled={isProcessing}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <span className="text-gray-400">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawalRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No withdrawal requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add Product to Referral Program'}
              </h1>
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      productId: '',
                      name: '',
                      commission: '',
                      commissionType: 'fixed',
                      videoUrl: ''
                    });
                    setIsProductModalOpen(false);
                  }}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
            
            <form onSubmit={handleProductSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingProduct ? 'Product' : 'Select Product'}
                  </label>
                  {editingProduct ? (
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <div className="flex items-center space-x-3">
                        {allProducts.find(p => p._id === editingProduct.productId)?.images?.[0] ? (
                          <img 
                            src={allProducts.find(p => p._id === editingProduct.productId)?.images?.[0]} 
                            alt={editingProduct.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {editingProduct.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Editing referral settings
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md">
                      {allProducts.length === 0 ? (
                        <div className="col-span-3 text-center py-4 text-gray-500">
                          {loading ? 'Loading products...' : 'No products available'}
                        </div>
                      ) : (
                        allProducts.map((product) => (
                          <div 
                            key={product._id}
                            onClick={() => handleProductSelect(product._id)}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              product.isInReferralProgram 
                                ? 'bg-green-50 border-green-200 opacity-75 cursor-not-allowed' 
                                : 'hover:border-blue-500 hover:bg-blue-50 border-gray-200'
                            }`}
                            style={product.isInReferralProgram ? { pointerEvents: 'none' } : {}}
                          >
                            <div className="flex items-center space-x-3">
                              {product.images?.[0] ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                  <ImageIcon className="h-5 w-5" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatCurrency(product.price)}
                                </p>
                              </div>
                              {product.isInReferralProgram && (
                                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                  In Program
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                {(productForm.productId || editingProduct) && (
                  <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-700">
                      {editingProduct ? 'Update' : 'Add'} Referral Settings for {editingProduct?.name || allProducts.find(p => p._id === productForm.productId)?.name}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Commission
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="number"
                            className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={productForm.commission}
                            onChange={(e) => setProductForm({...productForm, commission: e.target.value})}
                            min="0"
                            step={productForm.commissionType === 'percentage' ? '0.1' : '1'}
                            required
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center">
                            <select
                              className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={productForm.commissionType}
                              onChange={(e) => setProductForm({...productForm, commissionType: e.target.value as 'fixed' | 'percentage'})}
                            >
                              <option value="fixed">₹</option>
                              <option value="percentage">%</option>
                            </select>
                          </div>
                        </div>
                        {productForm.commissionType === 'percentage' && (
                          <p className="mt-1 text-xs text-gray-500">
                            {productForm.commission || 0}% of product price (₹{allProducts.find(p => p._id === productForm.productId)?.price || 0} × {productForm.commission || 0}% = ₹{((allProducts.find(p => p._id === productForm.productId)?.price || 0) * (parseFloat(productForm.commission) || 0) / 100).toFixed(2)})
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Video URL (Optional)
                        </label>
                        <div className="flex rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            https://
                          </span>
                          <input
                            type="text"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="youtube.com/embed/..."
                            value={productForm.videoUrl.replace('https://', '')}
                            onChange={(e) => setProductForm({...productForm, videoUrl: `https://${e.target.value}`})}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Add a video URL to help promote this product
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm({ 
                        productId: '',
                        name: '', 
                        commission: '', 
                        commissionType: 'fixed', 
                        videoUrl: '' 
                      });
                      setEditingProduct(null);
                      setIsProductModalOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing || !productForm.productId || !productForm.commission}
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        {editingProduct ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : editingProduct ? 'Update Referral Settings' : 'Add to Referral Program'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
