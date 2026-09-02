# KBS — Design Package

The single source of truth for the build. Every line of viewer-facing copy here ships verbatim.
Numbers marked *(seed)* are starting values written into the database and editable from the admin dashboard.

---

## 1. The brand premise

**Every floor gets a garden.**

In Dhaka, a flat is usually a sealed box stacked on other sealed boxes. The balcony, the one place a family
gets air, is the first thing a developer shrinks. KB HOUSE is built the other way round: the planting is not
decoration on the roof, it runs up the whole face of the building, one planted terrace per floor. The camera
in the hero video proves it without a word, climbing past terrace after terrace.

Every section on the page serves that one idea. The trust section serves it too, because a buyer who does not
believe the building will ever be finished will never care how green it is.

Register: a builder who has been doing this since 1995. Plain, warm, specific, never luxury-brochure.

---

## 2. Palette (sampled from the footage and the logo)

```css
:root{
  --canvas:#0B1622;          /* deep blue-slate, tinted from the sky grade, never pure black */
  --canvas-deep:#07101A;     /* the well behind the fixed background layer */
  --panel:#132234;           /* cards and raised surfaces */
  --panel-edge:#1E3348;      /* panel borders, meets 3:1 against panel */

  --accent:#88C038;          /* the logo green, sampled from the mark. CTA and rare emphasis only */
  --accent-hover:#9AD44A;
  --accent-muted:rgba(136,192,56,.20);   /* borders, glows, the living line at rest */

  --clay:#A97A6C;            /* the terracotta brick, sampled from the facade. Kickers and dividers */
  --clay-deep:#7C564B;

  --leaf:#70804F;            /* the balcony planting, sampled from the aerial frame */
  --sky:#103060;             /* the deep sky at the top of the low-angle shots */
  --sky-mid:#3060A0;

  --text-primary:#F1EEE7;    /* the white concrete, warmed. 14.8:1 on --canvas */
  --text-secondary:#A3B4C6;  /* 7.1:1 on --canvas */
  --text-quiet:#6F8299;      /* labels only, never body */
}
```

The accent is the CTA, focus rings, the living line's nodes, and two moments of emphasis. Nowhere else.

**Deviation stated out loud:** terracotta plus off-white is on the skill's banned-cliché list as a default
reach. It is not a default reach here. It is the actual brick and actual concrete on this actual building,
sampled pixel by pixel from the client's own renders. The canvas is a deep sky blue rather than the cliché's
cream, the accent is the client's own logo green rather than terracotta, and the clay is demoted to a
secondary role on kickers and dividers.

---

## 3. Type trio

Both scripts get a real pairing, not a Latin face with a Bengali fallback bolted on.

| Role | Latin | Bengali | Weights |
|---|---|---|---|
| Display | Archivo Expanded | Anek Bangla | 700 |
| Body | Hanken Grotesk | Hind Siliguri | 400, 500 |
| Mono / labels | IBM Plex Mono | (Latin mono used in both) | 500 |

Archivo Expanded is wide, geometric and architectural, echoing the building's horizontal concrete slabs. Anek
Bangla is variable with a matching width axis, so the two scripts sit at the same visual weight instead of one
looking pasted in. Neither Inter nor Roboto appears anywhere. Subset to the weights listed, with preconnect.

---

## 4. The hero band map

Hero height **1000vh**, so the scroll range is 900vh. Video is 44.08s; `time = progress × 44.08`.
Ranges are starting points, validated by the flick test.

