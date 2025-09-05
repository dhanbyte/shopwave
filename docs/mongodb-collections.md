# MongoDB Collections Setup

This document outlines the MongoDB collections structure to replace Supabase tables.

## Collections

### 1. users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  full_name: String,
  created_at: Date,
  updated_at: Date
}
```

### 2. user_profiles
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to users._id),
  phone: String,
  address: Object,
  preferences: Object,
  created_at: Date,
  updated_at: Date
}
```

### 3. products
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  images: Array,
  stock: Number,
  created_at: Date,
  updated_at: Date
}
```

### 4. orders
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: Array,
  total: Number,
  status: String,
  shipping_address: Object,
  created_at: Date,
  updated_at: Date
}
```

### 5. cart
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: Array,
  created_at: Date,
  updated_at: Date
}
```

### 6. user_data
```javascript
{
  _id: ObjectId,
  userId: String (Clerk user ID),
  type: String ("wishlist", "cart", "addresses", "orders"),
  data: Mixed (Array or Object),
  updated_at: Date
}
```

## Indexes

Create these indexes for better performance:

```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })

// User profiles collection
db.user_profiles.createIndex({ "userId": 1 }, { unique: true })

// Products collection
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "name": "text", "description": "text" })

// Orders collection
db.orders.createIndex({ "userId": 1 })
db.orders.createIndex({ "created_at": -1 })

// Cart collection
db.cart.createIndex({ "userId": 1 }, { unique: true })

// User data collection
db.user_data.createIndex({ "userId": 1, "type": 1 }, { unique: true })
db.user_data.createIndex({ "updated_at": -1 })
```