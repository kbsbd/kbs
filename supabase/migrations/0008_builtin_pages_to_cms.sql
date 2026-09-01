-- ===========================================================================
-- 0008_builtin_pages_to_cms.sql
--
-- Phase 4: About, NRB and Landowner move into the page system.
--
-- Those three pages shipped as hand-written React with their copy, images,
-- reviews and FAQs as constants in the source. This migration turns them into
-- editable `pages` rows with their real content, so the admin can rewrite
-- every word without a deploy — and so the same layouts become a "style" an
-- admin can pick when creating a NEW page.
--
-- The animations are NOT reimplemented. The section renderers mount the very
-- same components those pages already used (Marquee, AboutTimeline,
-- CircleTitleAnime, AboutReviewSlider, Carousel, Accordion), so the marquee,
-- the rotating badge, the timeline and the sliders behave exactly as before.
--
-- It also corrects 0007: About, NRB, Landowner and Construction Status were
-- seeded as hidden from search on a misreading. They should be indexed.
--
-- Safe to re-run: guarded throughout; seeds skip if the row already exists.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Put the built-in pages back into search
--
-- 0007 assumed these were being unlinked and hidden. They are not — they are
-- being kept and edited, so they belong in Google and in the sitemap.
-- ---------------------------------------------------------------------------
update public.route_settings
set noindex = false, in_sitemap = true, updated_at = now()
where path in ('/about', '/nrb', '/landowner', '/construction-status');

-- ---------------------------------------------------------------------------
-- 2. New columns on page_sections for the bespoke layouts
--
--   blocks       ordered {title, body, …} groups — mission/vision pairs, the
--                NRB service cards, review cards, contact cards. Separate from
--                `items` because several sections need BOTH a list of groups
--                and a flat ticked list (the mission block is exactly that).
--   image_url_2  the second, offset image in the About legacy collage
--   badge_text   the text ring drawn around the play button (CircleTitleAnime)
--   video_url    opens in the Fancybox lightbox, as on the original pages
--   variant      a visual variation within one kind (review slider vs
--                carousel; one-column vs two-column ticked list)
--   embed        an interactive widget to mount inside the section
--                (service_finder | landowner_contact)
-- ---------------------------------------------------------------------------
alter table public.page_sections add column if not exists blocks jsonb not null default '[]'::jsonb;
alter table public.page_sections add column if not exists image_url_2 text;
alter table public.page_sections add column if not exists badge_text text;
alter table public.page_sections add column if not exists video_url text;
alter table public.page_sections add column if not exists variant text;
alter table public.page_sections add column if not exists embed text;

-- A page's banner headline is often a full sentence ("We don't just make
-- buildings…") while its NAME needs to stay short for menus and the admin
-- list. Keeping them apart avoids forcing one to serve both.
alter table public.pages add column if not exists banner_title text;

-- ---------------------------------------------------------------------------
-- 3. Widen the allowed section kinds
-- ---------------------------------------------------------------------------
alter table public.page_sections drop constraint if exists page_sections_kind_valid;
alter table public.page_sections add constraint page_sections_kind_valid
  check (kind in (
    'richtext', 'image_text', 'checklist', 'faq', 'cards', 'cta',
    'legacy_split', 'marquee', 'timeline', 'feature_split',
    'services', 'video_split', 'review_slider', 'contact_block'
  ));

-- ---------------------------------------------------------------------------
-- 4. Free the three slugs
--
-- 0007 blocked them because a file in app/ would shadow a page row. That is
-- still true of the rest, but /about, /nrb and /landowner now render FROM the
-- page row, so they must be allowed.
-- ---------------------------------------------------------------------------
alter table public.pages drop constraint if exists pages_slug_not_reserved;
alter table public.pages add constraint pages_slug_not_reserved
  check (slug !~ '^(admin|api|contact|properties|property|construction-status|legal|_next|sitemap|robots|favicon)$');

