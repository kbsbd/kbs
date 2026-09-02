import { NextResponse, type NextRequest } from "next/server";

/**
 * The root layout lives at app/[locale]/layout.tsx so <html lang> is correct
 * per language. That means "/" has no page of its own, so it is redirected to a
 * language. Bengali is the default for a Dhaka audience, but a browser that
 * clearly prefers English gets English.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname !== "/") return NextResponse.next();

  const accept = req.headers.get("accept-language") ?? "";
  const prefersEnglish = /^\s*en\b/i.test(accept) && !/\bbn\b/i.test(accept);
  const url = req.nextUrl.clone();
  url.pathname = prefersEnglish ? "/en" : "/bn";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/"],
};
