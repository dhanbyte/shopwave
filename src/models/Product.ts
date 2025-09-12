import { Schema, model, models } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  costPerItem: { type: Number, min: 0 },
  sku: { type: String },
  barcode: { type: String },
  trackQuantity: { type: Boolean, default: true },
  quantity: { type: Number, default: 0, min: 0 },
  weight: { type: Number, default: 0 },
  weightUnit: { type: String, enum: ['g', 'kg', 'lb', 'oz'], default: 'g' },
  countryOfOrigin: { type: String },
  hsCode: { type: String },
  seo: {
    title: String,
    description: String,
  },
  isActive: { type: Boolean, default: true },
  isGiftCard: { type: Boolean, default: false },
  requiresShipping: { type: Boolean, default: true },
  isTaxable: { type: Boolean, default: true },
  images: [{ type: String }],
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  collections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
  tags: [{ type: String }],
  variants: [{
    name: String,
    values: [String]
  }],
  options: [{
    name: String,
    values: [String]
  }],
  vendor: { type: String },
  type: { type: String, enum: ['physical', 'digital', 'service'], default: 'physical' },
  hasVariants: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  saleStartsAt: { type: Date },
  saleEndsAt: { type: Date },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  ratingCount: { type: Number, default: 0 },
  meta: {
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
  },
  // Referral specific fields
  referralEligible: { type: Boolean, default: false },
  referralCommission: { type: Number, min: 0 },
  referralCommissionType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  videoUrl: { type: String },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  // SEO
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String },
  // Inventory
  inventoryPolicy: { 
    type: String, 
    enum: ['deny', 'continue'], 
    default: 'deny' 
  },
  allowPreorder: { type: Boolean, default: false },
  preorderMessage: { type: String },
  // Shipping
  shippingProfile: { type: String },
  // Tax
  taxCode: { type: String },
  taxExempt: { type: Boolean, default: false },
  // Organization
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ isOnSale: 1 });
productSchema.index({ 'meta.viewCount': -1 });
productSchema.index({ 'meta.purchaseCount': -1 });
productSchema.index({ referralEligible: 1 });

export default models.Product || model('Product', productSchema);
