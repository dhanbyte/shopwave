
export type Money = { original: number; discounted?: number; currency?: string }
export type Rating = { average: number; count: number }
export type Variant = { color?: string; size?: string; price?: number; quantity?: number; sku?: string }

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  subcategory?: string
  tertiaryCategory?: string
  image: string
  extraImages?: string[]
  video?: string
  quantity: number
  price: Money
  specifications?: Record<string, string>
  shortDescription?: string
  description: string
  features?: string[]
  tags?: string[]
  sku?: string
  variants?: Variant[]
  shippingCost?: number;
  taxPercent?: number;
  inventory?: { inStock: boolean; lowStockThreshold?: number }
  ratings?: Rating
  status?: 'active'|'inactive'|'out_of_stock'|'discontinued'
  returnPolicy?: { eligible?: boolean; duration?: number }
  codAvailable?: boolean
  warranty?: string
}

export type Address = {
  id?: string;
  fullName: string
  phone: string
  pincode: string
  line1: string
  line2?: string
  city: string
  state: string
  landmark?: string
  default?: boolean
}

export type PaymentMethod = 'COD' | 'UPI' | 'Card' | 'NetBanking';

export type Order = {
  id: string
  userId: string
  createdAt: number
  updatedAt: number
  items: { productId: string; qty: number; price: number, name: string, image: string }[]
  total: number
  originalTotal?: number
  discountAmount?: number
  referralCode?: string | null
  address: Address
  payment: PaymentMethod
  status: 'Pending'|'Processing'|'Shipped'|'Delivered'
}

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
}

export type NotificationItem = {
    productId: string;
    notifiedAt: number;
}
