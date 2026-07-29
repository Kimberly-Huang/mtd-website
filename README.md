# JBS Swift — Omnichannel Conversion Strategy

An interactive strategy dashboard for lifting JBS Swift's omnichannel penetration from **2.87% to 6%**, built on a 25-month proprietary dataset.

**Live:** https://mtd-website-tau.vercel.app/

## What it is

A single-page application structured as a decision chain rather than a report. Seven tabbed sections, each with its own filter controls that recompute the views in place:

| Section | Question | Key interactions |
|---|---|---|
| **Overview** | Where do we stand? | Progress to target, base composition, section routing |
| **Who** | Which customers to convert? | Band ladder drill-down, P2 split toggle, RFV tier cross-filter, sort by lift or size |
| **What** | What do we say to them? | Persona playbook filtered by priority tier and basket type |
| **How** | How do we reach them? | Comment set (all vs detractors), channel toggles, theme filters |
| **When** | When do we send? | Occasion, channel and year filters driving a timing reference table |
| **Where** | Where do we deploy? | Leaflet map with state, store-type, radius and rollout-tier filters |
| **Proof** | Why trust it? | Success criteria, independent validation, ruled-out hypotheses |

## Tech stack

- **Vanilla HTML / CSS / JavaScript** — no framework, no build step, no `node_modules`. The entire application is one ~136 KB `index.html` that runs by opening it.
- **Chart.js 4** — 15 charts: line, bar, stacked bar, horizontal bar, doughnut, radar and bubble.
- **Leaflet 1.9** — store network map with 528 geocoded locations, layer toggles and 5 km proximity circles.
- **Vercel** — static deployment, redeployed automatically on every push to `main`.

## Implementation notes

- **Client-side filtering throughout.** 16 pill-group filters and 5 checkbox filters recompute charts, KPI cards and tables from in-memory data. No backend, no API calls, no database connection.
- **Lazy chart initialisation.** Charts are constructed on first visit to their tab rather than on page load, so the initial render stays fast.
- **Precomputed aggregates.** Analysis runs offline in Python and DuckDB; only small aggregate arrays are embedded in the page. No customer-level data is shipped to the browser.
- **CSS design system** driven by custom properties — colour tokens, spacing scale, shadow and radius scales — with tabular-figure typography so numeric columns align.
- **Inline SVG** brand mark, scalable and themeable via `currentColor`.
- **Hash-based routing** (`#who`, `#when`, …) so any section can be linked directly.
- No cookies, no tracking, no client-side storage.

## Data foundation

Findings are drawn from a proprietary 25-month JBS Swift dataset (May 2024 – May 2026):

- **16 tables**, **123M+** customer-month rows, **150M+** transaction line items, zero monthly gaps.
- Processed in **Python + DuckDB** directly over partitioned **Parquet** files — glob-unioned scans, column-selective reads, no full-dataset loads.
- A transparent **rules-based Priority Score** (Value / Engagement / Readiness / Momentum / Age) ranks 2.56M physical-only customers into five bands, validated out-of-time against observed month-over-month conversions.

Raw data is not included in this repository and is excluded via `.gitignore`.

## Run locally

Open `index.html` in any browser. No server or build required — an internet connection is used only to load Chart.js, Leaflet and fonts from CDN.

## Structure

```
index.html      # the entire application
README.md
.gitignore
```
