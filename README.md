# JBS Swift — Omnichannel Conversion Strategy

An interactive strategy dashboard for lifting JBS Swift's omnichannel penetration from **2.87% to 6%**, built on a 25-month proprietary dataset.

**Live:** https://mtd-website-tau.vercel.app/

## What it is

A single-page application structured as a decision chain rather than a report. Eight tabbed sections, each with its own filter controls that recompute the views in place:

| Section | Question | Key interactions |
|---|---|---|
| **Overview** | Where do we stand? | Progress to target, base composition, section routing |
| **Who** | Which customers to convert? | Band ladder drill-down, P2 split toggle, RFV tier cross-filter, sort by lift or size |
| **What** | What do we say to them? | Persona playbook filtered by priority tier and basket type |
| **How** | How do we reach them? | Comment set (all vs detractors), channel toggles, theme filters |
| **When** | When do we send? | Occasion, channel and year filters driving a timing reference table |
| **Where** | Where do we deploy? | Leaflet map with state, store-type, radius and rollout-tier filters |
| **Proof** | Why trust it? | Success criteria, independent validation, ruled-out hypotheses |
| **Methods** | What are the limits? | Pipeline, source tables, glossary, definition reconciliation, owned limitations |

## Tech stack

- **Vanilla HTML / CSS / JavaScript** — no framework, no build step, no `node_modules`. The entire application is one ~166 KB `index.html` (46 KB gzipped) that runs by opening it.
- **Chart.js 4** — 17 charts: line, bar, stacked bar, horizontal bar, doughnut, radar and bubble.
- **Leaflet 1.9** — store network map with 528 geocoded locations, layer toggles and 5 km proximity circles.
- **Vercel** — static deployment, redeployed automatically on every push to `main`.

## Implementation notes

- **Client-side filtering throughout.** 16 pill-group filters and 5 checkbox filters recompute charts, KPI cards and tables from in-memory data. No backend, no API calls, no database connection.
- **Shareable filter state.** Page and filter selections are encoded in the URL (`#where?st=SP&g=1`), so any specific analytical view can be linked directly.
- **Lazy chart initialisation.** Charts are constructed on first visit to their tab rather than on page load.
- **Precomputed aggregates.** Analysis runs offline in Python and DuckDB; only the resulting aggregate arrays are embedded. The page does not re-query the 150M-row source at view time, and no customer-level data reaches the browser.
- **Provenance on every chart.** Each of the 17 charts carries its unit, sample size, period and source table.
- **Accessible.** ARIA tablist semantics, arrow-key navigation between sections, `aria-pressed` on filters, and a text summary of every chart for screen readers.
- **Print stylesheet.** Expands all sections and reflows for PDF export.
- **CSS design system** driven by custom properties, with tabular figures so numeric columns align.

## Data foundation

Findings are drawn from a proprietary 25-month JBS Swift dataset (May 2024 – May 2026):

- **16 tables**, **123M+** customer-month rows, **150M+** transaction line items, zero monthly gaps.
- Processed in **Python + DuckDB** directly over partitioned **Parquet** files — glob-unioned scans, column-selective reads, no full-dataset loads.
- A transparent **rules-based Priority Score** (Value / Engagement / Readiness / Momentum / Age) ranks 2.56M physical-only customers into five bands, validated out-of-time against observed month-over-month conversions.

Raw data is not included in this repository and is excluded via `.gitignore`.

## Known open items

Stated here rather than buried, and surfaced on the Methods page in the application:

- **Target basis.** Swift reports **10.82%** omnichannel penetration under a broader O2O definition; this dashboard reports **2.87%** under a strict both-channel-purchase definition. Every gap figure assumes the 6% target is read on the strict definition, following the original brief's "approximately 3% to 6%" framing. That basis is not yet confirmed in writing.
- **NPS populations.** Channel NPS differs between the comment subset (+70.7 physical) and all survey responses (+86.8), because commenters are roughly 3× more likely to be detractors. Both are labelled by population in the application.
- **Not yet quantified.** P3's occasion mix is described qualitatively in the source analysis and is deliberately left off the relevant chart rather than estimated.

Structural limitations of the data — customers cannot be linked to stores, READINESS partly overlaps the outcome, NPS is not representative of the base — are documented on the Methods page.

## Run locally

Open `index.html` in any browser. No server or build required — an internet connection is used only to load Chart.js, Leaflet and fonts from CDN.

## Structure

```
index.html      # the entire application
README.md
.gitignore
```
