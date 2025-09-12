import { Types } from 'mongoose';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'pending_withdrawal';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  date: string;
  status: WithdrawalStatus;
}

export interface PromotionalProduct {
  id: string;
  name: string;
  commission: number;
  videoUrl: string;
  referredSales: number;
}

export interface AdminReferralStats {
  totalReferredSales: number;
  totalCommissionsPaid: number;
  totalActiveReferrers: number;
  pendingWithdrawals: number;
  totalCommissionsPending: number;
  totalWithdrawalsProcessed: number;
  topReferrers: Array<{
    userId: string;
    name: string;
    email: string;
    totalReferrals: number;
    totalEarned: number;
    totalPaid: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
