---
version: 1
slug: "src-app-shipping-page-tsx"
primary_target: "src/app/shipping/page.tsx"
related_targets:
  [
    "src/components/admin/delivery-content-manager.tsx",
    "src/lib/delivery-content.ts",
    "src/app/api/admin/content/delivery/route.ts",
    "src/app/admin/content/page.tsx",
  ]
---

# Delivery guide brief

## Scope and mode

Read. Present TITUN’s Nigeria, UK and international delivery estimates as a premium, scan-friendly guide, with the public copy and destination lists editable from the existing admin content workspace.

## Audience, job and action

Customers should be able to find their destination, understand the estimated working-day range and note the courier or timing caveat without reading a policy document. Content administrators should be able to revise headings, supporting copy, destinations and timeframes without a code change.

## Content and constraints

Use only the delivery destinations, ranges, courier information and disclaimer supplied by TITUN. Treat each timing as an estimate rather than a guarantee. Keep Nigeria and international destinations independently repeatable, require at least one row in each section and preserve the established admin permission, audit and publishing behavior.

## Direction contract

**THESIS:** Delivery information should read like a composed hospitality guide, not a dense policy page or a generic rate table.

**OWN-WORLD:** Preserve The Quiet Ritual in Read mode: white and porcelain grounds, Ritual Ink, the existing cream note field, Newsreader headings, Manrope operational copy, fine rules, square fields and flat surfaces. Do not introduce a new palette, radius, shadow or decorative motif.

**STORY:** A concise introduction leads directly to paired Nigeria and UK/international destination ledgers. Each destination resolves to a clear working-day estimate; the Nigeria courier note stays with its region, and a shared cream note closes the guide with the delivery caveat.

**FIRST VIEWPORT:** The existing content-page masthead establishes “Delivery” and its short introduction. The guide follows as two equal columns on large screens, separated by a fine vertical rule; smaller screens stack the sections with a horizontal rule and preserve destination-to-timeframe scanning.

**FORM:** Ordinary extension of the established TITUN editorial system, code-led. The signature composition is the paired destination ledger; the signature operational pattern is repeatable, validated CMS destination rows for Nigeria and international delivery.

**FINISH:** Ship only when the public guide remains legible at desktop and mobile widths, headings and rows preserve their semantic relationships, editable content survives schema validation, and the admin publish path retains permission checks, audit logging and shipping-page revalidation.

## Finish record

**STATUS:** Ship. The finish reviewer disposition is shippable.

**EVIDENCE:** Source review confirmed the shared `ContentPage` shell, responsive two-column-to-stack behavior, semantic description lists and labelled sections on the public page; repeatable destination controls, dirty-state messaging and explicit publish/discard actions in admin; and validated persistence, authorization, audit logging and `/shipping` revalidation in the content route. `npm test -- --run src/lib/delivery-content.test.ts` passed all three delivery-content tests, `npm run typecheck` passed, and `git diff --check` reported no whitespace errors.

**SYSTEM IMPACT:** No design-system change. The page composes existing Quiet Ritual tokens and documented patterns; the destination ledger, cream delivery note and repeatable delivery editor are local to this surface. `DESIGN.md` and `.impeccable/design.json` remain unchanged.