-- ---------------------------------------------------------------------------
-- 5. timeline_entries — the 16-entry company history on the About page
--
-- A dedicated table rather than a jsonb blob: sixteen entries each with a
-- date, title, paragraph, image and side is far past what a textarea should
-- be asked to hold, and it gets a proper CRUD screen this way.
-- ---------------------------------------------------------------------------
create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  date_label text not null,
  title text not null,
  body text,
  image_url text,
  image_position text not null default 'left',   -- left | right
  link_label text,
  link_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists timeline_entries_sort_order_idx on public.timeline_entries (sort_order);

insert into public.timeline_entries
  (date_label, title, body, image_url, image_position, link_label, link_url, sort_order)
select * from (values
  ('1984', '1984-1985', 'In 1984, building technology & ideas ltd. - bti, started its journey in the real estate sector of Bangladesh, with a small office in the BRTC building, beside the Cricket Stadium.', '/wp-content/uploads/2021/04/about-us-588063.jpg', 'left', null, '#', 10),
  ('1986', '1986-1989', 'This period saw tough financial times. The cost of capital was high, and joint ventures were unheard of. However, with competition being almost negligible with only 3 real estate developers in the country, building technology and ideas ltd. got through it all and moved to a better future and address at the TMC Building in Eskaton in 1989.', '/wp-content/uploads/2021/04/about-us-583677.jpg', 'right', null, '#', 20),
  ('1990', '1990-1995', 'bti was the first to initiate the joint venture approach in Bangladesh during this period. Back then, landowners would own 20% of the apartments, and developers would own 80%. After bti entered joint venture development, this split became an even 50/50.', '/wp-content/uploads/2021/03/about-us-541441.jpg', 'left', null, '#', 30),
  ('1996', '1996-2000', 'Following the political turbulence of 1995, Dhaka’s apartment sales and competition in the real estate market grew rapidly. Despite the challenges, we expanded, introduced a revolutionary corporate setup, became the first real estate company to earn ISO 9001 certification in 1998, and then moved to Celebration Point, Gulshan in 2000.', '/wp-content/uploads/2021/04/about-us-483863.jpg', 'right', null, '#', 40),
  ('2000', '2000-2005', 'As apartment supply and real estate companies increased, the market faced falling prices, leading to the collapse of many firms. Our conservative strategy, commitment, and sincerity strengthened our reputation, leading to significant project growth from 2001 and allowing for our expansion to Chattogram.', '/wp-content/uploads/2021/03/about-us-300602.jpg', 'left', null, '#', 50),
  ('2006', '2006-2010', 'Shifting our focus to luxury living, we introduced innovative designs and launched our successful journey with upper-income customers through the Premium Collection. We also pioneered our first premium project, Paragon, in Dhanmondi, alongside new customer services like bti Interior Solutions and bti Brokerage. However, tough times were lurking on the horizon for the sector.', '/wp-content/uploads/2021/04/about-us-891442.jpg', 'right', null, '#', 60),
  ('2011', '2011-2015', 'Despite a market slump, we stood strong through our reputation for on-time handovers. During this period, we advanced digitally with a corporate Facebook page, a new website, and Bangladesh’s first real estate blog, earned an AA3 rating from Credit Rating Agency of Bangladesh, and launched the affordable housing line, Chayabithi.', '/wp-content/uploads/2021/03/about-us-488223.jpg', 'left', null, '#', 70),
  ('2016', '2016-2019', 'As an environmentally conscious brand, bti took the initiative to start producing eco-friendly Concrete Hollow Blocks to replace traditional burnt clay red bricks in construction. This brand-new Strategic Business Unit (SBU) was named bti Building Products. bti Property Management was also launched at this time. A new line of homes was added to our Luxury Collection for premium clientele, under the banner of ''Platinum Collection''. These homes brought forth smart living concepts for the first time in Bangladesh.', '/wp-content/uploads/2021/04/about-us-551180.jpg', 'right', null, '#', 80),
  ('2019', '2019-2020', 'We earned ISO 9001:2015 certification for quality in design, construction, and customer service. Additionally, we launched new SBUs, including The Business Centre and The Management Development Centre. Our reputation was further strengthened through achieving the sector’s highest AA2 credit rating, as well as securing our first LEED certification for bti Landmark on Gulshan Avenue. We ended this period on a high note by organizing Bangladesh’s largest-ever new home expo.', '/wp-content/uploads/2021/04/about-us-176142.jpg', 'left', null, '#', 90),
  ('2020', '2020', 'During the challenging period of the COVID-19 pandemic, as the world adapted to a “new normal,” bti stood resilient—delivering projects on time, as promised, while continuing its strong commitment to customer care.', '/wp-content/uploads/2026/06/2020-997496.webp', 'right', null, '#', 100),
  ('2021', '2020-2021', '<strong class="nm-timeline__subtitle">First time in the industry</strong><p>2020 saw the launch of a new category of residences, termed ''Wellness Communities''. These apartments have Smart Home features and all facilities required to maintain a fit & healthy lifestyle. Emphasis has been placed on greenery and open space for mental well-being.</p><strong class="nm-timeline__subtitle">New SBU</strong><p>We also launched a new SBU in 2021 called Get Smart by bti, through which we have introduced innovative home automation products for our customers. These products are geared to provide safety, security, style, and incredible functionality, even remotely in some cases.</p>', '/wp-content/uploads/2026/06/2021-427568.webp', 'left', null, '#', 110),
  ('2022', '2022', '<strong class="nm-timeline__subtitle">bti Firsts</strong><p>bti became the top taxpayer in the real estate sector for the financial year of 2021-2022. bti also received the acclaimed AA1 credit rating from the Credit Rating Agency of Bangladesh (CRAB). The AA1 credit rating certifies that we have a superior ability to meet financial obligations and project needs on time.</p><strong class="nm-timeline__subtitle">First time in the industry</strong><p>As part of bti’s belief in empowering women, the Stellar Women initiative was launched in collaboration with The Daily Star, the leading English newspaper of the nation.</p>', '/wp-content/uploads/2026/06/2022-782359.webp', 'right', null, '#', 120),
  ('2023', '2023', '<strong class="nm-timeline__subtitle">First time in the industry</strong><p>THREE, the tallest building in North Gulshan and the first Smart Home in Bangladesh, was handed over. A gem of bti’s Platinum Collection, it set new heights for luxury real estate in Bangladesh.</p><strong class="nm-timeline__subtitle">New SBU</strong><p>Previously operating as bti Property Management, a new SBU called PSM (Property Security Management) was launched in this year. This business aims to revolutionise the securing and management of property, ushering in a new era in safeguarding your assets.</p>', '/wp-content/uploads/2026/06/2023-829035.webp', 'left', null, '#', 130),
  ('2024', '2024', '<strong class="nm-timeline__subtitle">First time in the industry</strong><p>After awarding 12 rising female professionals across different categories, the first season of bti The Daily Stellar Women ended with an exclusive Gala held at the Banquet Hall of Kurmitola Golf Club. The star-studded event was a huge success, attended by winners, brand ambassadors, and dignitaries alike. The categories for the second season were launched at this prestigious event.</p><strong class="nm-timeline__subtitle">New SBU</strong><p>Healthy Harvest was launched under Nufarm Agro Ltd., aiming to make healthier, natural produce more easily accessible to all.</p>', '/wp-content/uploads/2026/06/2024-993486.webp', 'right', null, '#', 140),
  ('2025', '2025', '<strong class="nm-timeline__subtitle">bti Firsts</strong><p>This was the year in which bti was able to successfully hand over 34 completed projects across the Classic, Luxury & Wellness Communities collections in a calendar year. Of these, 23 were ahead of schedule, and 11 were on time. In 2025, bti received the "Corporate of the Year" award at the 4th Leadership Excellence Summit 2025. This prestigious award recognises bti''s commitment to maintaining excellence and leadership within the corporate sector of Bangladesh.</p><strong class="nm-timeline__subtitle">New SBU</strong><p>bti also launched its own Wood & Metal workshops this year.</p>', '/wp-content/uploads/2026/06/2025-252610.webp', 'left', null, '#', 150),
  ('2026', '2026', 'bti The Daily Star Stellar Women wrapped up its second season with a star-studded Gala held at the Banquet Hall of Kurmitola Golf Club.', '/wp-content/uploads/2026/06/2026-667026.webp', 'right', null, '#', 160)
) as seed(date_label, title, body, image_url, image_position, link_label, link_url, sort_order)
where not exists (select 1 from public.timeline_entries);

