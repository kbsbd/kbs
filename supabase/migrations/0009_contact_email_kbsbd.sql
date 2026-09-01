-- ===========================================================================
-- 0009_contact_email_kbsbd.sql
--
-- Point the public contact address at info@kbsbd.com. This is only the address
-- shown on /contact and in the site JSON-LD; the actual delivery of contact
-- form submissions to that inbox is handled in the app (lib/email.js +
-- lib/actions/leads.js) over Gmail SMTP.
--
-- Only replaces the old placeholder seed ('info@kbs.com') — an address an admin
-- has since set through /admin is left untouched.
--
-- Safe to re-run.
-- ===========================================================================

update public.site_settings
set contact_email = 'info@kbsbd.com'
where id = 1
  and (contact_email is null or contact_email in ('', 'info@kbs.com'));
