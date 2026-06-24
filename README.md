# onboarding-mobile

Clean, **mock-data** Angular 21 frontend for the EXIM SuperApp **"สมัครรับข่าวสารผ่าน LINE"** (LINE connectivity — corporate/juristic subscribe) onboarding flow. Built to mirror `Frontend_HostAppSuperApp` conventions for easy future migration, using the `@exim/ui-kit` design system. No real backend — every screen is playable via mock triggers, and the service layer is shaped so swapping to a real API is a one-flag change.

## Flow

`/` Landing → `/register` (เลขนิติบุคคล 13 หลัก + Email) → `/otp` (8-digit) → `/terms` (PDPA, scroll-gated) → `/success`

All errors are inline field errors or bottom-sheet modals (no standalone error page). A functional `flowGuard` redirects to `/` on refresh/deep-link when prior-step state is missing.

## Tech

- Angular ~21.1 (standalone, signals, `inject()`, lazy `loadComponent`)
- `@exim/ui-kit` (Azure Artifacts) + `ng-zorro-antd`, SCSS + design tokens
- State: signal `.state.ts` per page (no NgRx) · Test: vitest/jsdom
- Zone-based change detection (`provideZoneChangeDetection`) for ng-zorro compatibility

## Local setup

```bash
# 1) Authenticate to the @exim private registry (one-time; opens browser / needs Azure DevOps access)
npx vsts-npm-auth -config .npmrc          # Windows
#   (mac/linux: add a base64 PAT line to ~/.npmrc for pkgs.dev.azure.com/eximth)

# 2) Install + run
npm install
npm start                                  # http://localhost:4200
```

> If you cannot authenticate to Azure Artifacts but have a machine with `@exim/ui-kit` already installed (e.g. `sa-onboarding-demo`), you can vendor it for local builds: install the public deps with `@exim/ui-kit` temporarily removed from `package.json`, then copy `node_modules/@exim/ui-kit` (+ `quill`, `ngx-quill`) from that machine into this repo's `node_modules`. `node_modules` is gitignored, so this is dev-only.

## Mock triggers (play every screen)

`useMock: true` (default, in `src/environments/environments.ts`). The dev-only **mock-trigger hint** panel in the app also lists these. Source of truth: `src/app/services/onboarding-service/subscription/subscription.mock.ts`.

| To reach | Enter |
|---|---|
| **Happy path** → OTP | เลขนิติบุคคล `0105563000012` + Email `test@superapp.com` |
| Email not in system (inline) | Email `notfound@example.com` |
| เลขนิติบุคคล not in system (inline) | id `1111111111111` |
| ไม่พบข้อมูล (modal) | id `0000000000000` |
| Email not linked to corporate (modal) | Email `notlinked@example.com` |
| Email format error (inline) | any invalid email |
| id-length error (inline) | fewer than 13 digits |
| **OTP correct** → Terms | `12345678` |
| OTP incorrect (inline, counts down) | any other 8 digits |
| OTP expired (inline) | `00000000` |
| OTP exceeded (modal → back to register) | wrong OTP 3 times |

OTP config (cooldown 30s, expiry 5 min, max attempts 3) is in `environment.otpConfig`.

## Responsive

- **Mobile (<768px):** full-bleed, 375px design from Figma.
- **Desktop (≥768px):** centered ~412px phone-frame on an EXIM-blue backdrop.

Test in DevTools device mode (375px) and a normal desktop viewport.

## Build

```bash
npm run build         # production -> dist/onboarding-mobile/browser
npm run build:sit     # / build:uat / build:prod   (env via angular.json fileReplacements)
npm test              # vitest, all specs
```

## Deploy — Cloudflare Pages (GitHub Actions + Wrangler)

Push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): install (with @exim auth) → `npm run build` → `wrangler pages deploy dist/onboarding-mobile/browser` to project `onboarding-mobile`.

**Required GitHub repository secrets** (the workflow is RED until all three are set — this is expected, not a build failure):

```bash
gh secret set AZURE_ARTIFACTS_TOKEN  --repo Supakorn08/onboarding-mobile --body "<azure-artifacts-PAT-base64>"
gh secret set CLOUDFLARE_API_TOKEN   --repo Supakorn08/onboarding-mobile --body "<cf-token>"   # scope: Account → Cloudflare Pages → Edit
gh secret set CLOUDFLARE_ACCOUNT_ID  --repo Supakorn08/onboarding-mobile --body "<cf-account-id>"
```

No `gh`? GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**. After setting them, re-run the latest workflow (Actions tab → Re-run jobs) or push any commit.

- `AZURE_ARTIFACTS_TOKEN` — a base64-encoded Azure DevOps PAT (Packaging: Read) for `pkgs.dev.azure.com/eximth`.
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard. SPA deep-links work automatically (no `404.html` in the build).

## Migration to the shell (Frontend_HostAppSuperApp)

- `src/app/pages/{name}/*` copy directly into `apps/shell/src/app/pages/` (same standalone + `.state.ts`/`.message.ts`/`.selector.ts` convention).
- `subscription.service.ts`: drop the `useMock` mock branch, set real `servicePaths`, reuse `ApiResponse<T>` / `ApiErrorResponse` from `@exim/auth-sdk`.
- `.message.ts` Thai constants → `$localize`/ARB when entering the shell's i18n.
- Success exit (`reset()` → `/`) → close LIFF / return to host.

## Docs

- Design spec: [`docs/superpowers/specs/2026-06-23-onboarding-mobile-frontend-design.md`](docs/superpowers/specs/2026-06-23-onboarding-mobile-frontend-design.md)
- Implementation plan: [`docs/superpowers/plans/2026-06-23-onboarding-mobile.md`](docs/superpowers/plans/2026-06-23-onboarding-mobile.md)
