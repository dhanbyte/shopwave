import { Referral } from '@/models/referral';
import { connectToDB } from '@/lib/mongoose';

export interface ReferralStats {
  totalEarnings: number;
  pendingClearance: number;
  totalWithdrawn: number;
  activeProducts: number;
  totalSignups: number;
  totalConversions: number;
  referralLink: string;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  await connectToDB();

  const [stats] = await Referral.aggregate([
    { $match: { referrerId: userId } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$commission' },
        pendingEarnings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'purchased'] }, '$commission', 0]
          }
        },
        totalSignups: { $sum: 1 },
        totalConversions: {
          $sum: { $cond: [{ $eq: ['$status', 'purchased'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get withdrawal history
  const [withdrawals] = await Referral.aggregate([
    { $match: { referrerId: userId, status: 'withdrawn' } },
    { $group: { _id: null, total: { $sum: '$commission' } } }
  ]);

  // Count active products
  const activeProducts = await Referral.distinct('productId', {
    referrerId: userId,
    status: { $in: ['signed_up', 'purchased'] }
  }).countDocuments();

  return {
    totalEarnings: stats?.totalEarnings || 0,
    pendingClearance: stats?.pendingEarnings || 0,
    totalWithdrawn: withdrawals?.total || 0,
    activeProducts: activeProducts || 0,
    totalSignups: stats?.totalSignups || 0,
    totalConversions: stats?.totalConversions || 0,
    referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/ref/${userId}`
  };
}

export async function getReferralHistory(userId: string, limit = 10, page = 1) {
  await connectToDB();
  
  const skip = (page - 1) * limit;
  
  const referrals = await Referral.find({ referrerId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('productId', 'name price image')
    .lean();

  return referrals.map(ref => ({
    id: ref._id.toString(),
    email: ref.referredEmail,
    status: ref.status,
    commission: ref.commission,
    product: ref.productId,
    date: ref.createdAt,
    orderId: ref.orderId
  }));
}

export async function createReferral(referrerId: string, email: string, productId?: string) {
  await connectToDB();
  
  const existingReferral = await Referral.findOne({
    referredEmail: email.toLowerCase(),
    referrerId
  });

  if (existingReferral) {
    throw new Error('This email has already been referred');
  }

  const referral = new Referral({
    referrerId,
    referredEmail: email.toLowerCase(),
    status: 'pending',
    productId,
    commission: 0 // Will be set when a purchase is made
  });

  await referral.save();
  return referral;
}

export async function processReferralPurchase(email: string, orderId: string, amount: number) {
  await connectToDB();
  
  // Find the referral by email
  const referral = await Referral.findOne({
    referredEmail: email.toLowerCase(),
    status: { $in: ['pending', 'signed_up'] }
  });

  if (!referral) return null;

  // Calculate commission (10% of order amount as an example)
  const commission = Math.round(amount * 0.1);
  
  // Update referral status and commission
  referral.status = 'purchased';
  referral.commission = commission;
  referral.orderId = orderId;
  referral.updatedAt = new Date();
  
  await referral.save();
  return referral;
}

export async function requestWithdrawal(userId: string, upiId: string, amount: number) {
  await connectToDB();
  
  // Get user's available balance
  const stats = await getReferralStats(userId);
  const availableBalance = stats.totalEarnings - stats.totalWithdrawn;
  
  if (amount > availableBalance) {
    throw new Error('Insufficient balance for withdrawal');
  }
  
  // Create a withdrawal record (you might want to create a separate collection for withdrawals)
  const withdrawal = new Referral({
    referrerId: userId,
    referredEmail: 'withdrawal',
    status: 'withdrawn',
    commission: -amount, // Negative to indicate withdrawal
    orderId: `WITHDRAW-${Date.now()}`,
    metadata: { upiId }
  });
  
  await withdrawal.save();
  
  // Here you would typically integrate with a payment gateway to process the UPI payment
  // For now, we'll just return the withdrawal record
  
  return {
    id: withdrawal._id.toString(),
    amount,
    upiId,
    status: 'pending',
    date: new Date()
  };
}
