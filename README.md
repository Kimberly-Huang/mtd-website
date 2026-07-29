# JBS Swift — Omnichannel Conversion Strategy

An interactive strategy dashboard for identifying, activating and validating JBS Swift's first-online-conversion opportunities, built on a 25-month proprietary dataset.

**Live:** https://mtd-website-tau.vercel.app/

## What it is

A single-page application structured as a decision chain rather than a report. Eight tabbed sections, each with its own filter controls that recompute the views in place:

| Section | Question | Key interactions |
|---|---|---|
| **Overview** | Where do we stand? | KPI-definition reconciliation, base composition, section routing |
| **Who** | Which customers to convert? | Band ladder drill-down, P2 split toggle, band sorting, local RFV-table highlight |
| **What** | What do we say to them? | Persona playbook plus evidence-backed audience share and conversion lift |
| **How** | How do we reach them? | Comment set (all vs detractors), channel toggles, theme filters |
| **When** | When do we send? | Occasion, channel and year filters with explicit data-availability safeguards |
| **Where** | Where do we deploy? | Leaflet map with state, store-type and radius controls; local rollout-tier filter |
| **Proof** | Why trust it? | Success criteria, independent validation, ruled-out hypotheses |
| **Methods** | What are the limits? | Pipeline, source tables, glossary, definition reconciliation, owned limitations |

## Tech stack

- **Vanilla HTML / CSS / JavaScript** — no framework, no build step, no `node_modules`. The entire application is one ~167 KB `index.html` (~49 KB gzipped).
- **Chart.js 4** — 17 charts: line, bar, stacked bar, horizontal bar, doughnut, radar and bubble.
- **Leaflet 1.9** — store network map with 528 geocoded locations, layer toggles and 5 km proximity circles.
- **Vercel** — static deployment, redeployed automatically on every push to `main`.

## Implementation notes

- **Client-side filtering throughout.** 16 pill-group filters and 5 checkbox filters recompute charts, KPI cards and tables from in-memory data. No backend, no API calls, no database connection.
- **Scoped controls.** Every filter strip states which component it updates; table-only and rollout-only controls sit next to their respective outputs.
- **Shareable filter state.** Only the active page's selections are encoded in the URL (`#where?st=SP&z=sp_metro&g=1`), so analytical views can be linked without unrelated filter residue.
- **Lazy chart initialisation.** Charts are constructed on first visit to their tab rather than on page load.
- **Precomputed aggregates.** Analysis runs offline in Python and DuckDB; only the resulting aggregate arrays are embedded. The page does not re-query the 150M-row source at view time, and no customer-level data reaches the browser.
- **Provenance on every chart.** Each of the 17 charts carries its unit, sample size, period and source table.
- **Accessible.** ARIA tablist semantics, arrow-key navigation between sections, `aria-pressed` on filters, and a text summary of every chart for screen readers.
- **Responsive and printable.** Mobile navigation follows the active tab, grids avoid horizontal overflow, and the print stylesheet expands every section for PDF export.
- **Graceful CDN fallback.** Core text, tables and filters remain usable if Chart.js or Leaflet is temporarily unavailable.
- **CSS design system** driven by custom properties, with tabular figures so numeric columns align.

## Data foundation

Findings are drawn from a proprietary 25-month JBS Swift dataset (May 2024 – May 2026):

- **16 raw tables**, with **10 used directly in the dashboard**, **123M+** customer-month rows, **150M+** transaction line items and zero monthly gaps.
- Processed in **Python + DuckDB** directly over partitioned **Parquet** files — glob-unioned scans, column-selective reads, no full-dataset loads.
- A transparent **rules-based Priority Score** (Value / Engagement / Readiness / Momentum / Age) ranks 2.56M physical-only customers into five bands, validated out-of-time against observed month-over-month conversions.

Raw data is not included in this repository and is excluded via `.gitignore`.

## Known open items

Stated here rather than buried, and surfaced on the Methods page in the application:

- **Target basis.** Swift reports **10.82%** under a broader O2O-interaction definition; this dashboard reports **2.87%** under a strict both-channel-purchase definition. Because the stated **6%** goal has not been confirmed against either definition, the dashboard deliberately does **not** calculate a 2.87% → 6% customer gap.
- **NPS populations.** Channel NPS differs between the comment subset (+70.7 physical) and all survey responses (+86.8), because commenters are roughly 3× more likely to be detractors. Both are labelled by population in the application.
- **Timing coverage.** The Everyday weekday pattern is available only as a pooled view; yearly buttons are disabled when that occasion is selected rather than substituting Barbecue data.

Structural limitations of the data — customers cannot be linked to stores, READINESS partly overlaps the outcome, NPS is not representative of the base — are documented on the Methods page.

## Run locally

No build is required. For the closest match to production, serve the folder locally:

```bash
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/`. An internet connection is used only to load Chart.js, Leaflet, map tiles and fonts from their CDNs.

## Deployment

Vercel deploys the static site automatically from the `main` branch of this repository.

## Structure

```
index.html      # the entire application
README.md
.gitignore
```