-- ---------------------------------------------------------------------------
-- 6. Properties archive
--
-- That page is a hero image over a search form, then a grid built from the
-- property records — it has no headline or intro paragraph to edit. What IS
-- hardcoded is the banner photo and the noun in the results count, so those
-- are the two fields, rather than inventing heading fields the page would
-- never render. Its title and description are already editable under
-- Built-in Pages.
-- ---------------------------------------------------------------------------
alter table public.site_settings add column if not exists properties_hero_url text;
alter table public.site_settings add column if not exists properties_count_label text;

update public.site_settings
set properties_hero_url =
      coalesce(properties_hero_url,
               '/wp-content/themes/bti-new-properties-special/assets/img/demo/properties-hero.webp'),
    properties_count_label = coalesce(properties_count_label, 'ongoing properties')
where id = 1;

-- ---------------------------------------------------------------------------
-- 7. RLS for the new table
-- ---------------------------------------------------------------------------
alter table public.timeline_entries enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'timeline_entries' and policyname = 'public read timeline_entries') then
    create policy "public read timeline_entries" on public.timeline_entries for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'timeline_entries' and policyname = 'admin write timeline_entries') then
    create policy "admin write timeline_entries" on public.timeline_entries
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;

-- ===========================================================================
-- 8. Seed the three pages with their existing content
--
-- Generated from the original page sources — every paragraph, list item,
-- review and FAQ below is a verbatim copy of what those files rendered.
-- Each section only inserts when nothing already occupies that position on
-- that page, so re-running cannot duplicate content, and anything the admin
-- has already edited is left alone.
-- ===========================================================================

