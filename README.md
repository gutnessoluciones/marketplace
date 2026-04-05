# Marketplace

A modern, minimal marketplace built with Next.js, Supabase, and Stripe.

## Stack

- **Frontend/Backend:** Next.js (App Router, RSC)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth
- **Payments:** Stripe Connect (Express)
- **Deploy:** Vercel

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Copy `.env.example` to `.env.local` and fill in your Supabase keys

### 3. Set up Stripe

1. Create a Stripe account and enable [Stripe Connect](https://stripe.com/connect)
2. Get your test API keys from the Stripe Dashboard
3. Add them to `.env.local`
4. For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login / Register pages
│   ├── (dashboard)/        # Authenticated area
│   ├── products/           # Public product catalog
│   └── api/                # Route Handlers (REST API)
├── lib/                    # Supabase clients, Stripe, utils
├── services/               # Business logic layer
├── validations/            # Zod schemas
├── components/             # React components
└── types/                  # TypeScript types
supabase/
└── migrations/             # SQL schema
```

## Architecture Principles

- **Route Handlers are thin:** validate input → call service → return response
- **Business logic lives in services/:** reusable across routes and RSC
- **RLS on every table:** security enforced at the database level
- **Prices in cents:** avoid floating point issues (1999 = $19.99)
- **Stripe Connect (Destination Charges):** platform collects then splits automatically
