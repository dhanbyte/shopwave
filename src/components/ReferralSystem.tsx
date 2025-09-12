'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/ClerkAuthContext'
import { useToast } from '@/hooks/use-toast'
import { Copy, Download, IndianRupee, Share2, TrendingUp, DollarSign, HelpCircle, Video, Users, ShoppingCart } from 'lucide-react'
import Image from 'next/image'

// NOTE: The mock data has been removed. The component now fetches data from APIs.

export default function ReferralSystem() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, productsRes, historyRes] = await Promise.all([
        fetch('/api/referral/stats'),
        fetch('/api/referral/products'),
        fetch('/api/referral/history')
      ]);

      if (!statsRes.ok || !productsRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch referral data');
      }

      const statsData = await statsRes.json();
      const productsData = await productsRes.json();
      const historyData = await historyRes.json();

      setStats(statsData);
      setProducts(productsData);
      setHistory(historyData);

    } catch (error) {
      console.error("Failed to fetch referral data:", error)
      toast({ title: "Error", description: "Could not fetch referral data. Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard' })
  }

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-2.5 rounded-lg ${colorClass.bg} flex-shrink-0`}>
        <Icon className={`h-5 w-5 ${colorClass.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )

  const ProductCard = ({ product }: { product: any }) => (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:border-transparent">
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Image 
          src={product.image} 
          layout="fill" 
          objectFit="cover" 
          alt={product.name} 
          className="group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 z-20">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Earn ₹{product.commission?.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white"
              onClick={() => copyToClipboard(product.referralLink)}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Copy Link</span>
            </Button>
            <Button 
              size="sm" 
              className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white"
              disabled={!product.videoUrl} 
              onClick={() => product.videoUrl && window.open(product.videoUrl, '_blank')}
            >
              <Video className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Watch Video</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 line-clamp-2 h-12">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Commission</span>
          <span className="text-sm font-medium text-gray-900">
            ₹{product.commission?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  )

  const WithdrawModal = () => {
    const [upiId, setUpiId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleWithdrawal = async () => {
      if (!upiId.trim()) {
        toast({ title: "UPI ID Required", description: "Please enter a valid UPI ID.", variant: "destructive" });
        return;
      }

      setIsSubmitting(true)
      try {
        const response = await fetch('/api/referral/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            upiId: upiId,
            amount: stats ? stats.totalEarnings - stats.totalWithdrawn : 0
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit withdrawal request');
        }

        toast({ title: "Request Submitted!", description: "Your withdrawal request has been received and will be processed soon." });
        setShowWithdrawModal(false);

      } catch (error) {
        console.error("Withdrawal request failed:", error)
        toast({ title: "Error", description: "Could not submit your request. Please try again later.", variant: "destructive" });
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
          <button onClick={() => setShowWithdrawModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
          <h2 className="text-2xl font-bold text-center mb-4">Withdraw Earnings</h2>
          <div className="text-center mb-6">
            <p className="text-gray-500">Available Balance</p>
            <p className="text-4xl font-bold text-brand">₹{stats ? stats.totalEarnings - stats.totalWithdrawn : 0}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Enter UPI ID</label>
              <input type="text" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
            </div>
            <Button onClick={handleWithdrawal} disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? 'Submitting Request...' : 'Request Withdrawal'}
            </Button>
            <div className="text-center text-sm text-gray-500">OR</div>
            <Button variant="outline" className="w-full" size="lg">
              Use as Shopping Coins (₹{stats ? stats.totalEarnings - stats.totalWithdrawn : 0})
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">Withdrawals are processed within 24-48 hours.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div className="p-8 text-center">Please login to see your referral dashboard.</div>
  }
  
  if (loading) {
      return <div className="p-8 text-center">Loading Referral Dashboard...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Dashboard</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Promote our products and earn generous commissions for every successful referral.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard 
          title="Total Signups" 
          value={stats?.totalSignups || 0} 
          icon={Users} 
          colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }} 
        />
        <StatCard 
          title="Total Purchases" 
          value={stats?.totalConversions || 0} 
          icon={ShoppingCart} 
          colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600' }} 
        />
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-100">Total Earnings</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ₹{stats?.totalEarnings?.toLocaleString('en-IN') || 0}
                </p>
                <p className="text-xs text-indigo-100 mt-1">
                  Pending: ₹{stats?.pendingClearance?.toLocaleString('en-IN') || 0}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <Button 
              onClick={() => setShowWithdrawModal(true)}
              className="mt-4 w-full bg-white text-indigo-700 hover:bg-indigo-50 font-medium"
              size="sm"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Withdraw Earnings
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Promotional Products</h2>
            <p className="text-sm text-gray-500 mt-1">Share these products and earn commissions on every sale</p>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share All
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Earnings</h2>
          <p className="text-sm text-gray-500 mt-1">Your latest referral activities and earnings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.slice(0, 5).map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-9 w-9 rounded-full ${
                        item.type === 'purchase' ? 'bg-green-50' : 'bg-blue-50'
                      } flex items-center justify-center`}>
                        {item.type === 'purchase' ? (
                          <ShoppingCart className={`h-4 w-4 ${item.amount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                        ) : (
                          <Users className={`h-4 w-4 ${item.amount > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.user?.name || 'System'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.amount > 0 
                        ? 'bg-green-100 text-green-800' 
                        : item.amount < 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">{history.length}</span> transactions
          </p>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3"
              disabled
            >
              <span className="sr-only">Previous</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3"
            >
              <span className="sr-only">Next</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && <WithdrawModal />}
    </div>
  )
}
