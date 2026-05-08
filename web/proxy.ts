import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. กำหนดว่าหน้าไหนบ้างที่ "ห้ามเข้า" ถ้าไม่ได้ Login
// เราล็อคหน้า /admin และหน้า /profile (ถ้ามีในอนาคต)
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)', 
  '/profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. ถ้า User พยายามเข้าหน้าในรายชื่อด้านบน ให้ยาม (Clerk) ตรวจบัตรทันที
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // อันนี้คือค่ามาตรฐานที่ Clerk ให้มา (ไม่ต้องแก้)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};