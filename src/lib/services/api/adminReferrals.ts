import { API_BASE_URL } from '@/lib/config';

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    upiId?: string;
  };
}

interface ReferralStats {
  totalReferredSales: number;
  totalActiveReferrers: number;
  totalCommissionsPaid: number;
  pendingWithdrawals: number;
  topReferrers: Array<{
    id: string;
    name: string;
    email: string;
    totalReferrals: number;
    totalEarned: number;
    totalPaid: number;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data: ApiResponse<T> = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data.data as T;
};

export const fetchReferralStats = async (): Promise<ReferralStats> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/referral/stats`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return handleResponse<ReferralStats>(response);
};

export const fetchWithdrawalRequests = async ({
  page = 1,
  limit = 10,
  status,
}: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/admin/referral/withdrawals?${params.toString()}`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return handleResponse<{
    data: WithdrawalRequest[];
    total: number;
    page: number;
    totalPages: number;
  }>(response);
};

export const processWithdrawal = async ({
  withdrawalId,
  action,
}: {
  withdrawalId: string;
  action: 'approve' | 'reject';
}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/referral/withdrawals/${withdrawalId}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    }
  );

  return handleResponse<{ success: boolean }>(response);
};

export const fetchPromoProducts = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/admin/referral/products?${params.toString()}`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return handleResponse<{
    data: Array<{
      id: string;
      name: string;
      price: number;
      commission: number;
      sales: number;
      revenue: number;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }>(response);
};

export const updateReferralSettings = async (settings: {
  referralBonus: number;
  minWithdrawal: number;
  requirePurchase: boolean;
  allowSelfReferral: boolean;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/referral/settings`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  return handleResponse<{ success: boolean }>(response);
};