-- About Us ------------------------------------------------------------
insert into public.pages
  (slug, title, banner_title, banner_subtitle, banner_image_url, template,
   meta_title, meta_description, is_published, sort_order)
values ('about', 'About Us', 'We don’t just make buildings. We’re in the business of customer satisfaction', null,
        '/wp-content/themes/bti-new-properties-special/assets/img/demo/banner-about.webp', 'standard', 'About Us',
        'KBS stands as one of the pioneers of Bangladesh''s real estate sector, with a legacy of on-time handovers, high quality of construction, and excellent designs.', true, 10)
on conflict (slug) do nothing;

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'legacy_split', 'A Legacy of Excellence', null, 'KBS stands as one of the pioneers of Bangladesh''s real estate sector, raising standards of professionalism and integrity across the industry. With a legacy of on-time handovers, high quality of construction, and excellent designs, we have helped shape skylines and communities for over four decades.

Our continuous dedication, depth of experience, and relentless pursuit of excellence have together earned us a position of strength and distinction in the market. Above all, we remain deeply humbled by the enduring trust and loyalty of our customers — a bond that has only grown stronger with time.',
       '[]'::jsonb, '[]'::jsonb, '/wp-content/themes/bti-new-properties-special/assets/img/demo/Our-Legacy-1.webp', '/wp-content/themes/bti-new-properties-special/assets/img/demo/Our-Legacy-2.webp',
       'right', '43 years of excellence', 'https://www.youtube.com/watch?v=zGP2vkMNUeI', null,
       null, 'dark', 10
from public.pages where slug = 'about'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'about' and ps.sort_order = 10);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'marquee', null, null, 'High Quality of Construction. Design Excellence. Reliability. Customer-centricity.',
       '[]'::jsonb, '[]'::jsonb, null, null,
       'right', null, null, null,
       null, 'light', 20
from public.pages where slug = 'about'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'about' and ps.sort_order = 20);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'timeline', 'Check out how we started shaping the future 4 decades ago', null, null,
       '[]'::jsonb, '[]'::jsonb, null, null,
       'right', null, null, null,
       null, 'dark', 30
