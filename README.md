# Warfare X RCE WebApp

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

## Overview

Warfare X RCE WebApp is a modern Next.js application designed for experimenting with remote code execution (RCE) scenarios. The project provides a flexible foundation for building security tooling, demos, or training environments.

This repository stays in sync with deployments from [v0.dev](https://v0.dev). Any changes pushed to your deployed chat on v0 will automatically appear here, and can then be redeployed to platforms like Vercel.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [Radix UI](https://www.radix-ui.com) and community libraries
- **State & Forms:** React Hooks, React Hook Form, and Zod

## Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [pnpm](https://pnpm.io) package manager

### Installation
```bash
pnpm install
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

## Deployment

The app is ready to deploy to [Vercel](https://vercel.com) or any platform supporting Next.js. Adjust environment variables and run:
```bash
pnpm build && pnpm start
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to enhance Warfare X RCE WebApp.

