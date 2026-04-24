# CallBriefs — Design System

This document captures the visual and structural rules that the CallBriefs dashboard is built on. Use it as the source of truth when adding new surfaces, so the product stays consistent as it grows.

---

## 1. Product context

**CallBriefs** is a B2B SaaS tool for sales reps. It turns a call transcript or recording into a personalized microsite ("brief") for the buyer — pulling in their priorities, next steps, and relevant collateral from a shared Knowledge library.

The product personality should read as **modern, clean, professional — Linear meets Notion**. Serious but not corporate. The interface breathes; a distinctive accent color does the heavy lifting so the chrome can stay quiet.

---

## 2. Design principles

1. **Quiet chrome, loud accent.** Neutrals carry 95% of the surface; the citron accent is reserved for the primary CTA and active/processing states. Never tint large surfaces with the accent.
2. **Density with air.** We display real operational data (tables, stats, artifact lists) but never at the expense of line-height, padding, or whitespace between sections.
3. **Type, not icons, does the naming.** Iconography is small, monochrome, and strictly supportive. Nothing is illustrated; no gradients, no mascots.
4. **Placeholders over fakes.** When an asset is missing (logo, screenshot, chart), we show a subtly-striped placeholder or a monospace label — never a made-up brand mark.
5. **Warm neutrals.** Our "white" has a touch of warmth (hue 80–85). Our "black" matches. This keeps the interface from feeling sterile.

---

## 3. Color

All colors are declared in `oklch()` so lightness and chroma stay perceptually stable when we shift hues.

### 3.1 Canvas & surface

| Token          | Value                   | Role                             |
| -------------- | ----------------------- | -------------------------------- |
| `--bg`         | `oklch(98.2% 0.005 85)` | Page background — warm off-white |
| `--surface`    | `#ffffff`               | Cards, tables, inputs            |
| `--nav-bg`     | `oklch(96.4% 0.006 85)` | Left nav background              |
| `--nav-hover`  | `oklch(93.5% 0.008 85)` | Nav item hover                   |
| `--nav-active` | `oklch(90.0% 0.010 85)` | Nav item active                  |

### 3.2 Ink scale (text, borders, dividers)

| Token       | Value                 | Typical use            |
| ----------- | --------------------- | ---------------------- |
| `--ink-900` | `oklch(22% 0.012 80)` | Primary text, headings |
| `--ink-700` | `oklch(38% 0.010 80)` | Secondary text, body   |
| `--ink-500` | `oklch(55% 0.008 80)` | Tertiary text, labels  |
| `--ink-400` | `oklch(66% 0.007 80)` | Muted icon strokes     |
| `--ink-300` | `oklch(78% 0.006 80)` | Disabled, separators   |
| `--ink-200` | `oklch(88% 0.005 80)` | Strong border          |
| `--ink-150` | `oklch(92% 0.005 80)` | Default border         |
| `--ink-100` | `oklch(95% 0.004 80)` | Row hover, subtle fill |

### 3.3 Accent (citron — default)

| Token             | Value                 | Use                       |
| ----------------- | --------------------- | ------------------------- |
| `--accent`        | `oklch(84% 0.19 115)` | Primary CTA fill          |
| `--accent-strong` | `oklch(78% 0.19 115)` | CTA hover, processing dot |
| `--accent-ink`    | `oklch(25% 0.08 115)` | Text on accent            |

Alternate palettes (available via Tweaks, all share chroma ≈ 0.18): **Cobalt** (hue 255), **Ember** (35), **Moss** (150), **Violet** (300), **Ink** (mono).

### 3.4 Semantic

| Token      | Hue                   | Use                                  |
| ---------- | --------------------- | ------------------------------------ |
| `--ok`     | `oklch(68% 0.14 150)` | Viewed, Indexed, positive delta      |
| `--warn`   | `oklch(78% 0.14 75)`  | Needs-review                         |
| `--info`   | `oklch(70% 0.10 240)` | Informational dots, connected source |
| `--danger` | `oklch(64% 0.17 25)`  | Notification dot, destructive        |

Status pills always use a tinted background via `color-mix(in oklch, <token> 12-18%, white ...%)` and a darker-ink foreground so contrast stays consistent regardless of palette.

