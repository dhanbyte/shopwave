export type ReferralStats = {
  totalReferredSales: number;
  totalActiveReferrers: number;
  totalCommissionsPaid: number;
  pendingWithdrawals: number;
  topReferrers: Array<{
    userId: string;
    name: string;
    totalReferrals: number;
    totalEarned: number;
    totalPaid: number;
  }>;
};

export type WithdrawalRequest = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  date: string;
  processedAt?: string;
  processedBy?: string;
};

export type PromoProduct = {
  id: string;
  name: string;
  price: number;
  commission: number;
  commissionType: 'percentage' | 'fixed';
  isActive: boolean;
  stats?: {
    totalSales: number;
    totalRevenue: number;
  };
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};
