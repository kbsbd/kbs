import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getPage } from "@/lib/cms";
import Blocks from "@/components/cms/Blocks";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Not found" };
  const l = (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : "en";
  return {
    title: `${(l === "bn" && page.title_bn) || page.title} — KBS`,
    description: page.seoDescription || undefined,
  };
}

export default async function CmsPageRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="page">
      <div className="page-wrap max-w-[70ch]">
        <h1 className="font-display text-[clamp(2rem,5.5vw,3.2rem)]">
          {(l === "bn" && page.title_bn) || page.title}
        </h1>
        <div className="mt-8">
          <Blocks blocks={page.blocks} l={l} />
        </div>
      </div>
    </div>
  );
}
