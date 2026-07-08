# Meat the Data — Driving Omnichannel Conversion at JBS Swift

A single-page analytics report site presenting a data-driven strategy to lift JBS Swift's omnichannel penetration from a flat **2.94%** to the **6%** target.

**Live:** https://mtd-website-tau.vercel.app/

## Tech stack

- **Vanilla HTML5 / CSS3 / JavaScript** — no framework, no build step, no `node_modules`. The entire site is one ~58 KB `index.html` that runs anywhere.
- **Chart.js 4** — six interactive, lazily-rendered charts (line, grouped bar, horizontal bar, doughnut) covering penetration trend, value gap, NPS by channel, product online share, seasonality, and reachability.
- **Vercel** — static deployment with automatic redeploys on every push to `main`.

## Implementation highlights

- **CSS design system** driven by custom properties (color tokens, spacing, shadows) for a consistent navy + red brand palette.
- **Responsive layout** built on CSS Grid and Flexbox with mobile breakpoints throughout.
- **Scroll-triggered reveals** and **on-view chart initialization** via the `IntersectionObserver` API — charts only render once scrolled into view.
- **Inline SVG logo** (the lightbulb + APP/WEB/STORE network mark), fully scalable and themeable via `currentColor`.
- **Typography** — Fraunces (display) + Inter (UI), loaded from Google Fonts.
- Zero client-side storage, no cookies, no tracking — a fully static document.

## Data foundation behind the report

The findings are drawn from a proprietary 25-month JBS Swift dataset:

- **16 tables**, **123M+** customer-month rows, **150M+** transaction line items, zero monthly gaps (May 2024 – May 2026).
- Processed in **Python + DuckDB** directly over partitioned **Parquet** files (glob-unioned scans, column-selective reads, no full-dataset loads).
- A transparent, **rules-based Priority Score** model (Value / Engagement / Readiness) segments physical-only customers into P1 / P2 / P3 conversion bands.

## Run locally

Open `index.html` in any browser. That's it — no server or build required (an internet connection is used only to load Chart.js and Google Fonts from CDN).

## Structure

```
index.html      # the entire site (markup, styles, charts, logic)
README.md
.gitignore
```
