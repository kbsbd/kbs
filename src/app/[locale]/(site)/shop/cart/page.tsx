import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import CartView from "@/components/shop/CartView";

export const metadata = { title: "Cart — KBS", robots: { index: false } };

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  if (!c.shop.enabled) notFound();

  return (
    <div className="page">
      <div className="page-wrap">
        <CartView
          l={l}
          symbol={c.shop.currencySymbol}
          flatShipping={c.shop.flatShipping}
          freeOver={c.shop.freeShippingOver}
        />
      </div>
    </div>
  );
}
