# Gijayi Premium Store Upgrade Roadmap

This roadmap converts the current store into a premium jewellery experience, executed in phases.

## Guiding Rules

- All business content should be editable from the admin panel (hero content, trust badges, policies, collections highlights, footer blocks).
- Do not ship visual-only upgrades without matching trust + conversion improvements.
- Build mobile-first; desktop enhancements should not hurt mobile UX.

## Phase 1 (Now): Account Foundation

- User identity visible in top-right navbar after login.
- Customer account page (`/profile`) with:
  - Basic profile edit (name, phone)
  - Default shipping address edit
  - Personal order list
  - Direct links to order tracking
- Checkout pre-fills shipping from saved profile/address.
- Security cleanup of accidental credential comments in source files.

## Phase 2: Luxury UI Baseline

- Hero redesign with premium imagery + brand message + primary CTA.
- Typography system hardening (serif heading + clean body with consistent spacing scale).
- Product card enhancements (hover image swap, quick view trigger, ratings, wishlist prominence).
- Sticky mobile add-to-cart behavior and improved touch targets.

## Phase 3: Conversion + Trust Layer

- Product detail enrichment (material/size/weight, care, return, delivery details).
- Trust band: authenticity, shipping, returns, secure checkout.
- Social proof blocks and FAQ snippets on PDP.
- Footer expansion with brand story, social links, and policy navigation.

## Phase 4: Performance + SEO

- Image strategy pass (`next/image`, proper responsive sizes, lazy loading hygiene).
- Metadata hardening for product/category pages.
- Open Graph + Twitter metadata completion.
- Structured data (Product, Breadcrumb, Organization).

## Phase 5: Admin CMS Expansion

- Admin sections for storefront settings:
  - Hero slides
  - Announcement bar
  - Trust badges
  - Footer content and policy highlights
- Role-aware validation and audit-friendly update timestamps.

## Phase 6: Integrations + Scale

- Payment gateway integration (Razorpay/Stripe).
- Shipping integration (Shiprocket).
- Notification pipeline (email/SMS hooks).
- Data indexing and reporting extensions.

## Delivery Approach

- Ship each phase in small testable PR-sized chunks.
- Validate via `npm run lint` and `npm run build` before phase completion.
- Keep data migrations backward-compatible.
