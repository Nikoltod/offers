# Offers

Job application tracker built with Next.js, NextAuth, Prisma, PostgreSQL, and Tailwind.

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Local setup

1. Install dependencies

```bash
npm ci
```

2. Create env file

```bash
cp .env.example .env
```

3. Run migrations

```bash
npm run prisma:migrate
```

4. Seed demo data (local/dev)

```bash
npm run seed
```

5. Start the app

```bash
npm run dev
```

Demo credentials after seed:

- email: admin@local.dev
- password: password123

## Environment variables

See [.env.example](.env.example) for all variables.

Required in production:

- DATABASE_URL
- AUTH_SECRET (minimum 16 chars)
- NEXTAUTH_URL

Optional:

- ALLOW_DEMO_AUTH (must be false in production)
- BOOTSTRAP_ADMIN_EMAIL
- BOOTSTRAP_ADMIN_PASSWORD
- ALLOW_PROD_SEED (default false)

## Seeding and bootstrap strategy

- `npm run seed`: development/demo seed. It is blocked in production unless `ALLOW_PROD_SEED=true`.
- `npm run bootstrap:admin`: one-time admin bootstrap for production when `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` are set.

Recommended production flow:

1. Deploy application code.
2. Run `npm run prisma:migrate:deploy`.
3. Run `npm run bootstrap:admin` once.
4. Remove bootstrap password from secrets after first login.

## CI/CD to Hetzner

Workflow file: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)

Pipeline behavior:

- Pull requests: install, generate Prisma client, lint, typecheck, build.
- Push to `main`: run CI, then deploy over SSH to Hetzner.

Required GitHub secrets:

- HETZNER_HOST
- HETZNER_USER
- HETZNER_SSH_KEY
- HETZNER_PORT
- HETZNER_APP_DIR
- PROD_DATABASE_URL
- PROD_AUTH_SECRET
- PROD_NEXTAUTH_URL
- PROD_ALLOW_DEMO_AUTH (set to `false`)
- BOOTSTRAP_ADMIN_EMAIL (optional)
- BOOTSTRAP_ADMIN_PASSWORD (optional)

Server deploy script used by workflow: [scripts/deploy.sh](scripts/deploy.sh)

## Manual production deploy on Hetzner

```bash
cd /path/to/offers
npm ci
npm run prisma:generate
npm run prisma:migrate:deploy
npm run build
npm run start
```

Use a process manager (`pm2` or `systemd`) and a reverse proxy (`nginx` or `caddy`) with TLS.

## Quality checks

```bash
npm run ci
```
