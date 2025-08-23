// /**
//  * @deprecated This function only checks personal billing status and doesn't handle organization subscription inheritance.
//  * Use useAccessControl().hasValidSubscription instead, which uses backend-computed subscription info that properly handles:
//  * - Organization members inheriting from organization owner's subscription
//  * - Individual users using their personal subscription
//  * - Proper multi-tenant subscription logic
//  */
// export function hasValidSubscription(paymentStatus?: string): boolean {
//   // if (import.meta.env.VITE_APP_ENV === "production") return true;
//   return paymentStatus === "trialing" || paymentStatus === "active";
// }
