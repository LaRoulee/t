---
name: AUSSIEWAY
description: A photo-agency picture essay printed from a contact sheet; 1,900 contacts become frames on a roll.
colors:
  charcoal: "#444642"
  ink: "#2a2b29"
  ink-2: "#232422"
  bone: "#eeede8"
  bone-dim: "#b9b8b1"
  twilight: "#61398b"
  twilight-tint: "#ddd3ea"
  on-twilight: "#f7f3fb"
  coral: "#de5346"
  coral-text: "#ef7a6e"
  on-coral: "#121211"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.4rem, 1.3rem + 4.2vw, 5rem)"
    fontWeight: 620
    lineHeight: 0.94
    letterSpacing: "-0.04em"
    fontVariation: "\"wdth\" 125"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.9rem, 1.3rem + 2.2vw, 3.25rem)"
    fontWeight: 620
    lineHeight: 0.98
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 125"
  lede:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.9rem, 1.3rem + 2.2vw, 3.25rem)"
    fontWeight: 450
    lineHeight: 1.12
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 106"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.35rem, 1.1rem + 0.8vw, 1.75rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 112"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    fontVariation: "\"wdth\" 100"
  control:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    letterSpacing: "0.01em"
    fontVariation: "\"wdth\" 108"
  caption:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "0.04em"
    fontFeature: "\"tnum\" 1"
  rebate:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.12em"
    fontFeature: "\"tnum\" 1"
rounded:
  control: "2px"
spacing:
  gutter: "clamp(16px, 3vw, 40px)"
  frame-gap: "clamp(24px, 5vw, 88px)"
  section-reading: "clamp(120px, 24vh, 240px)"
  section-drench: "clamp(96px, 16vh, 180px)"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.on-coral}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.on-coral}"
  button-small:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.on-coral}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-large:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.on-coral}"
    rounded: "{rounded.control}"
    padding: "0 30px"
    height: "60px"
  link-quiet:
    textColor: "{colors.bone}"
    typography: "{typography.control}"
  frame-rebate:
    textColor: "{colors.bone-dim}"
    typography: "{typography.rebate}"
  step-tab:
    textColor: "{colors.bone-dim}"
    typography: "{typography.caption}"
    padding: "8px 12px"
  step-tab-active:
    textColor: "{colors.bone}"
---

# Design System: AUSSIEWAY

## Overview

**Creative North Star: "La planche contact"**

The system is a photo agency's picture essay printed from a contact sheet. The photograph is the subject, and the interface acts as the darkroom furniture around it: frame numbers, rebate lettering along the film edge, caption lines, hairline rules, and a coral china-marker loop drawn around the print being read. Nothing sits in a card, and nothing floats on a shadow. Depth comes from the photographs and the dark gradients that let type sit on them.

Colour is committed by region, not sprinkled. Charcoal ink grounds every photographic section, bone paper carries the reading passages, Istanbul Twilight drenches a single pause, and Rio Carnivale coral is the one action colour. Type is a single variable family, Archivo, working across its width axis: heavy and expanded (wdth 125) for display, normal width for reading, with intermediate widths for titles and controls.

Motion follows darkroom logic. Prints arrive pale and silvery, then develop into colour. Images open through slits and insets (clip-path) rather than fading, lines of display type rise out of their own line box, and a film counter runs 0001 to 1900 as the sheet scrolls. WebGL is used sparingly, only for the hero displacement sequence and the contact-sheet frames, and the DOM images always carry the full meaning without it.

**Key Characteristics:**
- Full-bleed documentary photography, square-cut and uncarded.
- Contact-sheet paraphernalia used as the interface layer: rebate numbers, captions, hairlines, a frame counter, a hand-drawn coral loop.
- Colour drenched per section: charcoal, bone, twilight; coral reserved for action.
- One variable typeface, its width axis carrying the hierarchy.
- Clip-path reveals and "developing" prints, with scroll smoothed by inertia.

## Colors

A warm-neutral charcoal and bone ground from the World Nomads chart, with one saturated purple region and one coral voice.

### Primary
- **Rio Carnivale Coral** (coral): the only action colour. It fills every purchase button, draws the china-marker loop, marks the active step's top rule, colours the Southern Cross brand mark, and is the focus ring and text-selection colour. At 3.68:1 on ink, it is a fill and stroke colour, never small text.
- **Coral Ink** (coral-text): the text-safe coral (5.2:1 on ink), used for rebate frame codes and any coral lettering on dark ground.
- **Press Black** (on-coral): the near-black label on coral buttons (4.85:1). It stays dark on the bone hover state.

### Secondary
- **Istanbul Twilight** (twilight): a full-section drench for the services pause. It is never used as an accent chip or a border.
- **Twilight Milk** (on-twilight): headings and rules on twilight. Hairlines use it at 28% alpha.
- **Lilac Tint** (twilight-tint): secondary text and captions on twilight (5.91:1).

