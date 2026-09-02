import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import AuthForm from "./AuthForm";

/** Shared shell for the four auth routes. */
export default async function AuthPage({
  params,
  mode,
}: {
  params: Promise<{ locale: string }>;
  mode: "login" | "signup" | "forgot" | "reset";
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;

  return (
    <div className="page">
      <div className="page-wrap flex justify-center">
        <Suspense fallback={null}>
          <AuthForm mode={mode} l={l} />
        </Suspense>
      </div>
    </div>
  );
}