from public.pages where slug = 'about'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'about' and ps.sort_order = 30);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'feature_split', null, 'Core Values', null,
       '["Win The Customer''s Heart.","Work Harder than Everyone Else & Strive to be the Best.","Maintain an Entrepreneurial Spirit.","Respect, Develop & Empower our People.","High Morals, Honesty & Integrity.","Speed of Work, Fight Bureaucracy, Sycophancy and Remove Superfluous Work.","Practice Meritocracy & Constantly Enhance Talent Density."]'::jsonb, '[{"title":"Mission","body":"To make homeownership a joyful experience."},{"title":"Vision","body":"To provide viable housing solutions to every segment of our society."}]'::jsonb, '/wp-content/themes/bti-new-properties-special/assets/img/demo/mision-vision.webp', null,
       'right', 'Pioneers of Bangladeshi Real Estate', 'https://www.youtube.com/watch?v=394OaJS3AKc', null,
       null, 'light', 40
from public.pages where slug = 'about'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'about' and ps.sort_order = 40);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'feature_split', null, null, null,
       '["On-time delivery, guaranteed","Amazing credit ratings = timely payments","A heartfelt relationship with patrons","A one-stop solution to all real-estate issues"]'::jsonb, '[{"title":"Why should you choose KBS?","body":"There are certain advantages to choosing KBS as your real estate partner, such as:"}]'::jsonb, '/wp-content/themes/bti-new-properties-special/assets/img/demo/mision-vision-2.webp', null,
       'left', null, null, null,
       null, 'light', 50
from public.pages where slug = 'about'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'about' and ps.sort_order = 50);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'review_slider', 'What our customers say', null, null,
       '[]'::jsonb, '[{"name":"Sumon Kumar Das & Rasmone Das","role":"Shopnoneer","text":"“It was a privilege to perform our ritual prayer in our apartment, and we are truly grateful to KBS f...”","stars":5},{"name":"Md. Kamrul Hasan Sarkar","role":"Ikebana","text":"“I sincerely appreciate the excellent service I received from KBS. Their professionalism, prompt resp...”","stars":5},{"name":"Md. Hossain Ripone","role":"Glenwood","text":"“I recently worked with KBS and was truly impressed by their professionalism, patience, and dedicatio...”","stars":5},{"name":"Md. Milon Mahbub","role":"Glenwood","text":"“Big thanks to KBS for their collaboration and for respecting my preferences. Hope this feedback supp...”","stars":5},{"name":"Aktaruzzaman Razib","role":"Celestial Heights & West Gate","text":"“We loved KBS’s dedication in completing our Celestial Heights home, which inspired us to buy another...”","stars":5},{"name":"Dr. Nuruzzaman","role":"Liberty","text":"“I deeply appreciate KBS''s customer service, professionalism, dedication, and unwavering support thro...”","stars":5},{"name":"Mainuddin Chowdhury & Ferdousi Sultana","role":"KBS Sorrento","text":"“We truly appreciate KBS''s dedication in resolving the damp in our apartment. Their commitment &...”","stars":5},{"name":"Dr. Rezina Yasmin","role":"Park Panorama","text":"“I truly appreciate KBS''s prompt support in resolving any issues with my project and enhancing my apa...”","stars":5},{"name":"Shanuara Begum","role":"West End","text":"“A heartfelt thanks to KBS for their complete support on our journey! I''m very grateful for all the h...”","stars":5},{"name":"Ariful Arafath","role":"Homeowner, Shopnobilash","text":"“I am thrilled with the entire experience with KBS from start to finish. Thank you for making my drea...”","stars":5},{"name":"Dr Sayedun Nahar","role":"KBS Oakland","text":"“First of all, I would like to thank almighty Allah for giving me the opportunity to sign a contract...”","stars":5},{"name":"Iqbal Anwar","role":"Camelia, C-6","text":"“Yesterday I received the keys of the apartment, Camelia C-6, with a festive mood and full satisfacti...”","stars":5}]'::jsonb, null, null,
       'right', null, null, 'slider',
       null, 'light', 60
from public.pages where slug = 'about'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'about' and ps.sort_order = 60);

-- NRB ------------------------------------------------------------
insert into public.pages
  (slug, title, banner_title, banner_subtitle, banner_image_url, template,
   meta_title, meta_description, is_published, sort_order)