| # | Range | Footage moment | Copy EN (verbatim) | Copy BN (verbatim) | Entrance |
|---|---|---|---|---|---|
| 1 | 0.00–0.12 | Street level, driving past the facade | kicker `KB HOUSE · DHAKA`<br>**Look up.**<br>Every floor of this one has a garden on it. | kicker `কেবি হাউস · ঢাকা`<br>**উপরে তাকান।**<br>এই ভবনের প্রতিটি তলাতেই একটি বাগান আছে। | Drift-down, echoing the eye lifting up the facade |
| 2 | 0.15–0.28 | Entrance and podium slide past | **Air first.**<br>The block is set back and opened up, so light and breeze reach the lower floors, not just the top ones. | **আগে বাতাস।**<br>ভবনটি পিছিয়ে বসানো ও খোলা রাখা, যাতে আলো-বাতাস কেবল উপরের তলায় নয়, নিচের তলাগুলোতেও পৌঁছায়। | Halves parting, echoing the entrance opening |
| 3 | 0.30–0.43 | Aerial cutaway, the tower sliced open | **Cut it open.**<br>Nine floors *(seed)*. Every single one has its own planted terrace. | **ভেতরটা দেখুন।**<br>নয় তলা *(seed)*। প্রতিটিতেই নিজস্ব সবুজ বারান্দা। | Grid snap-align, echoing the floor plates revealing in order |
| 4 | 0.45–0.55 | Rising up the planted balconies | **A balcony you actually use.**<br>Deep enough for a table, two chairs, and something growing. | **বারান্দা, যেটা সত্যিই ব্যবহার হয়।**<br>একটা টেবিল, দুটো চেয়ার আর কিছু গাছ রাখার মতো যথেষ্ট গভীর। | Word-punch, each object landing as the camera climbs |
| 5 | 0.57–0.70 | Rooftop pool, then the low angle into open sky | **The roof is yours too.**<br>Pool, open deck, and evening air nine floors up. | **ছাদটাও আপনার।**<br>সুইমিং পুল, খোলা ডেক, আর নয় তলা উপরের সন্ধ্যার বাতাস। | Approach-from-depth with a static-blur soft copy under it |
| 6 | 0.78–1.00 | Pull back, settle on the full tower | **KB HOUSE**<br>Under construction now. Come and walk it before it is finished.<br>`Book a site visit` | **কেবি হাউস**<br>এখন নির্মাণাধীন। শেষ হওয়ার আগেই এসে ঘুরে দেখুন।<br>`সাইট ভিজিট বুক করুন` | Word-by-word rise into a staged settle: headline, then subline, then the CTA row |

**Composition note.** In the settle frame the tower stands centre with open sky to the upper left and palms
framing the right. Band 6 lives in that upper-left sky. Bands 1 to 5 keep the centre-right lane clear, since
that is where the building is for the whole journey.

**Bengali is my draft and needs your eye.** I write serviceable Bangla, not native Bangla. Every line above is
editable from the dashboard, and I would rather you rewrite three of them than ship a phrasing that reads
slightly off to a Dhaka buyer.

---

## 5. Static hero copy (phones, reduced motion)

Over `still-05` (the tall tower against sky, which survives a portrait crop) with the settle composition:

> `KB HOUSE · DHAKA`
> **Every floor gets a garden.**
> Nine floors *(seed)*, each with its own planted terrace. Under construction in Dhaka now.
> `Book a site visit`

> `কেবি হাউস · ঢাকা`
> **প্রতিটি তলায় একটি বাগান।**
> নয় তলা *(seed)*, প্রতিটিতেই নিজস্ব সবুজ বারান্দা। ঢাকায় এখন নির্মাণাধীন।
> `সাইট ভিজিট বুক করুন`

---

## 6. Below the fold

Every section funnels to one anchor: `#book`. No second competing action anywhere.

1. **Nav** — logo mark, section links, language toggle (বাংলা / EN), and the booking button. Solid only after the hero settles.

2. **The one idea** — the premise stated once, full width, over image `16` (low angle, stacked planted balconies).
   > **A garden you do not have to go downstairs for.**
   > Most towers put the green on the roof, where almost nobody goes. This one runs it up the face of the building, so it is outside your own door on every floor.

3. **The building** — spec grid, every value admin-editable: floors, units, apartment sizes, land area, facing, handover target, status. Image `07`, the aerial that shows the whole complex in its neighbourhood.

4. **The balcony** — the one designed interactive moment. A hand-drawn SVG section through one balcony. Press and hold, and the planting grows along the rail while the depth dimension counts up to its real figure. Release early and it eases back down, never snaps. Reduced motion gets the finished state with no hold. It makes the visitor perform the brand's single idea with their own thumb.

5. **What is in it** — amenity grid with real renders, admin-managed list: rooftop pool and deck (`11`, `13`), gym (`09`), water garden (`15`), planted balconies (`12`), covered pool terrace (`06`), plus parking, standby generator, lift and security as icon entries until renders exist.

