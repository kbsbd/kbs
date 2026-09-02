import AuthPage from "@/components/auth/AuthPage";

export const metadata = { title: "Account — KBS", robots: { index: false } };

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <AuthPage params={params} mode="signup" />;
}