values ('nrb', 'NRB', 'Making homeownership a joyful experience', 'Own, develop, or manage property in Dhaka and Chattogram with secure, transparent, and hassle-free real estate support from KBS.',
        '/wp-content/uploads/2026/06/nrb-hero-062232.webp', 'feature', 'NRB',
        'Own, develop, or manage property in Dhaka and Chattogram with secure, transparent, and hassle-free real estate support from KBS.', true, 20)
on conflict (slug) do nothing;

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'feature_split', null, 'For each road will lead along—
Every wish made upon the land we belong.', 'Are you an NRB looking for an apartment in Dhaka or Chattogram? Do you have more than 5 katha land that you want to develop? Do you want to maintain your property? Do you want to keep it secure?

To ensure a joyful experience in property investment and management, KBS has come up with solutions handpicked for you. From assisting with legal procedures to providing end-to-end real estate solutions, KBS helps you own, make, and maintain properties in Bangladesh with ease and confidence.',
       '[]'::jsonb, '[]'::jsonb, '/wp-content/uploads/2026/06/nrb-content-2-045186.webp', null,
       'right', null, null, 'quote',
       null, 'light', 10
from public.pages where slug = 'nrb'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'nrb' and ps.sort_order = 10);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'services', 'Complete real estate solutions for NRBs', 'We offer', 'Choose the support you need, from finding a home to developing land, managing property, or designing interiors.',
       '[]'::jsonb, '[{"title":"Choose a property","body":"Explore KBS homes in Dhaka and Chattogram with guidance for NRB buyers.","icon":"M4 21V9l8-5 8 5v12M4 21h16M9 21v-6h6v6"},{"title":"Joint venture land development","body":"Develop suitable land through a trusted, structured, and experienced developer partnership.","icon":"M8 21h8M12 3v18M4 8l8-5 8 5M4 8v6a4 4 0 0 0 8 0M12 14a4 4 0 0 0 8 0V8"},{"title":"Buy, Sell & Rent","body":"Get brokerage support for property buying, selling, and rental needs in Bangladesh.","icon":"M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4"},{"title":"Security & Management","body":"Maintain and secure your property with reliable management support while you are abroad.","icon":"M12 2 4 5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10V5l-8-3Z"},{"title":"Interior design & implementation","body":"Turn your apartment into a ready living space through design and implementation support.","icon":"M4 4h16v12H4V4Zm0 16h16M8 20v-4M16 20v-4"},{"title":"Legal & documentation support","body":"Receive assistance with the procedures and documentation needed for a smoother property journey.","icon":"M6 2h9l5 5v15H6V2Zm9 0v5h5M9 12h6M9 16h6"}]'::jsonb, null, null,
       'right', null, null, null,
       null, 'dark', 20
from public.pages where slug = 'nrb'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'nrb' and ps.sort_order = 20);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'checklist', 'High Quality of Construction. Design Excellence. Reliability. Customer-centricity.', 'What makes us unique?', 'NRBs need clarity, trust, and easy communication. KBS brings multiple real estate services under one reliable platform so your property decision feels secure and manageable.',
       '["Ensuring the experience of joyful homeownership","Secured and hassle-free investment opportunity","Hassle-free maintenance of property","Wide range of choices for homes","Reliable developer with 43 years of experience","Communication is just one click away!","Simplifies life with seamless services","Ensuring complete real estate solutions","Transparency in payments"]'::jsonb, '[]'::jsonb, null, null,
       'right', null, null, 'two-column',
       null, 'light', 30
from public.pages where slug = 'nrb'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'nrb' and ps.sort_order = 30);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'contact_block', 'Find the right NRB service', 'Call for details', 'Talk to KBS for support with buying, developing, maintaining, securing, or designing your property in Bangladesh.',
       '[]'::jsonb, '[{"icon":"phone","title":"16604","body":"Call KBS for details","href":"tel:16604"},{"icon":"chat","title":"+8801313401405","body":"WhatsApp support","href":"https://wa.me/+8801313401405"}]'::jsonb, null, null,
       'right', null, null, null,
       'service_finder', 'dark', 40
from public.pages where slug = 'nrb'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'nrb' and ps.sort_order = 40);

-- Landowner ------------------------------------------------------------
insert into public.pages
  (slug, title, banner_title, banner_subtitle, banner_image_url, template,
   meta_title, meta_description, is_published, sort_order)