6. **Ask any builder for these. Including us.** — the trust section, and the highest-converting thing on the page for this market. Dhaka buyers have watched projects run 16 and 18 years past handover. The section does not claim awards. It hands them a checklist and invites them to hold KBS to it:
   > Title deed. Khatiyan. Mutation certificate. The approved building plan. Utility NOCs. The name of the structural engineer. The soil test report. And the clause that says what happens if we hand over late.
   >
   > Ask for all of it, from us and from everyone else you are talking to. A builder who hesitates has told you something.
   >
   > KBS has been building in this country since 1995.

   **Approval status is deliberately absent from this section and from the whole public site.** It is stored as an internal-only field on the admin side and rendered nowhere, per your instruction.

7. **FAQ** — the real objections from the research, answered plainly. Admin-editable, seeded with: when is handover, what happens if you are late, what does the price include, what is the monthly service charge, is it earthquake resistant, can I see the site while it is being built, can I get bank financing, who is the structural engineer.

8. **Other projects** — an admin-managed grid, built now and shipping empty with an honest line rather than filler:
   > More KBS projects are being added here.

   The section renders only when at least one project exists, so the live page never shows an empty shelf.

9. **Book a site visit** — the form. Name, phone, preferred date, preferred language, and an optional message. Posts to Supabase, appears in the dashboard, fires the Meta Pixel conversion event. Success state:
   > **Got it. We will call you.**
   > Someone from the KBS office will ring you on the number you gave, usually the same working day.

10. **Footer** — contact block, map, social links, all admin-editable. No fictional-brand disclosure needed: KBS is real.

---

## 7. The vector and motion layer

**Signature element: the living line.** A hand-drawn SVG path down the left gutter of the whole page, stroked
in `--accent-muted`. It draws itself with `stroke-dashoffset` as you scroll, and at each section anchor it
sprouts a small leaf node that lights to full `--accent`. It is the building's planted spine, redrawn as the
page's spine. Remove it and the page visibly loses its structure, which is the test the skill sets for a real
signature.

Supporting: the logo's pinwheel used as a section divider glyph, rotating once every 90 seconds. One fixed
background layer, a slow vertical drift from `--sky` to `--canvas-deep` on a 90 second cycle, with
whisper-level pollen motes. All of it honours reduced motion by pinning to final states and stopping the drives.

No two adjacent sections share a layout skeleton.

---

## 8. Engineering list (the standard the build must hit)

Streamed Blob fetch behind an honest loading ring with a 20s no-progress watchdog. Poster painted first, blob
fetch started only after the poster lands. Frame-rate independent lerp in a rAF loop that rests when converged
and when the hero is off-screen. Gated seeks that coalesce to the newest target and reset on error. All DOM
writes delta-gated. Bands paced in vh with smoothstep ramps, validated by the flick test at 120, 240 and 360px.
The four-layer legibility system: global scrim, per-band scrim riding `--k`, the three-layer text shadow token,
and chip scrims for small labels. The five static-hero gates, character-identical in CSS and JS, re-evaluated
live on rotation and preference changes. Complete and beautiful with the video missing. `overflow-x: clip` on
html and body. Reduced motion honoured in both directions.

**Worst-frame warning specific to this footage:** bands 5 and 6 sit over bright blue sky and white concrete,
the hardest possible background for light text. Those two bands get the deepest scrim alphas and must be
audited against their brightest frames, not their average ones.

---

## 9. Asset provenance

15 of the 16 supplied renders are clean and are the same building in the same world as the hero video.

**One is not.** The prayer room render carries the burned-in caption `MUSHOLLA - PROJECT BAPAK IW DAN IBU AR`,
which is another firm's Indonesian project. It is held out of the build pending your decision.

---

## 10. Copy gate

Every viewer-facing line above ships verbatim. The built page must pass the grep gate before anyone sees it:
zero em dashes, zero instances of leverage, seamless, empower, unlock, robust, actionable, data-driven or
solutions, plus the body sweep for testament, landscape, delve, elevate, "it's not just X, it's Y", false
ranges, vague attributions and generic big-finish conclusions.
