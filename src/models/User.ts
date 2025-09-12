import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photo: { type: String },
  referralCode: { type: String, unique: true },
  referralBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to generate referral code
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export const User = models.User || model('User', userSchema);
