import { createClient } from "@/lib/supabase/server";

export const DEFAULT_FOOTER_LINKS = [
  { label: "Blog", href: "https://btibd.com/blog/", open_new_tab: false },
  { label: "Newsletter", href: "https://btibd.com/newsletter/", open_new_tab: false },
  { label: "Gallery", href: "https://btibd.com/gallery/", open_new_tab: false },
  {
    label: "Handed over projects",
    href: "https://btibd.com/handed-over-projects/",
    open_new_tab: false,
  },
  {
    label: "Video",
    href: "https://www.youtube.com/c/btibuildingtechnologyideasltd",
    open_new_tab: true,
  },
  { label: "Career", href: "https://btibd.com/career/", open_new_tab: false },
  { label: "Privacy policy", href: "/legal/privacy-policy", open_new_tab: false },
];

export const DEFAULT_SOCIAL_LINKS = [
  { platform: "facebook", url: "https://www.facebook.com/btibd/" },
  { platform: "linkedin", url: "https://www.linkedin.com/company/btibd" },
  { platform: "instagram", url: "https://www.instagram.com/btibd" },
  {
    platform: "youtube",
    url: "https://www.youtube.com/c/btibuildingtechnologyideasltd",
  },
];

export async function getFooterLinks() {
  const supabase = await createClient();
  if (!supabase) return DEFAULT_FOOTER_LINKS;

  const { data, error } = await supabase
    .from("footer_links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return DEFAULT_FOOTER_LINKS;
  return data;
}

export async function getSocialLinks() {
  const supabase = await createClient();
  if (!supabase) return DEFAULT_SOCIAL_LINKS;

  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return DEFAULT_SOCIAL_LINKS;
  return data;
}