values ('landowner', 'Landowner', 'Develop your land with confidence', 'Dealing with real estate developers in Bangladesh is often complex and risky, but KBS has made the joint venture process easier, transparent, and hassle-free for landowners.',
        '/wp-content/uploads/2026/06/landowner-hero-765299.webp', 'feature', 'Landowner',
        'Develop your land with KBS, a trusted joint venture partner with over four decades of experience in Bangladesh real estate.', true, 30)
on conflict (slug) do nothing;

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'feature_split', 'Why choose KBS as a partner to develop your land?', null, 'Dealing with real estate developers in Bangladesh can be difficult to navigate. Even though the joint venture process can be complicated & bureaucratic, we have simplified it, making it hassle-free. We firmly believe that no one else can offer our level of expertise, as do our partnered landowners. Read about their experience with us & take a look through some of our finished projects.',
       '[]'::jsonb, '[]'::jsonb, '/wp-content/uploads/2026/06/landowner-c-143812.webp', null,
       'left', null, null, null,
       null, 'light', 10
from public.pages where slug = 'landowner'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'landowner' and ps.sort_order = 10);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'video_split', 'How is KBS different?', null, 'KBS is one of the few companies known for being trustworthy as a joint venture partner for developing your land. As one of the pioneers in the sector, we have retained our position as a top real estate developer and have built this reputation of reliability over the good part of half a century.

We fully understand your dilemma and know how to tackle the complex systems involved in developing your property. Our vast experience has left us in a better position than most, to empathize and take care of all your concerns regarding the big decision to develop your land.

With a specialized customer service team along with architects, engineers, and logistic support, we work to make the process stress-free for you and continue to be at your service for years to come.',
       '[]'::jsonb, '[]'::jsonb, null, null,
       'left', null, 'https://www.youtube.com/watch?v=GtL1FD4DhOk', null,
       null, 'dark', 20
from public.pages where slug = 'landowner'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'landowner' and ps.sort_order = 20);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'review_slider', 'What landowners say about KBS', null, null,
       '[]'::jsonb, '[{"name":"S M Zulkarnine","role":"Landowner of Casa Palmera","text":"After extensively consulting my peers, I found KBS''s reputation for sound structures to be a solid reason to move forward.","stars":5},{"name":"Air Vice Marshal A G Mahmud (Retd.)","role":"Landowner","text":"After consulting my peers, I found that KBS has a legacy of on-time handovers. That is what convinced me.","stars":5},{"name":"Md. Shafiqul Anwar","role":"Landowner of Royal Oaks","text":"KBS stays true to its commitment, guaranteeing on-time or even ahead of schedule handover, a trait that is rare.","stars":5},{"name":"Mr. Aminul Haq Jashim","role":"Landowner of Grand Nawab","text":"If you have land in Chattogram that you want to be developed with on-time handover and fantastic quality, KBS is the partner.","stars":5},{"name":"Mr. Anwarul Islam Tarique","role":"Landowner of Palacio","text":"Thanks to KBS and their amazing team for giving us exactly what we were looking for — great quality of construction.","stars":5},{"name":"Refat Rehan Mahmud","role":"Landowner of Domus, Bashundhara R/A","text":"I would like to extend my gratitude to you personally for your outstanding leadership throughout the project.","stars":5},{"name":"Md. Abdul Hye","role":"Landowner of KBS Chorus and KBS Rosemary","text":"Mr. Joyram Sen and Mr. Iftikharul Anam are engaged to ensure our maintenance needs are always met promptly.","stars":5},{"name":"Sultana Nazmun Nahar","role":"Landowner of Royale Gardenia, Banani","text":"I am the landowner of The Royal Gardenia Banani. I would like to thank KBS for their continued support.","stars":5}]'::jsonb, null, null,
       'right', null, null, 'carousel',
       null, 'dark', 30
