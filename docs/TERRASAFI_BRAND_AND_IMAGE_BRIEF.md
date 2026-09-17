# Terrasafi T Ltd — Brand and Image Brief

## Brand foundation

Terrasafi T Ltd is a technology and business-services company founded by Denis Chamkaga. Its planned services include stationery and printing, technology solutions, network setup, graphic design, and electronics and accessories retail. Its digital platform uses the PERN stack: PostgreSQL, Express, React, and Node.js.

The product has two connected surfaces:

- Public: company profile, services, products, portfolio, quotation requests, orders, and customer support.
- Private: CRM, inventory, POS, quotations, invoices, payments, projects, printing jobs, suppliers, reports, follow-up, and staff permissions.

## Approved logo

Use the owner-supplied Terrasafi logo. Do not redraw it, replace it with a letter T, change its proportions, or combine it with the DC personal-brand logo.

Asset: `/terrasafi-logo.png`

## Working colour palette

These tokens should guide new concepts and be visually matched against the original logo before production sign-off:

- Terrasafi Orange: `#FF7A00`
- Terrasafi Blue: `#0789E8`
- Deep Navy: `#072D46`
- Midnight Surface: `#071827`
- Clean White: `#F8FAFC`
- Cool Grey: `#94A3B8`
- Success Green: `#16A34A`

Use navy and white for structure and readability. Use orange for primary actions and highlights. Use blue for technology, navigation, links, and data states. Keep green for verified or successful states.

## Image-generation and design brief

Create a coherent visual identity and reusable website imagery for Terrasafi T Ltd using the supplied logo as the source of the brand language. Extract the orange and blue accents from the logo and combine them with deep navy, clean white, and restrained cool-grey surfaces. Keep the original logo proportions and colours intact.

Present Terrasafi as a professional Tanzanian company offering stationery and printing, technology solutions, network setup, graphic design, and electronics and accessories retail. Show the public customer experience and the private business-management platform as parts of one connected company.

For website hero and project-cover images, use realistic modern workspaces containing printing equipment, stationery, networking hardware, electronics, customer-service activity, and clean software dashboards. Use authentic East African business context where people appear. Avoid generic futuristic cities, robots, excessive neon, fake partner logos, watermarks, illegible interface text, and invented financial claims.

Deliver:

- Project cover: 1600 × 900 px, 16:9, WebP.
- Website hero: 1920 × 1080 px, 16:9, WebP.
- Service covers: 1200 × 800 px, 3:2, WebP.
- Social cover: 1200 × 630 px, PNG or WebP.
- Square brand tile: 1080 × 1080 px, PNG or WebP.

Keep important subjects inside the central safe area so cards can crop responsively. Supply clean versions without embedded headings whenever the website will render the text itself.

## Repository asset locations

- Logo: `frontend/public/terrasafi-logo.png`
- Project cover: `frontend/public/images/projects/terrasafi_platform.webp`
- Future service imagery: `frontend/public/images/terrasafi/`

## Developer implementation note

Create reusable Terrasafi design tokens rather than scattering colour values through components. Public and private interfaces must share the same logo, typography, spacing, colour roles, and accessible contrast. Keep business rules in services and APIs; visual components should consume structured data from the PERN application.
