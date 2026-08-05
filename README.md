# JBS Swift Omnichannel Conversion Strategy

An authenticated strategy dashboard for identifying, activating and validating JBS Swift's first-online-conversion opportunities, built on a 25-month proprietary dataset.

**Live:** https://mtd-website-tau.vercel.app/

## What it is

A single-page application structured as a decision chain rather than a report. The Overview tells the executive story through five decisions: diagnose, prioritise, design, orchestrate and validate. Seven evidence tabs preserve the detailed charts, controls, assumptions and methods.

| Section | Question | Key interactions |
|---|---|---|
| **Overview** | What should Swift do next? | Visual strategy roadmap, five-decision narrative, KPI baseline and two coordinated pilot plans |
| **Methods** | How was it built? | Pipeline, source tables and glossary |
| **Who** | Which customers to convert? | Band ladder drill-down, P2 split toggle, band sorting, local RFV-table highlight |
| **What** | What do we say to them? | Persona playbook plus evidence-backed audience share and conversion lift |
| **How** | How do we reach them? | Comment set (all vs detractors), channel toggles, theme filters |
| **When** | When do we send? | Occasion, channel and year filters with explicit data-availability safeguards |
| **Where** | Where do we deploy? | Contextual street map, rollout controls and a Worst 20 online-store service queue |
| **Proof** | Why trust it? | Success criteria, observed transaction validation, ruled-out hypotheses |

## Tech stack

- **Vanilla HTML / CSS / JavaScript:** the dashboard remains framework-free and client-side.
- **Vercel Functions:** server-rendered access gate, environment-backed credentials and signed HttpOnly sessions.
- **Chart.js 4:** 17 charts, including line, bar, stacked bar, horizontal bar, doughnut, radar and bubble.
- **Leaflet 1.9:** locally bundled map runtime with a CARTO basemap, 528 geocoded locations, layer toggles and 5 km proximity circles.
- **Vercel:** functions and private HTML templates are redeployed automatically on every push to `main`.

## Implementation notes

- **One narrative spine, not two modes.** Overview is the guided executive story; the remaining sections provide methods and decision-specific drill-downs. Decision banners and next-section handoffs preserve the same logic across every tab without removing analytical depth.
- **Two analytically separate pilots.** The recommendation coordinates a customer-level CRM activation pilot with a geography-level store rollout, but does not claim a customer-to-store join that the source data cannot support.
- **Server-enforced access.** Unauthenticated requests receive only the login document. The dashboard HTML is bundled inside a Vercel Function and is returned only after a signed session cookie is verified.
- **Client-side filtering throughout.** 16 pill-group filters and 5 checkbox filters recompute charts, KPI cards and tables from in-memory data. No database connection or customer-level browser payload is required.
- **Scoped controls.** Every filter strip states which component it updates; table-only and rollout-only controls sit next to their respective outputs.
- **Shareable filter state.** Only the active page's selections are encoded in the URL (`#where?st=SP&z=sp_metro&g=1`), so analytical views can be linked without unrelated filter residue.
- **Lazy chart initialisation.** Charts are constructed on first visit to their tab rather than on page load.
- **Precomputed aggregates.** Analysis runs offline in Python and DuckDB; only the resulting aggregate arrays are embedded. The page does not re-query the 150M-row source at view time, and no customer-level data reaches the browser.
- **Provenance on every chart.** Each of the 17 charts carries its unit, sample size, period and source table.
- **Accessible.** ARIA tablist semantics, arrow-key navigation between sections, `aria-pressed` on filters, and a text summary of every chart for screen readers.
- **Responsive and printable.** Mobile navigation follows the active tab, grids avoid horizontal overflow, and the print stylesheet expands every section for PDF export.
- **Contextual geography.** The CARTO basemap provides city, district and road context; its tile domain is explicitly allowed by the site's Content Security Policy.
- **CSS design system** driven by custom properties, with tabular figures so numeric columns align.

## Data foundation

Findings are drawn from a proprietary 25-month JBS Swift dataset covering May 2024 to May 2026:

- **16 raw tables**, with **10 used directly in the dashboard**, **123M+** customer-month rows, **150M+** transaction line items and zero monthly gaps.
- Processed in **Python + DuckDB** directly over partitioned **Parquet** files using glob-unioned scans and column-selective reads, without full-dataset loads.
- A transparent **rules-based Priority Score** (Value / Engagement / Readiness / Momentum / Age) ranks 2.56M physical-only customers into five bands, validated out-of-time against observed month-over-month conversions.

Raw data is not included in this repository and is excluded via `.gitignore`.

## Known open items

Stated here rather than buried in implementation details:

- **NPS populations.** Channel NPS differs between the comment subset (+70.7 physical) and all survey responses (+86.8), because commenters are roughly 3× more likely to be detractors. Both are labelled by population in the application.
- **Timing coverage.** The Everyday weekday pattern is available only as a pooled view; yearly buttons are disabled when that occasion is selected rather than substituting Barbecue data.

## Authentication

The login uses three server-only environment variables:

```bash
MTD_AUTH_USERNAME=...
MTD_AUTH_PASSWORD=... # at least 10 characters
MTD_AUTH_SECRET=...   # random value, at least 32 characters
```

The password and signing secret are never embedded in the browser bundle or committed to the repository. Successful login issues a signed `HttpOnly`, `Secure`, `SameSite=Lax` cookie. Sessions expire after 12 hours, or after 7 days when **Keep me signed in** is selected.

## Run locally

Copy `.env.example` to an ignored `.env.local`, set the three values, then run with Vercel's local runtime:

```bash
npx vercel dev
```

An internet connection is used to load Chart.js, CARTO map tiles and fonts. The Leaflet runtime itself is served locally with the application.

## Deployment

Vercel deploys automatically from the `main` branch. Configure `MTD_AUTH_USERNAME`, `MTD_AUTH_PASSWORD` and `MTD_AUTH_SECRET` for Production, Preview and Development before the first protected deployment.

## Structure

```text
api/auth.js              # login, logout and session endpoint
api/site.js              # server-side login/dashboard gate
lib/auth.js              # signed-cookie authentication
private/login.html       # public login experience
private/dashboard.html   # returned only after session verification
public/robots.txt
public/vendor/leaflet.*            # locally bundled map runtime
tests/auth.test.mjs
vercel.json
```