---

## 4. Typography

Typeface: **Geist** (UI) and **Geist Mono** (IDs, counts, keyboard shortcuts, file sizes).
Feature settings: `'ss01', 'cv11'`. Tracking: `-0.005em` body; `-0.01em` to `-0.025em` at display sizes.

| Role                              | Size    | Weight  | Tracking           |
| --------------------------------- | ------- | ------- | ------------------ |
| Display (hero title)              | 28      | 600     | -0.025em           |
| Page title                        | 22–24   | 600     | -0.025em           |
| Section title                     | 15      | 600     | -0.01em            |
| Body                              | 13.5–14 | 400     | -0.005em           |
| Caption                           | 12.5    | 400     | 0                  |
| Eyebrow / uppercase label         | 11      | 500     | +0.06em, uppercase |
| Mono (IDs, shortcuts, file sizes) | 10.5–12 | 400–500 | 0                  |

Rules:

- Never use a font smaller than 11px.
- Uppercase eyebrows get `+0.06em` tracking; nothing else is uppercased.
- Numbers in tables and stat cards use Geist (default) — the mono face is reserved for **identifiers**, not measurements, except file sizes where alignment helps.

---

## 5. Geometry

| Token                             | Value   | Use                           |
| --------------------------------- | ------- | ----------------------------- |
| `--radius`                        | 10px    | Cards, buttons (default)      |
| `--radius-sm`                     | 7px     | Nav items, tags, inline chips |
| Pills                             | 999px   | Status pills, filter pills    |
| Large surfaces (hero, onboarding) | 12–14px | More generous                 |

Border width is always `1px` in `--ink-150` unless a stronger edge is intentional (e.g. selected swatch, active pill).

Shadows are sparse. The only elevated surface in the product is the Tweaks panel:
`0 12px 40px -12px rgba(20,20,20,0.25), 0 2px 6px rgba(20,20,20,0.06)`
Buttons get a single-pixel inset highlight (`inset 0 1px 0 rgba(255,255,255,0.6)`) to read as "raised" without a shadow.

---

## 6. Spacing

We target an 8px base with 4px half-steps. Common values in the system:

- Inside a row/cell: **10–18px**
- Between sections on a page: **20–24px**
- Page outer padding: **28px** (main content area)
- Card inner padding: **16–22px**
- Icon ↔ label: **8–10px**
- Pill inner padding: **3px × 9px** (compact), **5px × 10px** (toolbar)

---

## 7. App shell

```
┌────────────┬──────────────────────────────────────────────┐
│   Left     │  Header (56px) — crumbs · search · bell · me │
│   Nav      ├──────────────────────────────────────────────┤
│  (248px)   │                                              │
│            │                 Main content                  │
│            │                                              │
└────────────┴──────────────────────────────────────────────┘
```

### 7.1 Left nav (248px, light)

- Brand lockup + BETA tag at top
- Workspace switcher row (name + seat/plan)
- **Primary CTA: "New Brief"** — filled accent, with `N` keyboard hint
- Core nav: Briefs, Knowledge, Users, Settings (each with count chip)
- "Pinned" section with user-managed entries
- Footer: **usage card** (briefs this month, progress bar, upgrade link)

The nav is **not dark**. Hover and active states are three steps of the warm-gray scale (`--nav-bg` → `--nav-hover` → `--nav-active`).

### 7.2 Header (56px)

- Breadcrumb (`Workspace / <page>`)
- Search input (⌘K hint), placeholder adapts per page
- Notification bell with danger dot
- Avatar menu (initials, name, email, chevron)

### 7.3 Main content

- Max width: **1240px** for flat pages, **1320px** for pages with a sub-rail (Knowledge).
- Outer padding: **28px 28px 60px**.
- Every page root carries `data-screen-label` for routing/comments.

---

## 8. Components

### 8.1 Buttons

- **Primary**: `--accent` fill, `--accent-strong` border, `--accent-ink` text, inset highlight, 9px radius. Hover darkens fill to `--accent-strong`.
- **Secondary**: `--surface` fill, `--ink-200` border, `--ink-900` text.
- **Icon button**: 30–32px square, `--ink-150` border, `--ink-700` glyph.
- **Text link**: `--ink-900`, `fontWeight: 500`, arrow glyph.

