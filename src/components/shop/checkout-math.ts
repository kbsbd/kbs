/** Shared cart/checkout arithmetic. Kept apart so both the client views and the
 *  server route compute totals the same way. */

export function shippingFor(subtotal: number, flat: number, freeOver: number): number {
  if (flat <= 0) return 0;
  if (freeOver > 0 && subtotal >= freeOver) return 0;
  return flat;
}

export type CheckoutMode = "quote" | "cod" | "bkash" | "nagad" | "sslcommerz";
