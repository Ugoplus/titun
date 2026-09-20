---
version: 1
slug: "src-app-checkout-page-tsx"
primary_target: "src/app/checkout/page.tsx"
related_targets:
  [
    "src/app/api/cart/quote/route.ts",
    "src/components/admin/delivery-content-manager.tsx",
    "src/app/api/admin/content/delivery/route.ts",
    "src/lib/delivery-content.ts",
    "src/lib/orders/pricing.ts",
  ]
---

# Checkout delivery brief

## Scope and mode

Operate. Extend checkout so physical-product customers choose a priced delivery destination before payment, while event-ticket customers continue through a no-delivery path. Keep destinations, prices and timeframes editable in the existing admin content workspace.

## Audience, job and action

Customers should compare destination, estimate and fee in one scan, understand the amount added to their order and pay only after making a valid delivery choice. Administrators should be able to maintain the available destinations and their operational values without a code change.

## Content and constraints

Group delivery options into Nigeria and UK/international sections. Every option has a stable unique identifier, destination name, estimated timeframe and positive price; each group retains at least one option. Treat timeframes as estimates, preserve the group note and shared disclaimer, and verify the selected option and fee on the server rather than trusting checkout state. Placeholder prices are live charges and must remain visibly identified as unconfirmed in admin until TITUN replaces them.

## Direction contract

**THESIS:** Delivery selection is part of price comprehension, not a policy detour. The customer should see destination, timing, fee and resulting total before committing to payment.

**OWN-WORLD:** Preserve The Quiet Ritual in Operate mode: Newsreader introduces the delivery decision; Manrope carries every destination, estimate, price and status. Fine rules and square controls organize the options. Restrained gold marks selection, with walnut strengthening selected borders where the control needs more definition; neither color becomes a decorative fill.

**STORY:** Checkout confirms the basket, collects contact details, presents grouped delivery choices, recommends a payment method and then opens secure payment. Choosing a destination immediately resolves the delivery fee, updates the total in the order summary and updates the payment action. Until then, the summary and action explicitly ask for a choice. Digital event tickets bypass physical delivery and state that confirmation arrives by email.

**FIRST VIEWPORT:** The existing checkout heading and contact fields lead the primary column. On desktop, the order summary sits at its natural content height and remains sticky near the top rather than stretching to match the form. Mobile preserves a single reading order, with each destination row keeping the radio, destination and estimate, and fee together.

**FORM:** Ordinary extension of the established TITUN checkout, code-led. The signature interaction is a grouped, scan-friendly destination ledger whose selected row uses a restrained gold tint and whose fee is echoed immediately in the sticky summary and total.

**FINISH:** Ship only when delivery selection is keyboard-operable, destination rows expose fee and estimate together, payment cannot proceed without the required choice, displayed and server totals include the same fee, ticket-only baskets avoid physical delivery, and the admin editor warns plainly that placeholder prices are live checkout charges.

## Finish record

**STATUS:** Ship. The finish review approved the checkout delivery implementation.

**EVIDENCE:** The implemented checkout groups destinations under administrator-authored headings, keeps fee and timeframe visible in each radio row, applies restrained gold and walnut selection cues, updates delivery and total values in the content-height sticky desktop summary, and blocks payment until a required delivery option is selected. The admin editor exposes destination, timeframe and NGN price together and places an explicit live-placeholder warning before the editable groups. Server-backed quoting and order pricing validate the option and fee rather than accepting client totals as authoritative.

**SYSTEM IMPACT:** No design-system change. The delivery chooser composes the existing Quiet Ritual palette, typography, square controls, fine rules and gold-selection doctrine. Its grouped delivery rows, live fee calculation, content-height summary and placeholder-price warning are checkout and admin workflow decisions, so `DESIGN.md` and `.impeccable/design.json` remain unchanged.
