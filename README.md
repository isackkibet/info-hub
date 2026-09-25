# KAI Nuvari — Unified Environmental Info Hub

A full-stack environmental data platform built with **Next.js 16**, **Prisma**, **NextAuth v5**, and **Tailwind CSS v4**. It hosts two purpose-built hubs that share a single identity layer and a blockchain anchoring pipeline on Avalanche.

---

## What it does

| Hub | Purpose |
|-----|---------|
| **SIHU** (Sango Information Hub) | Field reporters submit environmental and human-rights reports across the Lake Victoria Basin. Community validators review and verify each one. |
| **CFA** (Community Forest Association Hub) | Conservation record-keeping for forest associations — sites, nurseries, species registry, and a structured verification pipeline. |

Every verified record from both hubs is batched into a daily Merkle proof and anchored on the **Avalanche C-Chain** — tamper-evident, auditable, no wallets required for field users.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-based config, no `tailwind.config`) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth v5 (credentials provider, JWT strategy) |
| Forms | React Hook Form + Zod validation |
| Blockchain | Avalanche C-Chain (anchor layer, transparent to field users) |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Sign-in page + server action
│   │   └── register/       # Registration page + server action
│   ├── api/
│   │   └── auth/[...nextauth]/   # NextAuth route handler
│   ├── cfa/
│   │   └── dashboard/      # CFA Conservation Hub dashboard
│   ├── dashboard/          # User dashboard (hub selector)
│   ├── sihu/
│   │   ├── my-reports/     # Reporter's own submission history
│   │   ├── submit/         # Field report submission form
│   │   └── validator/      # Validator queue (approve / reject)
│   ├── globals.css         # Tailwind v4 theme + design tokens
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Public landing page
│
├── components/
│   ├── app-nav.tsx         # Authenticated app navigation
│   ├── hero.tsx            # Landing hero section
│   ├── hubs-section.tsx    # Two-hub overview section
│   ├── principles.tsx      # How it works section
│   ├── site-footer.tsx     # Public site footer
│   ├── site-header.tsx     # Public site header
│   └── trust-layer.tsx     # Blockchain anchor explainer section
│
├── lib/
│   ├── auth-actions.ts     # signOut server action
│   ├── cfa-mock.ts         # CFA sample data (until live DB)
│   ├── prisma.ts           # Prisma client singleton
│   ├── sihu-schema.ts      # Zod schema for SIHU report form
│   └── sihu.ts             # SIHU client-side store (localStorage)
│
├── auth.ts                 # NextAuth config (credentials + callbacks)
├── proxy.ts                # Next.js 16 middleware (route protection)
└── types/
    └── next-auth.d.ts      # Session type augmentation

prisma/
├── schema.prisma           # Full data model (User, SIHU, CFA, anchoring)
└── seed.ts                 # Demo user + sample membership seed

public/
├── hero-bg.jpg             # Landing hero background image
└── auth-bg.jpg             # Login / register split-screen background
```

---

## Design system

The color palette is defined entirely in `src/app/globals.css` as CSS custom properties consumed by Tailwind v4's `@theme inline` block. No `tailwind.config.ts` file is used.

| Token | Hex | Used for |
|-------|-----|----------|
| `forest-900` | `#14532D` | Primary brand, headings, main CTAs |
| `forest-600` | `#16A34A` | Verified badges, success states |
| `lake-600` | `#0F766E` | SIHU hub identity, teal accents |
| `sand-50` | `#F8FAF7` | Page backgrounds |
| `sand-200` | `#DDE5DF` | Borders, dividers |
| `ink-900` | `#17211B` | Body text |
| `gold-500` | `#E8A317` | Hero CTA, highlight on dark |

**Rule:** SIHU pages accent in `lake` (teal). CFA pages accent in `forest` (deep green). Never use neon, gradients for decoration, or crypto-style visuals.

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Docker)

### 1. Clone and install

```bash
git clone https://github.com/isackkibet/info-hub.git
cd info-hub
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/infohub?schema=public"
AUTH_SECRET="run: npx auth secret"
```

Generate `AUTH_SECRET`:

```bash
npx auth secret
```

### 3. Set up the database

```bash
# Run migrations
npm run db:migrate

# Seed demo user and sample data
npm run db:seed
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo credentials:** `demo@kainuvari.test` / `password123`

---

## Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

---

## Authentication

- **Strategy:** JWT (no database sessions)
- **Provider:** Credentials (email + bcrypt password)
- **Route protection:** `src/proxy.ts` (Next.js 16 middleware) blocks unauthenticated access to `/dashboard`, `/sihu/*`, and `/cfa/*`
- **Registration:** `/register` creates a `User` record. Hub membership (`SihuMembership`, `CFAMembership`) is assigned separately by an admin.

---

## Data model overview

```
User
 ├── SihuMembership   (role: STEWARD | VALIDATOR | ADMIN)
 ├── CFAMembership[]  (role: MEMBER | SITE_MANAGER | VERIFIER | ADMIN)
 └── Submission[]     (SIHU field reports)

CFA
 ├── ConservationSite[]
 │    ├── TreeInventory[]
 │    └── ConservationActivity[]
 └── CFAMembership[]

OnChainBatch         (daily Merkle proof batch, Avalanche tx)
 ├── Submission[]
 └── ConservationActivity[]
```

Full schema: [`prisma/schema.prisma`](prisma/schema.prisma)

---

## Roadmap

- [ ] Live SIHU submissions via database (currently localStorage)
- [ ] CFA offline-first field submission (PWA / service worker)
- [ ] Automated daily batch anchoring job (Avalanche C-Chain)
- [ ] Admin panel for hub membership management
- [ ] Map view for geolocated SIHU reports
- [ ] Species registry full CRUD

---

## License

Private — KAI Nuvari project.