### Neutral
- **Charcoal Ink** (ink): the default ground for photographic sections, the contact sheet, and the translucent solid nav (92% alpha).
- **Darkroom** (ink-2): the deepest ground, used for the hero backing, footer, scrollbar track and theme colour.
- **Manhattan Charcoal** (charcoal): the chart's parent tone. It serves as the placeholder fill behind prints while they load and as the scrollbar thumb.
- **Bone** (bone): primary text on dark, and the paper ground for reading passages, where ink becomes the text colour. Bone also serves as the button hover fill.
- **Bone Dim** (bone-dim): captions, rebate lettering, descriptions and footer text on dark (7.15:1 on ink).
- **Scrim Black** (rgba of 22 22 21, not a token): the only value used in the photo gradients and the legibility text-shadow.

### Named Rules
**The One Voice Rule.** Coral means "buy" or "you are here". It never decorates, never tints a panel, and never appears as body text.

**The Region Drench Rule.** A section commits to a single ground (ink, bone or twilight) edge to edge. Colours are not mixed inside a section, and no tinted cards sit on a ground.

**The Hairline Alpha Rule.** Rules are 1px in the section's text colour at low alpha (bone at 14–18% for sheet furniture, 40% for the offer row; on-twilight at 28%). There are no grey border tokens.

## Typography

**Display Font:** Archivo variable, self-hosted (weights 100–900, widths 62–125%), falling back to Helvetica Neue and Arial.
**Body Font:** Archivo at normal width (wdth 100).

**Character:** A single grotesque stretched wide and heavy for headlines reads like agency slug lines. At normal width the same family becomes a plain caption voice, so the photographs keep the attention.

### Hierarchy
- **Display** (620, wdth 125, step 4, lh 0.94, -0.04em): the hero title, the horizon line over the full-bleed photo, and the CTA title. It is set as stacked lines, and each line is masked so it can rise into place.
- **Headline** (620, wdth 125, step 3, lh 0.98, -0.035em, balanced wrap): section heads such as "Un guide, cinq étapes." and the services head.
- **Lede** (450, wdth 106, step 3, lh 1.12, -0.03em, max 24ch): the manifesto reading passage on bone. Its words light from 35% to full opacity as the reader scrolls.
- **Title** (500, wdth 110–112, step 2, lh 1.1, -0.02em): frame captions and service items. The offer price uses this weight at step 3.
- **Body** (400, wdth 100, 1rem, lh 1.55): descriptions at 34–42ch. On dark ground they are set in bone-dim, at 0.9375rem inside frames.
- **Control** (600, wdth 108, 0.9375rem, +0.01em): buttons.
- **Caption** (400, 0.8125rem, +0.04–0.08em, tabular numerals): photo captions, the journey line, steps, the sheet edge and the footer.
- **Rebate** (400, 0.6875rem, +0.12em, tabular): film-edge lettering above each frame ("AUSSIEWAY 400 ▸ 1A").

### Named Rules
**The Width Axis Rule.** Hierarchy is carried by the width axis and weight together. Display is always wdth 125 at 620, and running text is always wdth 100. A second typeface is never introduced.

**The Tabular Count Rule.** Every counter, frame number and price uses tabular numerals so the digits never shift while they animate.

## Layout

The page is a sequence of full-viewport chapters (100svh, with min-heights of 560–640px), each with a single ground. Horizontal inset is one fluid gutter, used everywhere: nav, hero content, sheet furniture, captions, section padding and footer. Reading passages on bone breathe with the largest vertical padding (section-reading), and the twilight drench uses section-drench.

On desktop the contact sheet is pinned. The frames travel horizontally on a track separated by frame-gap, with even frames dropped (20–48px) to stagger the contact rhythm. Frame width is fluid (240–440px), constrained both by viewport width and by viewport height. The services section is an asymmetric 5:7 grid with a sticky portrait on the left and a hairline-ruled list on the right, capped at 1400px. The CTA is a 1.3:1 grid pinned to the bottom of a full-bleed photograph.

Content is anchored to the lower edge: hero title and actions at bottom-left, frame counter and caption at bottom-right, the CTA at the bottom of the section. The top edge is left to the photograph and the nav.

At 900px and below, the sheet unpins into a vertical column (56px gap), the steps and nav links hide, and the sheet edge becomes a sticky translucent bar at the bottom. The services and CTA grids collapse to one column. At 520px and below, hero buttons go full width and the journey drops its icons. With reduced motion, the sheet becomes a static wrapping grid.

## Elevation & Depth

The system has no elevation. There are no box-shadows anywhere, and no surface lifts off another. Depth is photographic: dark gradients (scrim black at 0–82%) sit over images so bone type can sit on them, the hero frame recedes into an inset "print" on scroll, and images parallax inside their masks. Backdrop blur appears only on bars that float over moving content (the solid nav and the mobile sheet edge), always paired with 92–94% ink.

