import { notFound } from "next/navigation";
import Link from "next/link";
import { LOCALES, type Locale } from "@/content/seed";

export const metadata = { title: "Thank you — KBS", robots: { index: false } };

export default async function CheckoutDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kind?: string; ref?: string; pay?: string }>;
}) {
  const { locale } = await params;
  const { kind, ref, pay } = await searchParams;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const isOrder = kind === "order";
  const followUp = pay === "followup";

  const t = {
    head: isOrder
      ? l === "bn" ? "অর্ডার পেয়েছি।" : "Order received."
      : l === "bn" ? "রিকোয়েস্ট পেয়েছি।" : "Request received.",
    body: isOrder
      ? followUp
        ? l === "bn"
          ? "আমরা অর্ডার নিশ্চিত করে পেমেন্টের বিস্তারিত আপনার নম্বরে বা ইমেইলে পাঠাব।"
          : "We'll confirm the order and send you the payment details by phone or email."
        : l === "bn"
          ? "আমরা শীঘ্রই আপনার দেওয়া নম্বরে যোগাযোগ করে ডেলিভারি নিশ্চিত করব।"
          : "We'll call you on the number you gave to confirm delivery."
      : l === "bn"
        ? "আমরা দাম ও স্টক যাচাই করে ইমেইল বা ফোনে কোটেশন পাঠাব, সাধারণত একই কর্মদিবসে।"
        : "We'll check pricing and stock and send a quote by email or phone, usually the same working day.",
    ref: isOrder ? (l === "bn" ? "অর্ডার নম্বর" : "Order number") : (l === "bn" ? "রেফারেন্স" : "Reference"),
    shop: l === "bn" ? "শপে ফিরে যান" : "Back to the shop",
  };

  return (
    <div className="page">
      <div className="page-wrap max-w-[40rem] text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--accent-muted)]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display mt-6 text-[clamp(1.8rem,5vw,2.6rem)]">{t.head}</h1>
        <p className="mt-4 leading-relaxed text-[color:var(--text-secondary)]">{t.body}</p>
        {ref && (
          <p className="mt-5 font-mono-label text-[color:var(--text-quiet)]">
            {t.ref}: <span className="text-[color:var(--text-primary)]">{ref}</span>
          </p>
        )}
        <Link href={`/${l}/shop`} className="btn btn-primary mt-8">
          {t.shop}
        </Link>
      </div>
    </div>
  );
}
