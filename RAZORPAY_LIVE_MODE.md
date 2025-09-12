# Razorpay Live Mode Setup

## Current Issue
The website is showing "Test Mode" because you're using test keys in .env.local:
- NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RDS7GUfIddVKwK
- RAZORPAY_KEY_SECRET=Sk0lz17w2Hz328cgvSs9WsVR

## To Fix Test Mode:

1. **Get Live Keys from Razorpay Dashboard:**
   - Login to https://dashboard.razorpay.com
   - Go to Settings > API Keys
   - Generate Live Keys (they start with `rzp_live_`)

2. **Update Environment Variables:**
   Replace in .env.local:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   RAZORPAY_KEY_SECRET=your_live_key_secret
   ```

3. **Complete KYC:**
   - Razorpay requires business KYC verification for live mode
   - Submit required documents in dashboard
   - Wait for approval (usually 24-48 hours)

## Logo Added:
- Added ShopWave logo to payment gateway
- Logo URL: https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/shopwave-logo.png
- Make sure to upload your actual logo to this path in ImageKit

## Note:
Test mode will continue to show until you switch to live keys and complete KYC verification.