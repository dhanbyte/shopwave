import { connectToDB } from '../mongoose';
import { Referral } from '../../models/referral';
import { User } from '../../models/User';
import Product from '../../models/Product';
import { Types, Model, Document } from 'mongoose';

// Define model types
type ReferralDocument = Document & {
  referrerId: Types.ObjectId;
  referredEmail: string;
  status: string;
  commission: number;
  orderAmount: number;
  // Add other fields as needed
};

type UserDocument = Document & {
  _id: Types.ObjectId;
  name: string;
  email: string;
  // Add other fields as needed
};

type ProductDocument = Document & {
  _id: Types.ObjectId;
  name: string;
  price: number;
  referralCommission?: number;
  referralCommissionType?: 'percentage' | 'fixed';
  videoUrl?: string;
  referralEligible?: boolean;
  // Add other fields as needed
};

// Cast models to the correct types
const ReferralModel = Referral as unknown as Model<ReferralDocument>;
const UserModel = User as unknown as Model<UserDocument>;
const ProductModel = Product as unknown as Model<ProductDocument>;

// Define types inline since we're having module resolution issues
type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'pending_withdrawal';

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  date: string;
  status: WithdrawalStatus;
}

interface PromotionalProduct {
  id: string;
  name: string;
  commission: number;
  videoUrl: string;
  referredSales: number;
}

