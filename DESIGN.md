---
name: Dealerships
description: Dealer reviews read off a matte-black aircraft instrument panel, where every number comes from a live service.
colors:
  ground: "oklch(0.13 0.008 250)"
  panel: "oklch(0.175 0.01 250)"
  face: "oklch(0.1 0.006 250)"
  bezel: "oklch(0.22 0.01 250)"
  line: "oklch(0.34 0.012 250)"
  text: "oklch(0.95 0.005 250)"
  muted: "oklch(0.74 0.01 250)"
  placeholder: "oklch(0.6 0.01 250)"
  radium: "oklch(0.88 0.2 150)"
  radium-hover: "oklch(0.93 0.18 150)"
  amber: "oklch(0.83 0.16 80)"
  red: "oklch(0.72 0.2 28)"
typography:
  display:
    fontFamily: "B612, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.4vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "B612, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3.2vw, 2.1rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "B612, Segoe UI, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "B612, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "B612 Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  readout:
    fontFamily: "B612 Mono, ui-monospace, Consolas, monospace"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "4px"
  md: "6px"
  panel: "14px"
  pill: "99px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2.5rem"
  section: "3.5rem"
components:
  button-primary:
    backgroundColor: "{colors.radium}"
    textColor: "{colors.face}"
    rounded: "{rounded.sm}"
    padding: "0 1.4rem"
    height: "2.9rem"
  button-primary-hover:
    backgroundColor: "{colors.radium-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0 1.4rem"
    height: "2.9rem"
  input:
    backgroundColor: "{colors.face}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 0.85rem"
    height: "2.9rem"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "1.75rem"
  review-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "1.15rem 1.25rem"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "0 0.85rem"
    height: "2.2rem"
---

# Design System: Dealerships

## Overview

**Creative North Star: "The Night Flight Instrument Cluster"**

A matte-black cockpit panel at night. Markings are luminous white, the one lit accent is radium green, and amber and red lamps come on only when something deviates. Every number on the site is meant to be read off a live service, so the UI is built from dials with tick scales, hairline-ruled panels, and small mono uppercase placards, not from a generic grid of cards.

The density is calm and instrument-like: lots of black ground, thin lines instead of fills, light used as signal. Text is B612 (a cockpit-legibility face) for reading and B612 Mono for anything that is a reading, a label, or a path. The theme lives in `src/theme/theme.css` over the shared `x-` class contract in `src/core/shared.css`.

**Key Characteristics:**
- Dark only (`color-scheme: dark`), matte ground, no gradients on surfaces.
- One lit accent (radium) plus two deviation lamps (amber, red).
- Round SVG dials with major and minor ticks and damped needles.
- Hairline borders define structure; fills stay within three near-black steps.
- Mono uppercase placards for labels, buttons, nav, and status.

## Colors

A near-black blue-tinted neutral ramp with a single phosphor-green accent and two signal lamps.

### Primary
- **Radium Green** (`colors.radium`): the lit accent. Needles, primary button, active nav underline, focus ring, selected chip, positive sentiment, completed request hops, dealer place names.

### Secondary
- **Caution Amber** (`colors.amber`): a deviation lamp. Degraded service needle and readout, the caution banner and lamp, an active (in-flight) hop, stale or pending analyzer hints.
- **Fault Red** (`colors.red`): fault and negative. Failed service needles, negative sentiment, form errors, over-limit counter, failed hops.

### Neutral
- **Night Ground** (`colors.ground`): page background and sticky header (94% alpha).
- **Panel Black** (`colors.panel`): raised surfaces: instrument panel, review cards, filters, notes, lanes.
- **Dial Face** (`colors.face`): the deepest tone: inputs, dial faces, text on the radium button.
- **Bezel** (`colors.bezel`): dial bezel and hub only.
- **Hairline** (`colors.line`): every border, divider, scrollbar thumb.
- **Marking White** (`colors.text`): primary text, major ticks, neutral sentiment.
- **Dim Marking** (`colors.muted`): secondary text, minor ticks, placards, ghost button border. **Placeholder Grey** (`colors.placeholder`) is for input placeholders.

### Named Rules
**The Lamp Rule.** Amber and red appear only when something deviates (caution, fault, negative, error). They are never decoration, and a healthy screen has none.

**The One Lit Accent Rule.** Radium is the only chromatic color at rest. Anything glowing is radium, amber, or red, and it glows because it is a live signal.

**The Hairline Rule.** Structure comes from 1px `line` borders, not fills or heavy shadows. Sentiment cards add a 2px top rule in the sentiment color.

## Typography

**Display / Body Font:** B612 (with Segoe UI, system-ui, sans-serif)
**Label / Mono Font:** B612 Mono (with ui-monospace, Consolas, monospace)

**Character:** An aviation-designed sans for reading, its mono sibling for everything that is measured, labeled, or addressed. Fonts are self-hosted via Fontsource.

### Hierarchy
- **Display** (700, clamp(2.1rem, 4.4vw, 3.4rem), 1.1, -0.02em): home H1 only. Inner page titles use 700, clamp(1.9rem, 4.5vw, 2.9rem), 1.1.
- **Headline** (700, clamp(1.5rem, 3.2vw, 2.1rem), 1.15, max 26ch): home section headings.
- **Title** (700, 1.3rem, 1.2): inner-page section headings; dealer names are 700 at 1.05rem.
- **Body** (400, 1rem, 1.6): reading text; ledes at 1.05 to 1.1rem in muted, capped at 34 to 40rem or 60ch.
- **Label** (B612 Mono 700, 0.72 to 0.76rem, 0.1 to 0.14em, uppercase): placards, field labels, nav, buttons, sentiment marks.
- **Readout** (B612 Mono 700, 0.95 / 1.15 / 1.5rem for sm / default / lg dials, tabular numerals): dial values. Counts and scores use tabular-nums.

