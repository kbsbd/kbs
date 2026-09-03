/**
 * Manager permissions.
 *
 * A full admin (`role = 'admin'`) has all of these implicitly. A manager has
 * exactly the keys stored in `admins.permissions`. The same keys gate the
 * dashboard UI, the server actions, and the RLS policies (`has_perm('key')`).
 */

export const PERMISSIONS = [
  { key: "bookings", group: "Site", label: "Site-visit requests — view and update" },
  { key: "shop.products", group: "Shop", label: "Add & edit products and categories" },
  { key: "shop.products.delete", group: "Shop", label: "Delete products and categories" },
  { key: "shop.orders", group: "Shop", label: "View orders and change their status" },
  { key: "shop.orders.manage", group: "Shop", label: "Create, edit and delete orders" },
  { key: "shop.reviews", group: "Shop", label: "Moderate reviews (publish / reject)" },
  { key: "shop.reviews.delete", group: "Shop", label: "Delete reviews" },
  { key: "shop.quotes", group: "Shop", label: "Handle quote requests" },
  { key: "shop.storefront", group: "Shop", label: "Shop page — hero, carousel, search, visibility" },
  { key: "shop.payments", group: "Shop", label: "Payment gateway settings & keys" },
  { key: "shop.delivery", group: "Shop", label: "Delivery partner settings & keys" },
  { key: "pages", group: "Site", label: "Pages & menu (CMS)" },
  { key: "content", group: "Site", label: "Site details, all text and images" },
  { key: "projects", group: "Site", label: "Projects" },
  { key: "integrations", group: "Site", label: "Analytics & search-console" },
  { key: "internal", group: "Site", label: "Internal notes" },
  { key: "team", group: "Site", label: "Manage other managers" },
] as const;

export type PermKey = (typeof PERMISSIONS)[number]["key"];

export const ALL_PERM_KEYS: PermKey[] = PERMISSIONS.map((p) => p.key);

/** Any shop capability — used to decide whether the Shop tab shows at all. */
export const SHOP_PERM_KEYS: PermKey[] = PERMISSIONS.filter((p) => p.group === "Shop").map(
  (p) => p.key
);

export function isPermKey(k: string): k is PermKey {
  return (ALL_PERM_KEYS as string[]).includes(k);
}