### Shadow Vocabulary
- **Photo legibility** (`text-shadow: 0 2px 30px rgba(22, 22, 21, .35)`): a soft halo only for display type set directly over a photograph without a panel, such as the horizon line.

### Named Rules
**The No-Lift Rule.** Surfaces never carry box-shadows. When type needs contrast over a photograph, darken the photograph with a scrim gradient first. The soft text halo is the last resort, and only on photographs.

## Shapes

Every edge is square: photographs, frames, sections and rules. The single softening is a barely-there 2px corner on buttons, so they read as pressed labels, not pills. The only organic form is the coral china-marker loop, a hand-drawn path at 0.6 stroke with round caps that overshoots the print by 12–14px. Icons are drawn line glyphs on a 24px grid (1.5–1.75 stroke, round joins), rendered at 16–18px in currentColor.

## Components

### Buttons
Buttons are solid coral labels that feel tactile and decisive.
- **Shape:** near-square corners (2px).
- **Primary:** a coral fill with a press-black label. It is 52px tall with 24px padding, and a drawn arrow icon sits 12px after the label.
- **Hover / Focus:** the fill turns to bone over 0.35s, and the arrow slides 4px right over 0.45s on the house ease. On press the button drops 1px. Focus is a 2px coral outline offset by 3px.
- **Sizes:** small (40px, 16px padding, 0.875rem) in the nav and large (60px, 30px padding, 1rem) in the offer. There is no secondary button. The secondary action is a quiet underlined link in bone, with a 45%-alpha underline offset 6px that goes solid on hover.

### Navigation
- A fixed bar in two parts: the wordmark on the left (700 weight, wdth 125, +0.14em tracking, with the Southern Cross mark in coral), and on the right the section links (0.875rem, 80% opacity, rising to 100% on hover) followed by the small coral button.
- The bar is transparent over the hero, then turns 92% ink with a 10px blur past 60% of the hero. It hides while scrolling down and returns on scroll up, but never hides while focus is inside it. Below 900px the links are removed.

### Contact Frame (signature)
- A 4:5 print (4:4.4 on mobile) with no border, container or radius. It sits on a charcoal placeholder while loading.
- A rebate line above the print carries the film name in bone-dim and the frame code in coral ink.
- A title and description sit below, 14px from the print.
- On reveal the print wipes open from top to bottom (1.4s expo.inOut) and develops from pale silver to colour (2.2s).
- While the frame is being read, the coral loop draws around it (0.9s) and un-draws when the reader moves on.
- With WebGL, hover produces a slight ripple and chromatic split, and scroll velocity bows the print.

### Steps & Sheet Edge
- Steps are caption-size tabs with a line icon and a 1px top rule at 18% bone. The active step turns bone and its rule turns coral.
- The sheet edge is a hairline-topped strip that reads "Planche 01 · [step]" on the left and "Contact 0001 / 1900" on the right. The counter is bone at weight 500 in tabular numerals.

### Ruled Lists
- Service items and the offer row are separated by full-width hairlines, not boxes, with 28–32px vertical padding.
- Each item puts a title-weight heading next to a secondary text column, and both collapse to one column on mobile.

### Photo Caption
- Caption size, set in bone-dim on ink, lilac tint on twilight, or bone over a photograph, 12px below the image. It follows the pattern "Place · activity, time", separated by a middle dot.

## Do's and Don'ts

### Do:
- **Do** give each section one ground (ink, ink-2, bone or twilight) and set its text in that ground's paired tone.
- **Do** keep coral for purchase buttons, the china-marker loop, the active step, focus and selection. Use coral-text for any coral lettering on dark.
- **Do** set display type in Archivo at wdth 125 and weight 620 with negative tracking (-0.035 to -0.04em), in stacked, masked lines.
- **Do** use contact-sheet furniture for secondary information: rebate codes, captions with middle dots, 1px low-alpha hairlines and tabular counters.
- **Do** reveal images with clip-path insets and slits on expo curves or the house ease cubic-bezier(0.16, 1, 0.3, 1), and give every scroll effect a static, reduced-motion equivalent.
- **Do** darken photographs with scrim gradients under any type set on them.

### Don't:
- **Don't** put content in cards, tinted panels or bordered boxes. Separate with hairlines and space.
- **Don't** use box-shadows or lifted surfaces. The only shadow is the soft text halo on type over photographs.
- **Don't** use coral (#de5346) as text on dark, or add a second accent colour.
- **Don't** introduce a second typeface or set running text wider than wdth 100.
- **Don't** round corners beyond the 2px on buttons, or round photographs at all.
- **Don't** make WebGL carry meaning. Every GL effect mirrors a DOM image that works on its own.
