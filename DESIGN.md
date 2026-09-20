---
name: TITUN
description: A product-first retail system for premium refreshment and modern hospitality.
colors:
  ritual-ink: "#181511"
  porcelain: "#f8f6f1"
  pure-white: "#ffffff"
  walnut: "#6b4736"
  restrained-gold: "#b39143"
  soft-linen: "#f3efe8"
  warm-sand: "#eee9df"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(3.4rem, 7vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.08em"
rounded:
  square: "0px"
  round: "9999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  section: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.ritual-ink}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.square}"
    padding: "0.875rem 1.5rem"
    height: "3.5rem"
  button-secondary:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.ritual-ink}"
    rounded: "{rounded.square}"
    padding: "0.875rem 1.5rem"
  field-underlined:
    backgroundColor: "transparent"
    textColor: "{colors.ritual-ink}"
    rounded: "{rounded.square}"
    height: "3rem"
---

# Design System: TITUN

## Overview

**Creative North Star: “The Quiet Ritual”**

TITUN’s visual world makes the product legible before it becomes expressive. Clean retail structure, editorial serif type and real product photography create composure; restrained gold and walnut accents bring warmth without turning the store ornamental.

The system is calm, product-first and intentionally flat. Packaging appears immediately, the collection follows without delay, and hospitality photography provides context after the buying path is clear.

**Key Characteristics:**

- Compact product-first compositions with a clear reading order
- Warm white grounds, dark ink and sparing metallic-gold accents
- Real product imagery at useful scale
- Square-edged controls and fine divider lines
- Mobile layouts that remain calm, legible and easy to shop

## Colors

The palette moves between porcelain-white fields and deep warm neutrals, with gold used as a rare signal rather than a general fill.

### Primary

- **Ritual Ink:** The main text, primary action and footer color.

### Secondary

- **Walnut:** Hospitality sections, hover emphasis and warm brand depth.
- **Restrained Gold:** Selection, value and fine emphasis only.

### Neutral

- **Porcelain:** The principal page ground.
- **Pure White:** Product stages and high-clarity surfaces.
- **Soft Linen:** Quiet section contrast.
- **Warm Sand:** Subtle dividers and secondary neutral areas.

**The Gold Restraint Rule.** Gold should identify a meaningful detail—selection, value or ritual—not coat whole interfaces.

## Typography

**Display Font:** Newsreader (with Georgia and serif fallbacks)

**Body Font:** Manrope (with Arial and sans-serif fallbacks)

**Character:** Newsreader gives the brand a literary hospitality voice; Manrope keeps commerce, forms and operational information direct.

### Hierarchy

- **Display** (400, fluid up to 6rem, 0.82–0.9 line-height): Hero statements and major section ideas.
- **Headline** (400, 3–3.75rem, approximately 0.92 line-height): Section and campaign headings.
- **Title** (400, 1.5–2rem, compact line-height): Product names, cards and dialog titles.
- **Body** (400, 1rem, 1.625 line-height): Explanations and product copy, usually constrained to a readable measure.
- **Label** (700, 0.6875–0.75rem, 0.07–0.09em tracking): Navigation and short utility labels only.

**The Two-Voice Rule.** Use Newsreader for expressive hierarchy and Manrope for every action, datum and explanation.

## Layout

The storefront uses a compact split product hero followed immediately by the shoppable collection, inside containers capped around 1440px. Desktop compositions commonly divide into two unequal columns; product sets use three columns and become horizontal scroll tracks on phones. Horizontal padding begins at 1.25rem on phones and rises to 2rem on tablets. Major section spacing is approximately 4–6rem and compresses naturally on mobile.

## Elevation & Depth

The system is flat by default. Borders, tonal fields, photography and spatial separation create depth; shadows are reserved for floating utilities, dialogs and consent surfaces.

### Shadow Vocabulary

- **Floating utility** (`0 10px 32px rgba(24,21,17,.24)`): WhatsApp and similarly detached actions.
- **Modal ambient** (`0 18px 60px rgba(24,21,17,.18)`): Consent and welcome panels.

**The Flat-by-Default Rule.** A surface earns a shadow only when it genuinely floats above the shopping journey.

## Shapes

Commerce surfaces, cards, buttons and fields use square corners and fine borders. Fully rounded geometry belongs only to compact floating utility buttons. Product images use simple rectangular crops; no decorative masks compete with packaging silhouettes.

## Components

### Buttons

- **Shape:** Square and architectural, with a minimum 44px touch target.
- **Primary:** Ritual Ink with white text, compact bold Manrope and generous horizontal padding.
- **Hover / Focus:** Hover shifts toward Walnut; keyboard focus uses a 2px visible outline with a 3px offset.
- **Secondary:** White or transparent with a one-pixel Ritual Ink border.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** Pure White, Porcelain or Soft Linen according to section role.
- **Shadow Strategy:** None at rest.
- **Border:** Fine, low-opacity Ritual Ink dividers.
- **Internal Padding:** Usually 1–2rem; image-led product cards keep copy compact beneath the image.

### Inputs / Fields

- **Style:** Transparent or white fields with an underline or fine border and square corners.
- **Focus:** Border strengthens to Ritual Ink and the global focus outline remains visible.
- **Error / Disabled:** Text states stay explicit; disabled controls reduce opacity without removing their label.

### Navigation

Desktop navigation uses a utility row around a centered TITUN wordmark and a second, compact product-navigation row. Mobile preserves the wordmark and prioritizes search and basket actions in 44px targets.

### Pack Selector

Pack tiers are equal, bordered panels. Selection reverses to Ritual Ink with white text; the 100-piece value note uses restrained gold and remains subordinate to price and quantity.

## Do's and Don'ts

### Do:

- **Do** let supplied product and hospitality photography carry the visual weight.
- **Do** preserve generous pauses between the ritual story, product proof and purchase action.
- **Do** keep interactive targets at least 44px and retain visible keyboard focus.
- **Do** show prices, pack sizes and stock states as operational truth, never as decorative copy.

### Don't:

- **Don't** crowd the page with badges, promotional color or competing calls to action.
- **Don't** use gradients or simulated luxury effects in place of real photography and restrained materials.
- **Don't** invent claims, testimonials, contact details or product specifications.
- **Don't** introduce rounded cards into the square editorial system.