### Named Rules
**The Mono-Is-A-Reading Rule.** Mono type is reserved for values, labels, buttons, nav, and paths. Prose is always B612 sans in sentence case.

## Layout

Single content column of `min(100% - 2rem, 76rem)` (`100% - 3rem` from 640px), centered. Home hero is a two-column grid at 1024px+ (5fr copy, 7fr instrument panel, 3.5rem gap) and stacks below. The six dials sit in a 3-column grid (2 columns under 520px, the large dial spanning both). Sections are separated by a hairline top border with 3.5rem vertical padding. Annunciator review cards go 3-up from 820px; request lanes auto-fit at 14rem minimum; the request-step list is a hairline-ruled table (2rem / 16rem / 1fr from 760px). The dealer list is ruled rows, not cards, with a link grid of 1.4fr / 9rem / 1.2fr from 760px. Inner pages use 2.5rem top and 5rem bottom padding. Header is sticky, 3.75rem tall; nav collapses to a burger below 720px. Touch targets are at least 2.5rem (2.75rem for chips on coarse pointers).

## Elevation & Depth

Tonal layering plus light as signal. Depth is ground, then panel, then face (darkest, recessed), separated by hairlines. The only structural shadow is on the main instrument panel: a 1px inset top highlight and a soft deep drop (`inset 0 1px 0 oklch(1 0 0 / 0.06), 0 30px 60px -28px oklch(0 0 0 / 0.9)`). Glows are signal, not elevation: radium primary button (`0 0 22px -6px` radium at 65%), needles (`drop-shadow 3px`), lit sentiment bars and rules, hop lamps.

### Named Rules
**The Glow-Means-Live Rule.** A glow marks a live or lit element (needle, lamp, positive or negative marker, primary action). Never glow a passive surface.

## Shapes

Mostly small, precise radii: 4px for buttons, inputs, and nav items; 6px for cards, notes, and the lane table; 14px for the main instrument panel; full pill only for chips; circles for dials, hub, and lamps. Borders are 1px hairline; notes use a dashed hairline. Review cards carry a short 3px lit tab on the left edge and a 2px top rule on annunciator cards, in white, radium, or red by sentiment.

## Components

### Buttons
- **Shape:** 4px radius, 2.9rem minimum height, mono 700 0.8rem uppercase, 0.1em tracking.
- **Primary:** radium fill, face-dark text, radium glow; hover lightens to the radium-hover tone and strengthens the glow.
- **Ghost (default):** transparent, 1px muted border; hover shifts the border to marking white with a 5% white wash. Header "key" buttons are the same form at 0.74rem, with a lit variant (radium text, 60% radium border).
- **Focus:** 2px radium outline, 3px offset.

### Inputs / Fields
- **Style:** face-dark fill, 1px hairline border, 4px radius, 2.9rem minimum height, radium caret; labels are mono placards.
- **Focus:** radium border plus a 3px radium ring at 25% alpha.
- **Error:** red border and red mono message; disabled drops to 50% opacity.

### Cards / Containers
- **Panel and review card:** panel-black fill, 1px hairline, 6px radius (14px for the main panel), 1.15 to 1.75rem padding. Cards are used for reviews and link targets, not as a generic grid for dealers.
- **Notes:** panel fill, dashed hairline; error tone uses red at 70%.

### Chips
- Pill, transparent, muted mono text, hairline border; pressed state is radium text and border over a 10% radium wash.

### Navigation
- Mono uppercase 0.74rem links in muted; hover brightens with a panel wash; the current page is radium with a 2px inset underline. Wordmark "Dealerships" is B612 700 with a radium dial mark. Mobile uses a bordered burger and a full-width dropdown.

### Dial (signature)
- Round SVG: bezel, dark face, minor ticks in muted, major ticks in white (thicker), mono scale numerals, a radium needle with tail and glow, a hub ring. The needle turns amber at `caution` and red at `fail`, with the readout recolored to match; a parked needle sits at 35% opacity without glow. Needles damp to value over 1.1s (`cubic-bezier(0.22, 1, 0.36, 1)`) and sweep in from 135deg on load with 80ms staggers, only when motion is allowed. Readout and sub-caption sit under the dial.

### Request hops and annunciators
- Hops are small ring lamps in a mono row: done is radium and lit, active is amber and blinks in steps, failed is red. Annunciator review cards show a sentiment mark with a leading glowing shape and a score in muted mono.

## Do's and Don'ts

### Do:
- **Do** keep the ground at `colors.ground`, raised surfaces at `colors.panel`, recessed inputs and dial faces at `colors.face`.
- **Do** draw structure with 1px `colors.line` borders.
- **Do** reserve radium for live or actionable signals, and amber or red for deviation only.
- **Do** set values, labels, buttons, and nav in B612 Mono uppercase with tracking; set prose in B612.
- **Do** source every displayed number from a live service and show a failure as a fault lamp or red needle, not a hidden dial.
- **Do** respect reduced motion: the needle sweep is gated behind `prefers-reduced-motion: no-preference`.
- **Do** keep touch targets at least 2.5rem.

### Don't:
- **Don't** use amber or red decoratively on a healthy screen.
- **Don't** add a second lit accent hue; there is one radium.
- **Don't** make passive surfaces glow or give cards drop shadows.
- **Don't** introduce a light theme or gradient fills on surfaces.
- **Don't** render dealers as a generic card grid; the list is ruled rows.
- **Don't** show ratings, star scores, or invented figures; sentiment is computed text, per PRODUCT.md.