interface AdminReferralStats {
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

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminReferralStats(): Promise<AdminReferralStats> {
  await connectToDB();

  // Get total referred sales and commissions
  const [salesResult] = await Referral.aggregate<{
    _id: null;
    totalReferredSales: number;
    totalCommissions: number;
  }>([
    { $match: { status: 'purchased' } },
    {
      $group: {
        _id: null,
        totalReferredSales: { $sum: '$orderAmount' },
        totalCommissions: { $sum: '$commission' },
      },
    },
  ]);

  // Get total paid commissions (withdrawals)
  const [withdrawalsResult] = await Referral.aggregate<{
    _id: null;
    totalPaid: number;
    count: number;
  }>([
    { $match: { status: 'withdrawn' } },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: { $abs: '$commission' } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Get pending withdrawals
  const [pendingWithdrawals] = await Referral.aggregate<{
    _id: null;
    total: number;
    count: number;
  }>([
    { $match: { status: 'pending_withdrawal' } },
    {
      $group: {
        _id: null,
        total: { $sum: { $abs: '$commission' } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Get active referrers count
  const activeReferrers = await ReferralModel.distinct('referrerId', {
    status: { $in: ['signed_up', 'purchased'] },
  });

  // Get top referrers
  const topReferrers = await ReferralModel.aggregate([
    {
      $match: {
        status: { $in: ['signed_up', 'purchased'] },
      },
    },
    {
      $group: {
        _id: '$referrerId',
        totalReferrals: { $sum: 1 },
        totalEarned: { $sum: '$commission' },
        totalPaid: {
          $sum: {
            $cond: [{ $eq: ['$status', 'withdrawn'] }, { $abs: '$commission' }, 0],
          },
        },
      },
    },
    { $sort: { totalEarned: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        email: '$user.email',
        totalReferrals: 1,
        totalEarned: 1,
        totalPaid: 1,
      },
    },
  ]);

  return {
    totalReferredSales: salesResult?.totalReferredSales || 0,
    totalCommissionsPaid: withdrawalsResult?.totalPaid || 0,
    totalCommissionsPending: salesResult?.totalCommissions || 0,
    totalActiveReferrers: activeReferrers.length,
    pendingWithdrawals: pendingWithdrawals?.count || 0,
    totalWithdrawalsProcessed: withdrawalsResult?.count || 0,
    topReferrers: topReferrers.map((r) => ({
      userId: r.userId.toString(),
      name: r.name,
      email: r.email,
      totalReferrals: r.totalReferrals,
      totalEarned: r.totalEarned,
      totalPaid: r.totalPaid,
    })),
  };
}

/**
 * Get withdrawal requests with pagination
 */
export async function getWithdrawalRequests(
  page = 1,
  limit = 10,
  status?: WithdrawalStatus
): Promise<PaginatedResponse<WithdrawalRequest>> {
  await connectToDB();

  const skip = (page - 1) * limit;
  const query: any = {};
  
  if (status) {
    query.status = status;
  }

  const [withdrawals, total] = await Promise.all([
    ReferralModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('referrerId', 'name email')
      .lean(),
    ReferralModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  const formattedWithdrawals: WithdrawalRequest[] = withdrawals.map((withdrawal: any) => ({
    id: withdrawal._id.toString(),
    userId: withdrawal.referrerId?._id?.toString() || '',
    userName: withdrawal.referrerId?.name || 'Unknown User',
    amount: Math.abs(withdrawal.commission || 0),
    upiId: withdrawal.withdrawalDetails?.upiId || '',
    date: withdrawal.updatedAt?.toISOString() || new Date().toISOString(),
    status: (withdrawal.status as WithdrawalStatus) || 'pending',
  }));

  return {
    data: formattedWithdrawals,
    total,
    page,
    totalPages,
    limit,
  };
}

/**
 * Process withdrawal request (approve/reject)
 */
export async function processWithdrawal(
  withdrawalId: string,
  action: 'approve' | 'reject',
  adminId: string
) {
  await connectToDB();

  // Find the withdrawal request
  const withdrawal = await ReferralModel.findById(withdrawalId).populate('referrerId');
  if (!withdrawal) {
    throw new Error('Withdrawal request not found');
  }

  if (action === 'approve') {
    // Update withdrawal status
    await ReferralModel.findByIdAndUpdate(
      withdrawalId,
      {
        status: 'withdrawn',
        $set: {
          'withdrawalDetails.processedAt': new Date(),
          'withdrawalDetails.processedBy': adminId,
        },
      },
      { new: true }
    );

    // Update user's balance (deduct the withdrawn amount)
    await UserModel.findByIdAndUpdate(
      withdrawal.referrerId._id,
      { $inc: { referralBalance: -Math.abs(withdrawal.commission || 0) } },
      { new: true }
    );
  } else if (action === 'reject') {
    // Update withdrawal status to pending (can be requested again)
    await ReferralModel.findByIdAndUpdate(
      withdrawalId,
      {
        status: 'pending_withdrawal',
        $set: {
          'withdrawalDetails.rejectedAt': new Date(),
          'withdrawalDetails.rejectedBy': adminId,
        },
      },
      { new: true }
    );
  }

  return {
    success: true,
    message: `Withdrawal request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
  };
}

/**
 * Get promotional products with pagination
 */
export async function getPromotionalProducts(page = 1, limit = 10) {
  await connectToDB();

  const skip = (page - 1) * limit;
  const query = { referralEligible: true };

  const [products, total] = await Promise.all([
    ProductModel.find(query)
      .select('name price referralCommission referralCommissionType videoUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ProductModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Get referral counts for each product
  const productIds = products.map((p: any) => p._id);
  const referralCounts = await ReferralModel.aggregate([
    { $match: { productId: { $in: productIds } } },
    { $group: { _id: '$productId', count: { $sum: 1 } } },
  ]);

  const referralCountMap = referralCounts.reduce((acc: Record<string, number>, curr: any) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  const formattedProducts: PromotionalProduct[] = products.map((product: any) => ({
    id: product._id.toString(),
    name: product.name,
    commission: product.referralCommission || 0,
    commissionType: product.referralCommissionType || 'percentage',
    videoUrl: product.videoUrl || '',
    referredSales: referralCountMap[product._id.toString()] || 0,
  }));

  return {
    data: formattedProducts,
    total,
    page,
    totalPages,
    limit,
  };
}

/**
 * Update product commission and referral settings
 */
export async function updateProductCommission(
  productId: string,
  updates: {
    referralCommission?: number;
    referralCommissionType?: 'percentage' | 'fixed';
    videoUrl?: string;
    referralEligible?: boolean;
  }
) {
  await connectToDB();

  const updateData: any = {};
  
  if (updates.referralCommission !== undefined) {
    updateData.referralCommission = updates.referralCommission;
  }
  
  if (updates.referralCommissionType) {
    updateData.referralCommissionType = updates.referralCommissionType;
  }
  
  if (updates.videoUrl !== undefined) {
    updateData.videoUrl = updates.videoUrl;
  }
  
  if (updates.referralEligible !== undefined) {
    updateData.referralEligible = updates.referralEligible;
  }

  const updatedProduct = await ProductModel.findByIdAndUpdate(
    productId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedProduct) {
    throw new Error('Product not found');
  }

  return {
    success: true,
    message: 'Product updated successfully',
    product: {
      id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      commission: updatedProduct.referralCommission,
      commissionType: updatedProduct.referralCommissionType,
      videoUrl: updatedProduct.videoUrl,
      referralEligible: updatedProduct.referralEligible,
    },
  };
}