### 8.2 Status pills

Pattern: `[colored dot] [label] [optional mono %]`. Background is a 12–18% tint of the semantic hue against white; text is a dark mix of the same hue. Processing pills get a pulsing ring on the dot (3px `color-mix` halo).

Canonical statuses:

- **Sent** (ink)
- **Viewed** (ok)
- **Draft** (ink-400)
- **Processing** — accent, with `%` suffix
- **Indexed** (ok) — Knowledge
- **Needs review** (warn) — Knowledge

### 8.3 Tables

- Column header row: `--bg` background, 11px uppercase label, `+0.06em` tracking, 10px vertical padding.
- Row: 12–14px vertical padding, 18px horizontal, bottom border `--ink-100`.
- Row hover: `--ink-100` fill.
- Leading cell pattern for entity tables:
  `[32–34px logo/badge] [name (500)] [ID or meta (mono 11.5px, --ink-500)]`.
- Tabs filter bar sits inside the table card header, pill-style inside an `--ink-100` track.

### 8.4 Stat cards

Pattern: **label → big number (30px, 600) → delta pill → sparkline**. Sparkline sits absolute bottom-right, 104×28, single-color stroke with a terminal dot. Up-trend uses `--ok`; flat/down uses `--ink-700`.

### 8.5 Hero / CTA card

Two-column: **copy on the left, interaction on the right**. Left column has an eyebrow chip, 28px title, supporting body, primary + secondary buttons, and a time-to-value hint. Right column holds the drop zone and source chips. The right panel has its own inner card styling (`--bg` fill, dashed border inside).

### 8.6 Onboarding banner

Tinted-accent strip with a leading glyph square, title + progress subtitle, and horizontal step pills (dashed circle → filled check circle). Dismissible.

### 8.7 Knowledge artifacts

- **File kind badge**: 34×34 rounded square, 14% tint of a kind-specific hue, mono label (`PDF`, `DECK`, `DOC`, `SHEET`, `IMAGE`, `VIDEO`, `AUDIO`).
- **Tag**: mono 11px, `#` prefix, `--ink-100` fill, 4px radius.
- **Usage bar**: single-fill `--ink-700` on `--ink-100` track, thin (4px).
- **Drop zone**: 1.5px dashed `--ink-200` border, 12px radius, drag-over state tints background `10%` with accent and promotes the border to `--accent-strong`.

---

## 9. Iconography

All icons are 24×24 viewBox, stroke `currentColor`, stroke-width **1.6** (2.0–2.2 only when the icon is doing CTA duty), line-cap round, line-join round. Default render size is 14–18px.

Never draw illustrative SVG. If an image is missing, show a striped placeholder with a mono label of what belongs there.

---

## 10. Motion

- Hovers: instant color change, no transition, or `150ms` max.
- Toggles, drop-zone state: `150ms` ease on `background` / `border-color`.
- No scroll-driven animations, no parallax, no entry animations on lists.

---

## 11. Tweaks (live customization)

A floating panel (bottom-right, 280px wide) lets the user:

- Swap the **accent** from a 6-swatch palette.
- Swap **nav tone** between warm / cool / neutral.
- Toggle the **getting-started banner** on/off.

Selected values persist via the host edit-mode protocol (`__edit_mode_set_keys`) into a JSON block bracketed by `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/`.

---

## 12. Rules of thumb for new surfaces

- If you're about to tint a large area with the accent → stop. Use `--ink-100` or `--bg` instead and let a single accent element (button, dot, pill) do the work.
- If the page has its own sub-nav, use a **left rail at 220px** with an uppercase section label + collection list (see Knowledge). Don't invent a second pattern.
- If you're adding a chart, prefer a single-color sparkline or a bar chart in `--ink-700` before reaching for multi-color. Reserve semantic colors for semantic meaning (ok/warn/danger), not variety.
- Every page root must carry a `data-screen-label` attribute so the host can reference it in comments.
- Never use emoji.
