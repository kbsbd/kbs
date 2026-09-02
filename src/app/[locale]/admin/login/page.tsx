import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { supabaseConfigured } from "@/lib/supabase/server";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "KBS admin", robots: { index: false, follow: false } };

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAdminSession();
  if (session) redirect(`/${locale}/admin`);

  return (
    <main className="relative z-[2] flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl border border-[color:var(--panel-edge)] bg-[color:var(--panel)] p-8 sm:p-10">
        <p className="font-mono-label text-[color:var(--text-quiet)]">KBS</p>
        <h1 className="font-display mt-3 text-3xl">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
          This is the staff area. There is no public sign up, so accounts are created
          for you.
        </p>

        {supabaseConfigured ? (
          <LoginForm locale={locale} />
        ) : (
          <p className="mt-8 rounded-xl border border-[color:var(--clay-deep)] p-4 text-sm text-[color:var(--clay)]">
            Supabase is not connected yet. Add the project URL and keys to the
            environment, run supabase/schema.sql, then reload this page.
          </p>
        )}
      </div>
    </main>
  );
}
