'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  Check, 
  X, 
  Loader2,
  Search
} from 'lucide-react';

// Mock data for demonstration
const mockStats = {
  totalReferredSales: 125000,
  totalActiveReferrers: 42,
  totalCommissionsPaid: 12500,
  pendingWithdrawals: 8,
  topReferrers: [
    { name: 'John Doe', totalReferrals: 15, totalEarned: 1500, totalPaid: 1200 },
    { name: 'Jane Smith', totalReferrals: 12, totalEarned: 1250, totalPaid: 1000 },
    { name: 'Bob Johnson', totalReferrals: 8, totalEarned: 800, totalPaid: 600 },
  ]
};

const mockWithdrawals = [
  { id: '1', userName: 'John Doe', amount: 500, upiId: 'john@upi', status: 'pending', date: '2023-09-10' },
  { id: '2', userName: 'Jane Smith', amount: 300, upiId: 'jane@ybl', status: 'pending', date: '2023-09-09' },
  { id: '3', userName: 'Bob Johnson', amount: 200, upiId: 'bob@okicici', status: 'approved', date: '2023-09-08' },
];

export default function AdminReferralPage() {
  const [stats, setStats] = useState(mockStats);
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleWithdrawalAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWithdrawals(withdrawals.map(w => 
        w.id === id 
          ? { ...w, status: action === 'approve' ? 'approved' : 'rejected' } 
          : w
      ));
      
      alert(`Withdrawal ${action}d successfully!`);
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Referral Program Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Referred Sales" 
          value={stats.totalReferredSales} 
          icon={DollarSign}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Active Referrers" 
          value={stats.totalActiveReferrers} 
          icon={Users}
          color="bg-green-100 text-green-600"
        />
        <StatCard 
          title="Commissions Paid" 
          value={stats.totalCommissionsPaid} 
          icon={TrendingUp}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard 
          title="Pending Withdrawals" 
          value={stats.pendingWithdrawals} 
          icon={Clock}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Withdrawal Requests */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Withdrawal Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPI ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{withdrawal.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{withdrawal.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{withdrawal.upiId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{withdrawal.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      withdrawal.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : withdrawal.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {withdrawal.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                          disabled={processing === withdrawal.id}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 disabled:opacity-50 flex items-center"
                        >
                          {processing === withdrawal.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                          disabled={processing === withdrawal.id}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 disabled:opacity-50 flex items-center"
                        >
                          {processing === withdrawal.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Referrers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topReferrers.map((referrer, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{referrer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{referrer.totalReferrals}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{referrer.totalEarned}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{referrer.totalPaid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color.split(' ')[0]} bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${color.split(' ')[1]}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">
            {title.includes('₹') ? `₹${value.toLocaleString()}` : value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
