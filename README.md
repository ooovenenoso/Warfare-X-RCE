# Warfare X Rust Console Edition WebApp

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

<img width="1513" height="907" alt="image" src="https://github.com/user-attachments/assets/5fa5b1bb-a7a8-4098-a590-1d2e0997f0cc" />

## Overview

Warfare X RCE (Rust Console Edition) WebApp is a full-stack platform for the Warfare X community on Rust Console Edition. Built with Next.js and Supabase, it lets players purchase credits and in-game kits, while providing administrators with real-time sales analytics and package management tools.

### Features

- Discord OAuth via Supabase for secure authentication
- Credit store with dynamic packages, VIP perks, and server-specific items
- Stripe integration for payments and optional Discord webhook notifications
- Admin dashboard to manage credit packages and review recent transactions
- SQL scripts for bootstrapping a Supabase Postgres database

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [Radix UI](https://www.radix-ui.com) and community libraries
- **State & Forms:** React Hooks, React Hook Form, and Zod
- **Backend & Auth:** [Supabase](https://supabase.com) with Discord OAuth
- **Payments:** [Stripe](https://stripe.com)

## Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [pnpm](https://pnpm.io) package manager

### Installation
```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file with the following keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ADMIN_DISCORD_IDS=
STRIPE_SECRET_KEY=
DISCORD_WEBHOOK_URL=
```

### Database Setup

The `scripts/` directory contains SQL files to create and seed the Supabase Postgres database:

```bash
psql -f scripts/01-schema.sql
psql -f scripts/02-seed.sql
```

### Development
Start the development server with hot reload:
```bash
pnpm dev
```

### Linting
Run type and style checks:
```bash
pnpm lint
```

### Production Build
Generate an optimized production build:
```bash
pnpm build
```

## Project Structure

- `app/` – application routes and pages
- `components/` – reusable UI components
- `lib/`, `hooks/`, `types/` – utility modules and TypeScript types
- `public/` – static assets
- `styles/` – global styles and Tailwind configuration
- `scripts/` – SQL schema and seed files for Supabase

## Deployment

The app is ready to deploy to [Vercel](https://vercel.com) or any platform supporting Next.js. Adjust environment variables and run:
```bash
pnpm build && pnpm start
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to enhance Warfare X Rust Console Edition WebApp.

