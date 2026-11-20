# Agent Rules — Sanubari

## Mandatory if asking push to github

1. When user asking to push into the github you must check and verified the github repo on the remove backend using ssh credential provided in .server_ssh_access, the remote repository inside domains/sanubariroastery.co.id/public_html, wait 3 minutes before checking so the hostinger github can pull the changes
2. Push this command to the remote backend : git push origin main
3. Wait 3 minutes before checking so the hostinger github can pull the changes
4. check the github head againts the local head
5. Run WebP optimization and clear cache on the remote backend:
   - `php artisan images:generate-webp`
   - `php artisan optimize:clear`
6. use browser tool to navigate to https://sanubariroastery.co.id to check the produuction build frontend

## MANDATORY before writing any code

Every agent and sub-agent working in this repository MUST first read:

1. [`docs/ORIGINAL_PROMPT.md`](docs/ORIGINAL_PROMPT.md) — the user's original request (source of truth).
2. [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — the agreed plan (if present).
3. [`docs/research/`](docs/research/) — evidence about the reference site (if present).

If a task conflicts with these documents, stop and ask the user.

## Scope guardrails

- Public / visitor-facing pages only. Do NOT build an admin backend; the user
  will decide the administration approach later.
- Use dummy/seeded data modelled on https://sanubariroastery.id/ content.
- https://nircoffee.id/ is a structural/UX reference only — never copy its
  brand, text or images.

## Stack

Laravel 12 · Inertia v3 · React 19 · TypeScript · Tailwind v4 · Pest · SQLite.
Local URL: http://sanubari.test (Laravel Herd).
