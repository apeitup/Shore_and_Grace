# Shore & Grace

Shore & Grace is organised as a pnpm monorepo so the existing public holding page can remain stable while the Medusa commerce platform and customer storefront are developed locally.

## Applications

- `apps/holding` - the existing React/Vite holding page currently deployed at `shoreandgrace.com`.
- `apps/backend` - Medusa commerce API and Admin dashboard.
- `apps/storefront` - the Next.js/React customer storefront based on Medusa's DTC starter.
- `server` - the existing private launch-signup service.

## Prerequisites

- Node.js 22.23.4 or newer (Node 24 LTS is supported)
- pnpm 11
- Docker Desktop with Docker Compose

## Install dependencies

```bash
pnpm install
```

## Start local infrastructure

```bash
pnpm infra:up
```

This starts PostgreSQL on port `5433` and Redis on port `6379`. Port `5433` avoids conflicting with RosterCore's local PostgreSQL service on port `5432`. Copy each application's environment template before starting it:

```bash
cp apps/backend/.env.template apps/backend/.env
cp apps/storefront/.env.template apps/storefront/.env.local
cp apps/holding/.env.example apps/holding/.env.local
```

The storefront requires the publishable API key created by the Medusa seed process. Add it to `apps/storefront/.env.local` as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Development commands

```bash
pnpm backend:dev
pnpm storefront:dev
pnpm holding:dev
```

- Holding page: `http://localhost:5173`
- Storefront: `http://localhost:8000`
- Medusa API and Admin: `http://localhost:9000` and `http://localhost:9000/app`

Use `pnpm dev` to start all three applications together after the database has been migrated and the storefront API key has been configured.

## Verification

```bash
pnpm lint
pnpm build
python3 -m unittest discover -s server -p 'test_*.py'
```

## Current production deployment

The existing deployment script continues to build and publish only `apps/holding`. The Medusa backend and storefront are local development applications until their production architecture, secrets, backups and launch checks are complete.
