'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  Download, 
  Check, 
  X, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BarChart2,
  UserCheck,
  Gift,
  FileText,
  Settings,
  Mail,
  Calendar,
  Filter as FilterIcon,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchReferralStats,
  fetchWithdrawalRequests,
  processWithdrawal as processWithdrawalApi,
  fetchPromoProducts,
  updateReferralSettings,
  type ReferralStats,
  type WithdrawalRequest,
} from '@/lib/services/api/adminReferrals';

type TabType = 'overview' | 'withdrawals' | 'referrers' | 'products' | 'settings';

// Mock data fallback in case API fails
const mockStats: ReferralStats = {
  totalReferredSales: 0,
  totalActiveReferrers: 0,
  totalCommissionsPaid: 0,
  pendingWithdrawals: 0,
  topReferrers: [],
};

const ITEMS_PER_PAGE = 10;

// Format currency helper function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date helper function
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
    rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
    processing: { text: 'Processing', color: 'bg-blue-100 text-blue-800' },
  }[status] || { text: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap.color}`}>
      {statusMap.text}
    </span>
  );
};

// Components
const StatCard = ({ title, value, icon: Icon, trend, description, color = 'blue' }: any) => {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  }[color];

  return (
    <div className={`p-6 rounded-lg border ${colors.border} ${colors.bg} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold">
            {typeof value === 'number' && title.includes('₹') 
              ? formatCurrency(value) 
              : value}
          </p>
          {trend !== undefined && (
            <p className={`mt-1 text-sm flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend)}% {description || 'vs last period'}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors.bg} ${colors.text} bg-opacity-30`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
    rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
    processing: { text: 'Processing', color: 'bg-blue-100 text-blue-800' },
  }[status] || { text: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap.color}`}>
      {statusMap.text}
    </span>
  );
};

const ActionButton = ({ 
  children, 
  onClick, 
  variant = 'default',
  loading = false,
  icon: Icon,
  className = ''
}: any) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="h-4 w-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
};

const TablePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = ''
}: any) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> of{' '}
            <span className="font-medium">{totalPages * 10}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">First</span>
              <ChevronsLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === pageNum
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Last</span>
              <ChevronsRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const WithdrawalsTable = ({ withdrawals, onAction }: any) => {
  return (
    <div className="mt-8">
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UPI ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.map((withdrawal: any) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{withdrawal.userName}</div>
                            <div className="text-sm text-gray-500">{withdrawal.upiId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{formatCurrency(withdrawal.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{withdrawal.upiId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(withdrawal.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={withdrawal.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {withdrawal.status === 'pending' ? (
                          <div className="flex justify-end space-x-2">
                            <ActionButton 
                              variant="success" 
                              icon={Check}
                              onClick={() => onAction(withdrawal.id, 'approve')}
                            >
                              Approve
                            </ActionButton>
                            <ActionButton 
                              variant="danger" 
                              icon={X}
                              onClick={() => onAction(withdrawal.id, 'reject')}
                            >
                              Reject
                            </ActionButton>
                          </div>
                        ) : (
                          <ActionButton 
                            variant="outline" 
                            icon={Eye}
                            onClick={() => {}}
                          >
                            View
                          </ActionButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromoProductsTable = ({ products }: any) => {
  return (
    <div className="mt-8">
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-md flex items-center justify-center">
                            <Gift className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.commission)}</div>
                        <div className="text-xs text-gray-500">
                          ({(product.commission / product.price * 100).toFixed(1)}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.sales}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <ActionButton 
                            variant="outline" 
                            size="sm"
                            icon={Edit}
                            onClick={() => {}}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton 
                            variant="outline" 
                            size="sm"
                            icon={Trash2}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {}}
                          >
                            Delete
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopReferrersTable = ({ referrers }: any) => {
  return (
    <div className="mt-8">
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrals
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Earned
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Paid
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrers.map((referrer: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{referrer.name}</div>
                            <div className="text-sm text-gray-500">Referrer ID: {index + 1000}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{referrer.totalReferrals}</div>
                        <div className="text-xs text-gray-500">{Math.floor(Math.random() * 5) + 1} this month</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(referrer.totalEarned)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(referrer.totalPaid)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionButton 
                          variant="outline" 
                          size="sm"
                          icon={Eye}
                          onClick={() => {}}
                        >
                          View
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function AdminReferralsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawalStatus, setWithdrawalStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch referral stats
  const { data: stats = mockStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: fetchReferralStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch withdrawal requests
  const {
    data: withdrawalsData,
    isLoading: isLoadingWithdrawals,
    refetch: refetchWithdrawals,
  } = useQuery({
    queryKey: ['withdrawals', currentPage, withdrawalStatus],
    queryFn: () =>
      fetchWithdrawalRequests({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: withdrawalStatus !== 'all' ? withdrawalStatus : undefined,
      }),
    keepPreviousData: true,
  });

  // Fetch promo products
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['promo-products', currentPage],
    queryFn: () =>
      fetchPromoProducts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }),
    keepPreviousData: true,
  });

  // Process withdrawal mutation
  const { mutate: processWithdrawal, isLoading: isProcessing } = useMutation({
    mutationFn: processWithdrawalApi,
    onSuccess: () => {
      toast.success('Withdrawal processed successfully');
      queryClient.invalidateQueries(['withdrawals']);
      queryClient.invalidateQueries(['referral-stats']);
    },
    onError: (error: Error) => {
      toast.error(`Failed to process withdrawal: ${error.message}`);
    },
  });

  // Update settings mutation
  const { mutate: updateSettings, isLoading: isUpdatingSettings } = useMutation({
    mutationFn: updateReferralSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries(['referral-stats']);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  // Handle withdrawal action
  const handleWithdrawalAction = (id: string, action: 'approve' | 'reject') => {
    processWithdrawal({ withdrawalId: id, action });
  };

  // Handle settings form submission
  const handleSettingsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateSettings({
      referralBonus: Number(formData.get('referralBonus')),
      minWithdrawal: Number(formData.get('minWithdrawal')),
      requirePurchase: formData.get('requirePurchase') === 'on',
      allowSelfReferral: formData.get('allowSelfReferral') === 'on',
    });
  };

  // Handle export
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    // In a real app, this would trigger a download
    const endpoint = `/api/admin/referral/export?format=${format}`;
    window.open(endpoint, '_blank');
  };

  // Tabs configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart2 },
    { id: 'withdrawals', name: 'Withdrawals', icon: CreditCard },
    { id: 'referrers', name: 'Top Referrers', icon: UserCheck },
    { id: 'products', name: 'Promo Products', icon: Gift },
    { id: 'settings', name: 'Settings', icon: Settings },
  ] as const;

  // Loading state
  const isLoading = isLoadingStats || isLoadingWithdrawals || isLoadingProducts || isProcessing || isUpdatingSettings;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
          <div className="flex space-x-3">
            <div className="relative">
              <ActionButton 
                variant="outline" 
                icon={Download}
                onClick={() => document.getElementById('export-menu')?.classList.toggle('hidden')}
                className="relative"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                Export
              </ActionButton>
              <div 
                id="export-menu" 
                className="hidden absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button 
                    onClick={() => {
                      handleExport('csv');
                      document.getElementById('export-menu')?.classList.add('hidden');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    role="menuitem"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </button>
                  <button 
                    onClick={() => {
                      handleExport('excel');
                      document.getElementById('export-menu')?.classList.add('hidden');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    role="menuitem"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Excel
                  </button>
                  <button 
                    onClick={() => {
                      handleExport('pdf');
                      document.getElementById('export-menu')?.classList.add('hidden');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    role="menuitem"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </button>
                </div>
              </div>
            </div>
            <ActionButton 
              variant="primary"
              icon={PlusCircle}
              onClick={() => alert('Add new referral')}
              disabled={isLoading}
            >
              Add Referral
            </ActionButton>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={isLoading}
                className={`${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
                {tab.id === 'withdrawals' && stats.pendingWithdrawals > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {stats.pendingWithdrawals}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters and Search */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 text-sm focus:ring-blue-500 focus:border-blue-500 w-64"
                placeholder="Select date range"
                value={dateRange?.from ? `${format(dateRange.from, 'MMM d, yyyy')} - ${dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : ''}` : ''}
                readOnly
                disabled={isLoading}
              />
            </div>
            
            {activeTab === 'withdrawals' && (
              <select
                value={withdrawalStatus}
                onChange={(e) => {
                  setWithdrawalStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={isLoading}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
            
            <button 
              onClick={() => {
                if (activeTab === 'withdrawals') refetchWithdrawals();
                else if (activeTab === 'products') refetchProducts();
              }}
              disabled={isLoading}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md disabled:opacity-50"
                placeholder={activeTab === 'withdrawals' ? 'Search withdrawals...' : activeTab === 'products' ? 'Search products...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  title="Total Referred Sales" 
                  value={stats.totalReferredSales} 
                  icon={DollarSign}
                  trend={12.5}
                  description="vs last month"
                  color="green"
                />
                <StatCard 
                  title="Active Referrers" 
                  value={stats.totalActiveReferrers} 
                  icon={Users}
                  trend={8.2}
                  description="vs last month"
                  color="blue"
                />
                <StatCard 
                  title="Commissions Paid" 
                  value={stats.totalCommissionsPaid} 
                  icon={TrendingUp}
                  trend={15.3}
                  description="vs last month"
                  color="purple"
                />
                <StatCard 
                  title="Pending Withdrawals" 
                  value={stats.pendingWithdrawals} 
                  icon={Clock}
                  trend={-5.1}
                  description="vs last month"
                  color="orange"
                />
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </button>
                </div>
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {[1, 2, 3].map((item) => (
                      <li key={item}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              New referral signup
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Completed
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <UserCheck className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                John Doe (john@example.com)
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              <p>
                                {format(new Date(), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <button className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Email Referrers</h3>
                        <p className="text-sm text-gray-500">Send updates to all referrers</p>
                      </div>
                    </div>
                  </button>
                  <button className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Create Promotion</h3>
                        <p className="text-sm text-gray-500">Set up a new referral offer</p>
                      </div>
                    </div>
                  </button>
                  <button className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Generate Report</h3>
                        <p className="text-sm text-gray-500">Download referral analytics</p>
                      </div>
                    </div>
                  </button>
                  <button className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Program Settings</h3>
                        <p className="text-sm text-gray-500">Configure referral rules</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div>
              {isLoadingWithdrawals ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading withdrawals...</span>
                </div>
              ) : withdrawalsData?.data.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No withdrawal requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {withdrawalStatus === 'all' 
                      ? 'There are no withdrawal requests to display.'
                      : `There are no ${withdrawalStatus} withdrawal requests.`}
                  </p>
                </div>
              ) : (
                <>
                  <WithdrawalsTable 
                    withdrawals={withdrawalsData?.data || []} 
                    onAction={handleWithdrawalAction} 
                    processingId={isProcessing ? isProcessing as string : undefined}
                  />
                  
                  {withdrawalsData && (
                    <div className="mt-4">
                      <TablePagination 
                        currentPage={withdrawalsData.page}
                        totalPages={withdrawalsData.totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={withdrawalsData.total}
                        itemsPerPage={ITEMS_PER_PAGE}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'referrers' && (
            <div>
              {isLoadingStats ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading top referrers...</span>
                </div>
              ) : stats.topReferrers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No referrers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no referrers to display at this time.
                  </p>
                </div>
              ) : (
                <>
                  <TopReferrersTable referrers={stats.topReferrers} />
                  
                  <div className="mt-4">
                    <TablePagination 
                      currentPage={1}
                      totalPages={1}
                      onPageChange={setCurrentPage}
                      totalItems={stats.topReferrers.length}
                      itemsPerPage={10}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Promotional Products</h2>
                <ActionButton 
                  variant="primary"
                  icon={PlusCircle}
                  onClick={() => alert('Add new product')}
                  disabled={isLoading}
                >
                  Add Product
                </ActionButton>
              </div>
              
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading products...</span>
                </div>
              ) : productsData?.data.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                    <Gift className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No promotional products</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first promotional product.
                  </p>
                  <div className="mt-6">
                    <ActionButton 
                      variant="primary"
                      icon={PlusCircle}
                      onClick={() => alert('Add new product')}
                    >
                      Add Product
                    </ActionButton>
                  </div>
                </div>
              ) : (
                <>
                  <PromoProductsTable products={productsData?.data || []} />
                  
                  {productsData && (
                    <div className="mt-4">
                      <TablePagination 
                        currentPage={productsData.page}
                        totalPages={productsData.totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={productsData.total}
                        itemsPerPage={ITEMS_PER_PAGE}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Referral Program Settings</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure how your referral program works
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <form onSubmit={handleSettingsSubmit}>
                  <div className="space-y-6">
                    {isLoadingStats ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading settings...</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="referralBonus" className="block text-sm font-medium text-gray-700">
                              Referral Bonus Amount (₹)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <input
                                type="number"
                                name="referralBonus"
                                id="referralBonus"
                                min="0"
                                step="1"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                placeholder="500"
                                defaultValue={500}
                                required
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="minWithdrawal" className="block text-sm font-medium text-gray-700">
                              Minimum Withdrawal Amount (₹)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <input
                                type="number"
                                name="minWithdrawal"
                                id="minWithdrawal"
                                min="100"
                                step="100"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                placeholder="500"
                                defaultValue={500}
                                required
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="requirePurchase"
                                  name="requirePurchase"
                                  type="checkbox"
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                  defaultChecked
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="requirePurchase" className="font-medium text-gray-700">
                                  Require purchase before referral is counted
                                </label>
                                <p className="text-gray-500">Only count referrals when the referred user makes a purchase</p>
                              </div>
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="allowSelfReferral"
                                  name="allowSelfReferral"
                                  type="checkbox"
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="allowSelfReferral" className="font-medium text-gray-700">
                                  Allow self-referrals
                                </label>
                                <p className="text-gray-500">Let users refer themselves with a different email</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-5">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isUpdatingSettings}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isUpdatingSettings}
                            >
                              {isUpdatingSettings ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
