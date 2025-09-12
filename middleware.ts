import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/search",
    "/product/(.*)",
    "/contact",
    "/faq",
    "/return-policy",
    "/shipping-policy",
    "/api/products(.*)",
    "/api/imagekit(.*)",
    "/api/razorpay"
  ],
  ignoredRoutes: [
    "/api/webhook(.*)"
  ]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};