import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import CheckoutView from "@/components/shop/CheckoutView";

export const metadata = { title: "Checkout — KBS", robots: { index: false } };

export default async function CheckoutPage({
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
        <CheckoutView
          l={l}
          symbol={c.shop.currencySymbol}
          flatShipping={c.shop.flatShipping}
          freeOver={c.shop.freeShippingOver}
          modes={c.shop.checkoutModes}
        />
      </div>
    </div>
  );
}
