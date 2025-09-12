import { connectToDB } from '@/lib/mongoose';
import Referral from '@/models/referral';
import User from '@/models/User';
import Product from '@/models/Product';
import { Types } from 'mongoose';

// Types
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

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

export async function getAdminReferralStats(): Promise<AdminReferralStats> {
  await connectToDB();

  // Get total referred sales and commissions
  const [salesResult] = await Referral.aggregate([
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
  const [withdrawalsResult] = await Referral.aggregate([
    { $match: { status: 'withdrawn' } },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: { $abs: '$commission' } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Get active referrers count
  const activeReferrers = await Referral.distinct('referrerId', {
    status: { $in: ['signed_up', 'purchased'] },
  });

  // Get pending withdrawals count
  const pendingWithdrawals = await Referral.countDocuments({
    status: 'withdrawal_requested',
  });

  // Get top referrers
  const topReferrers = await Referral.aggregate([
    {
      $match: {
        status: { $in: ['purchased', 'withdrawn'] },
      },
    },
    {
      $group: {
        _id: '$referrerId',
        totalEarned: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'purchased'] },
              '$commission',
              0,
            ],
          },
        },
        totalPaid: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'withdrawn'] },
              { $abs: '$commission' },
              0,
            ],
          },
        },
        totalReferrals: { $sum: 1 },
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
    totalCommissionsPending: (salesResult?.totalCommissions || 0) - (withdrawalsResult?.totalPaid || 0),
    totalActiveReferrers: activeReferrers.length,
    totalWithdrawalsProcessed: withdrawalsResult?.count || 0,
    totalWithdrawalsPending: pendingWithdrawals,
    topReferrers: topReferrers.map(r => ({
      ...r,
      userId: r.userId.toString(),
    })),
  };
}

export async function getWithdrawalRequests(page = 1, limit = 10) {
  await connectToDB();
  
  const skip = (page - 1) * limit;
  
  const withdrawals = await Referral.aggregate([
    { $match: { status: 'withdrawal_requested' } },
    { $sort: { updatedAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'referrerId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        amount: { $abs: '$commission' },
        upiId: '$metadata.upiId',
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        userEmail: '$user.email',
      },
    },
  ]);

  const total = await Referral.countDocuments({ status: 'withdrawal_requested' });

  return {
    data: withdrawals.map(w => ({
      id: w._id.toString(),
      amount: w.amount,
      upiId: w.upiId,
      status: w.status,
      date: w.createdAt,
      userName: w.userName,
      userEmail: w.userEmail,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function processWithdrawal(
  withdrawalId: string, 
  action: 'approve' | 'reject',
  adminId: string
) {
  await connectToDB();
  
  const session = await Referral.startSession();
  session.startTransaction();
  
  try {
    const withdrawal = await Referral.findById(withdrawalId).session(session);
    
    if (!withdrawal) {
      throw new Error('Withdrawal request not found');
    }
    
    if (withdrawal.status !== 'withdrawal_requested') {
      throw new Error('This withdrawal request has already been processed');
    }
    
    if (action === 'approve') {
      withdrawal.status = 'withdrawn';
      withdrawal.metadata = {
        ...withdrawal.metadata,
        processedAt: new Date(),
        processedBy: new Types.ObjectId(adminId),
      };
      await withdrawal.save({ session });
      
      // Here you would typically integrate with a payment gateway to process the UPI payment
      // For now, we'll just update the status
      
      await session.commitTransaction();
      return { success: true, message: 'Withdrawal approved successfully' };
    } else {
      // Reject the withdrawal
      withdrawal.status = 'purchased'; // Revert to purchased status
      await withdrawal.save({ session });
      
      await session.commitTransaction();
      return { success: true, message: 'Withdrawal rejected' };
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getPromotionalProducts(page = 1, limit = 10) {
  await connectToDB();
  
  const skip = (page - 1) * limit;
  
  const products = await Product.find({
    isActive: true,
    referralEligible: true,
  })
  .select('name price images referralCommission referralCommissionType videoUrl slug')
  .skip(skip)
  .limit(limit)
  .lean();
  
  const total = await Product.countDocuments({
    isActive: true,
    referralEligible: true,
  });
  
  // Get referred sales count for each product
  const productSales = await Referral.aggregate([
    { 
      $match: { 
        status: 'purchased',
        productId: { $exists: true, $ne: null }
      } 
    },
    {
      $group: {
        _id: '$productId',
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$orderAmount' },
        totalCommissions: { $sum: '$commission' },
      },
    },
  ]);
  
  const salesMap = new Map(
    productSales.map(sale => [sale._id.toString(), sale])
  );
  
  const formattedProducts = products.map(product => {
    const salesData = salesMap.get(product._id.toString()) || {
      totalSales: 0,
      totalRevenue: 0,
      totalCommissions: 0,
    };
    
    return {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/images/placeholder-product.jpg',
      commission: product.referralCommission || 0,
      commissionType: product.referralCommissionType || 'percentage',
      videoUrl: product.videoUrl || '',
      slug: product.slug,
      stats: {
        totalSales: salesData.totalSales,
        totalRevenue: salesData.totalRevenue,
        totalCommissions: salesData.totalCommissions,
      },
    };
  });
  
  return {
    data: formattedProducts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

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
  
  const product = await Product.findByIdAndUpdate(
    productId,
    { 
      $set: {
        ...(updates.referralCommission !== undefined && { 
          referralCommission: updates.referralCommission 
        }),
        ...(updates.referralCommissionType !== undefined && { 
          referralCommissionType: updates.referralCommissionType 
        }),
        ...(updates.videoUrl !== undefined && { 
          videoUrl: updates.videoUrl 
        }),
        ...(updates.referralEligible !== undefined && { 
          referralEligible: updates.referralEligible 
        }),
      },
    },
    { new: true, runValidators: true }
  );
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return {
    id: product._id.toString(),
    name: product.name,
    referralCommission: product.referralCommission,
    referralCommissionType: product.referralCommissionType,
    videoUrl: product.videoUrl,
    referralEligible: product.referralEligible,
  };
}
