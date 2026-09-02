import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { getEnabledPaymentMethods } from "@/lib/shop";
import CheckoutView from "@/components/shop/CheckoutView";
import type { CheckoutMode } from "@/components/shop/checkout-math";

export const metadata = { title: "Checkout — KBS", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const [c, methods] = await Promise.all([getContent(), getEnabledPaymentMethods()]);
  if (!c.shop.enabled) notFound();

  return (
    <div className="page">
      <div className="page-wrap">
        <CheckoutView
          l={l}
          symbol={c.shop.currencySymbol}
          flatShipping={c.shop.flatShipping}
          freeOver={c.shop.freeShippingOver}
          modes={methods as CheckoutMode[]}
        />
      </div>
    </div>
  );
}