from public.pages where slug = 'landowner'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'landowner' and ps.sort_order = 30);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'faq', 'Frequently asked questions', null, null,
       '[{"question":"Q: What does DAP mean?","answer":"DAP means Detail Area Planning. The general objectives of DAP are to implement the provisions of the DMDP Structure Plan (SP) and Urban Area Plan (UAP) policies and recommendations."},{"question":"Q: What is FAR?","answer":"The floor area ratio (FAR) is the ratio of a building''s total floor area to the size of the land. Written as a formula, FAR = gross floor building area ÷ area of the plot."},{"question":"Q: What affects FAR and the maximum construction area?","answer":"The maximum ground coverage depends on land size and the width of the entrance road. Front road width also affects FAR values. In short, land area multiplied by FAR value gives the maximum construction area of a building."},{"question":"Q: How many parking spaces will be available?","answer":"The number of parking spaces depends on land size, land shape, building height, basement provision, car lift, park lift and other factors. This is determined on a case-by-case basis."},{"question":"Q: What needs to be considered for basement construction?","answer":"Basement construction is generally expensive and requires careful execution to avoid water leakage and dampness. For smaller plots below 8 Katha, basements are generally not feasible. For larger plots, basements may be necessary for parking."},{"question":"Q: What is space sharing?","answer":"Space sharing refers to the use of space in a building by the landowner and the developer. It depends on mutual understanding, land value, selling price, apartment units and agreed signing money."},{"question":"Q: How is the distribution of floors done?","answer":"Floor distribution is done through mutual understanding between the landowner and the developer. Both parties choose floors as per the merit or value of the property."},{"question":"Q: How is apartment size measured?","answer":"The apartment size is the net floor area of the apartment plus the common areas as specified in the Real Estate Management Act 2010."},{"question":"Q: Which areas are considered common space?","answer":"Lift lobby, staircase room, lift machine room, generator room, sub-station room, caretaker''s room, guard room and common facilities such as gym, prayer room, library room, guest waiting area and reception are considered common space."},{"question":"Q: What are the considerations for plan approval?","answer":"In Dhaka, RAJUK and Cantonment Board are the final authorities for plan approval, and in Chattogram, it is CDA. Approval depends on factors such as building height, road width, number of apartments, land status and permissions from concerned authorities."},{"question":"Q: How is fire protection ensured?","answer":"Fire protection is ensured through essential firefighting tools such as fire extinguishers, fire hydrants and sprinklers. A fire staircase is mandatory as per BNBC rules."},{"question":"Q: How does KBS make buildings earthquake-resistant?","answer":"KBS follows the BNBC code for earthquake protection. Beyond implementing BNBC code, KBS has introduced the jacketing system, a scientifically proven method for earthquake-resistant design."},{"question":"Q: Do you test materials or concrete strength?","answer":"KBS carries out appropriate testing to ensure materials are of high quality. Certain materials such as steel bars and concrete strength are tested through BUET."},{"question":"Q: When will possession or handover for construction happen?","answer":"Possession or handover is subject to mutual understanding between the developer and landowner. Generally, construction possession is required after the plan has been approved by the concerned authority."},{"question":"Q: What is the maintenance service policy?","answer":"KBS provides a 1-year free after-sales service to apartment owners for maintenance and upkeep of apartments."}]'::jsonb, '[]'::jsonb, null, null,
       'right', null, null, null,
       null, 'light', 40
from public.pages where slug = 'landowner'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'landowner' and ps.sort_order = 40);

insert into public.page_sections
  (page_id, kind, heading, subheading, body, items, blocks, image_url, image_url_2,
   image_side, badge_text, video_url, variant, embed, background, sort_order)
select id, 'contact_block', 'Get in touch', null, 'Entrust KBS as your joint venture partner. Be a part of KBS, the leading real estate developer in Bangladesh.',
       '[]'::jsonb, '[{"icon":"phone","title":"16604","body":"+8809813191919","href":null},{"icon":"map","title":"KBS Celebration Point","body":"Plot: 3 & 5, Road: 113/A, Gulshan-2, Dhaka-1212","href":null}]'::jsonb, null, null,
       'right', null, null, null,
       'landowner_contact', 'dark', 50
from public.pages where slug = 'landowner'
  and not exists (select 1 from public.page_sections ps
                  join public.pages pg on pg.id = ps.page_id
                  where pg.slug = 'landowner' and ps.sort_order = 50);
