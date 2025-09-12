import { Schema, model, models } from 'mongoose';

const referralSchema = new Schema(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referredEmail: { type: String, required: true, lowercase: true },
    status: {
      type: String,
      enum: ['pending', 'signed_up', 'purchased', 'withdrawn', 'rejected', 'pending_withdrawal'],
      default: 'pending',
    },
    commission: { type: Number, default: 0 },
    orderAmount: { type: Number, default: 0 },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    orderId: { type: String },
    withdrawalDetails: {
      upiId: { type: String },
      processedAt: { type: Date },
      processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted amount
referralSchema.virtual('formattedAmount').get(function () {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(this.commission);
});

// Indexes for faster lookups
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referredEmail: 1 }, { unique: true });
referralSchema.index({ status: 1, createdAt: -1 });
referralSchema.index({ 'withdrawalDetails.processedAt': -1 });

// Pre-save hook to track updates
referralSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Referral = models.Referral || model('Referral', referralSchema);
