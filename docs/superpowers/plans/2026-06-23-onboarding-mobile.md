# onboarding-mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Each page also uses the `super-front-end` skill conventions.

**Goal:** Build a clean, mock-data Angular 21 standalone web app for the EXIM SuperApp "LINE connectivity — corporate subscribe" onboarding flow, mirroring HostApp/RemoteAppFX conventions, using `@exim/ui-kit`, responsive (centered phone-frame desktop + 375px mobile), deployable to Cloudflare Pages.

**Architecture:** Angular CLI standalone components + signals + `inject()` + lazy `loadComponent`. Pages under `src/app/pages/{name}/` each with `.ts/.html/.scss/.state.ts/.message.ts/.selector.ts/.spec.ts`. All business taxonomy lives in `subscription.mock.ts`; pages/state only render outcomes. Flow state in a root signal service + functional `flowGuard`. No auth/MSAL/SSR/i18n.

**Tech Stack:** Angular ~21.1, ng-zorro-antd ~21.1, `@exim/ui-kit` ^1.6.10 (Azure Artifacts), SCSS + design tokens, RxJS, Karma/Jasmine.

**Spec:** `docs/superpowers/specs/2026-06-23-onboarding-mobile-frontend-design.md` (read it — it has exact Thai copy, Figma node IDs, state tables, and the verified flow order).

---

## Environment constraints (read before starting)

1. **`@exim/ui-kit` cannot `npm install` here** — it's on private Azure Artifacts and no auth token is configured (`npm view` hangs). The shipping `package.json` keeps `@exim/ui-kit: ^1.6.10` + `.npmrc` (CI installs it via `AZURE_ARTIFACTS_TOKEN` secret). For **local build verification**, vendor the already-installed copy from `sa-onboarding-demo` (see Task 2). `node_modules` is gitignored, so the vendored copy is never committed.
2. **Version drift:** vendored copy is `1.5.2`; APIs were verified against source `1.6.10`. If a local build errors on an `ex-*` input name, suspect version drift before assuming the code is wrong — check the vendored component's `.d.ts` in `node_modules/@exim/ui-kit/types`.
3. **`gh` CLI not installed; no Cloudflare/Azure tokens on this machine.** CI (`deploy.yml`) will be **red on every push until the user sets 3 GitHub secrets** (`AZURE_ARTIFACTS_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`). This is expected, not a break — state it in the summary.
4. **Repo already exists** with `.git`, `README.md`, `docs/` on branch `main`. Scaffold without clobbering these (Task 1).
5. **Commit + push to `main` after each task** (greenfield repo, CI deploys from main).
6. **Test runner = vitest + jsdom** (Angular 21 scaffold uses `@angular/build:unit-test` → vitest, NOT Karma/Chrome). Run `npx ng test --watch=false` (runs all specs; fast; no browser). Specs use jasmine-style `describe/it/expect` globals (vitest-compatible). No karma/jasmine deps. Verified working (1 spec passing).

### Implementation adaptations (applied during foundation execution — supersede earlier task text)

- **Angular 21 is zoneless by default; ng-zorro needs Zone** → added `zone.js` dep + `import 'zone.js'` in `main.ts` + `provideZoneChangeDetection({ eventCoalescing: true })` in `app.config.ts` (mirrors HostApp).
- **All `@angular/*` pinned `^21.1.0`** (not `~`) to avoid compiler/compiler-cli peer conflict (resolves to 21.2.x uniformly). `ng-zorro-antd ^21.1.0`, `@angular/cdk ^21.1.3`.
- **Test stack = vitest/jsdom** (devDeps `vitest`, `jsdom`); dropped karma/jasmine from the plan's package.json.
- **`ng build` default configuration = production** (scaffold sets `defaultConfiguration: production`); output `dist/onboarding-mobile/browser`. Production budgets raised (initial 3mb/6mb) for ng-zorro + tokens CSS.
- **Foundation (Tasks 1–3) COMPLETE & verified** (build ✅, vitest ✅). Subagents start at Task 4. `app.routes.ts` exports `appRoutes` (empty until T8); `app.config.ts` already wired.
7. **Pinned `@exim/ui-kit` APIs (from vendored `types/exim-ui-kit.d.ts`, v1.5.2 — re-confirm if 1.6.10 differs):**
   - `ex-input-field`: `ControlValueAccessor` (so `[(ngModel)]` works) + `valueChange: output<string>` + `value: WritableSignal<string>`; inputs `label`, `placeholder`, `helperText`, `error: boolean`, `size: 'small'|'large'|'medium'`, `leftIcon`/`rightIcon`, `maxlength`. (No separate error-text input — set `helperText` + `error=true` for red.)
   - `ex-modal`: `isOpen: boolean` (NOT `open`), `leftButton`/`rightButton: ModalButton`, `closeOnBackdrop`, `closeOnEscape`, `width`, `position: ModalPosition`, `(closed)` output; modal body via **`<ng-content>`** (no heading/body inputs).
   - `ex-input-otp`: `length: number` (default 4 → set 8), `inputType: 'text'|'numeric'|'alphanumeric'` (set 'numeric'), `(otpComplete): output<string>`, supports `ngModel`.
   - `ex-icon`: `name` (inline-SVG registry; `chevron-left`, `check` confirmed). `ex-button`, `ex-checkbox` (CVA, `size`), `ex-alert`, `ex-toast`, `ex-spinning`, `ex-title` per spec §4.

---

## File Structure (created across tasks)

```
onboarding-mobile/
├── .npmrc                                    # T1
├── .gitignore                                # T1 (node_modules, dist, .angular)
├── .github/workflows/deploy.yml              # T16
├── angular.json                              # T1 (+ env configs T3)
├── package.json                              # T1
├── tsconfig.json / tsconfig.app.json         # T1
├── README.md                                 # T16 (replace stub)
├── public/favicon.ico                        # T1
└── src/
    ├── main.ts                               # T1
    ├── index.html                            # T3 (fonts)
    ├── styles.scss                           # T3
    ├── environments/{environments,environments.sit,environments.uat,environments.prod}.ts  # T3
    └── app/
        ├── app.ts / app.config.ts / app.routes.ts / app.routes.const.ts / app.icons.ts     # T3,T8
        ├── shared/
        │   ├── models/api-response.model.ts          # T4
        │   └── utils/validators.ts                   # T4
        ├── services/onboarding-service/subscription/
        │   ├── subscription.model.ts                 # T5
        │   ├── subscription.mock.ts                  # T6
        │   └── subscription.service.ts               # T6
        ├── state/onboarding-flow.state.ts            # T7
        ├── guards/flow.guard.ts                      # T8
        ├── layouts/onboarding-layout/                # T9
        ├── components/
        │   ├── top-bar/                              # T9
        │   ├── brand-backdrop/                       # T9
        │   ├── result-modal/                         # T10
        │   └── mock-trigger-hint/                    # T10
        └── pages/{landing,register,otp,terms,success}/   # T11-T15
```

---

## Task 1: Scaffold Angular 21 CLI app into existing repo

**Files:** Create `package.json`, `angular.json`, `tsconfig.json`, `tsconfig.app.json`, `src/main.ts`, `.npmrc`, `.gitignore`, `public/`

- [ ] **Step 1: Scaffold in a temp dir (avoid clobbering .git/README/docs)**

```bash
cd /c/Users/SUPAKO~1/AppData/Local/Temp/claude/c--Source-Private-Atlas-docs/c14b39ba-61fa-41c9-979f-77cf00081e27/scratchpad
rm -rf ng-scaffold && npx --yes @angular/cli@~21.1.0 ng new onboarding-mobile \
  --directory ng-scaffold --style=scss --ssr=false --routing=true \
  --skip-git --skip-install --package-manager=npm
```
Expected: generates `ng-scaffold/` with `src/`, `angular.json`, `package.json`, `tsconfig*.json`.

- [ ] **Step 2: Copy scaffold into repo (preserve .git, README.md, docs/)**

```bash
SRC=.../scratchpad/ng-scaffold
DST=/c/Source/Private/onboarding-mobile
cp -r "$SRC/src" "$DST/" && cp "$SRC/angular.json" "$SRC/package.json" "$SRC/tsconfig.json" "$SRC/tsconfig.app.json" "$DST/"
cp -r "$SRC/public" "$DST/" 2>/dev/null || true
```

- [ ] **Step 3: Write `.npmrc`**

```
@exim:registry=https://pkgs.dev.azure.com/eximth/_packaging/eximth/npm/registry/
always-auth=true
registry=https://registry.npmjs.org/
```

- [ ] **Step 4: Set `package.json` dependencies** (replace deps/devDeps + scripts)

```jsonc
{
  "name": "onboarding-mobile",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build --configuration=production",
    "build:dev": "ng build --configuration=development",
    "build:sit": "ng build --configuration=sit",
    "build:uat": "ng build --configuration=uat",
    "build:prod": "ng build --configuration=production",
    "test": "ng test"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "~21.1.0",
    "@angular/cdk": "^21.1.3",
    "@angular/common": "~21.1.0",
    "@angular/compiler": "~21.1.0",
    "@angular/core": "~21.1.0",
    "@angular/forms": "~21.1.0",
    "@angular/platform-browser": "~21.1.0",
    "@angular/router": "~21.1.0",
    "@ant-design/icons-angular": "^21.0.0",
    "@exim/ui-kit": "^1.6.10",
    "ng-zorro-antd": "~21.1.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "^0.16.0"
  },
  "devDependencies": {
    "@angular/build": "~21.1.0",
    "@angular/cli": "~21.1.0",
    "@angular/compiler-cli": "~21.1.0",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.6.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.9.2"
  }
}
```
> Keep whichever builder the scaffold chose (`@angular/build:application`). Align versions with the scaffold's if it generated newer 21.1.x patches.

- [ ] **Step 5: Ensure `.gitignore`** contains `node_modules`, `dist`, `.angular`, `*.log`.

- [ ] **Step 6: Commit + push**

```bash
cd /c/Source/Private/onboarding-mobile
git add -A && git commit -m "chore: scaffold Angular 21 CLI app + .npmrc + deps"
git push origin main
```

---

## Task 2: Local build-verification bootstrap (dev-only, never committed)

**Goal:** Make `ng build`/`ng serve` runnable locally despite the Azure install wall, by installing public deps + vendoring the on-disk `@exim/ui-kit`.

- [ ] **Step 1: Temporarily remove the private dep so `npm install` doesn't hang**

```bash
cd /c/Source/Private/onboarding-mobile
cp package.json package.json.bak
node -e "const p=require('./package.json'); delete p.dependencies['@exim/ui-kit']; require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))"
```

- [ ] **Step 2: Install public deps**

```bash
npm install
```
Expected: completes (Angular, ng-zorro, cdk, etc. from public npm).

- [ ] **Step 3: Vendor `@exim/ui-kit` + barrel peer deps from sa-onboarding-demo**

```bash
SA=/c/Source/Private/sa-onboarding-demo/node_modules
mkdir -p node_modules/@exim
cp -r "$SA/@exim/ui-kit" node_modules/@exim/ui-kit
for p in quill ngx-quill; do [ -d "node_modules/$p" ] || cp -r "$SA/$p" "node_modules/$p"; done
```

- [ ] **Step 4: Restore the committed package.json (keep `^1.6.10` for CI)**

```bash
mv package.json.bak package.json
```

- [ ] **Step 5: Verify baseline build compiles**

```bash
npx ng build --configuration=development
```
Expected: PASS (build succeeds). If it fails ONLY on `@exim/ui-kit` CSS path, proceed — Task 3 wires styles. If it fails on an `ex-*` API, check version drift (1.5.2 vs 1.6.10).

> No commit (this task only mutates gitignored `node_modules`).

---

## Task 3: Global config — styles, fonts, environments, app bootstrap

**Files:** Modify `src/index.html`, `src/styles.scss`, `src/main.ts`, `angular.json`; Create `src/environments/*.ts`, `src/app/app.config.ts`, `src/app/app.ts`(+html/scss), `src/app/app.icons.ts`

- [ ] **Step 1: `src/index.html` — add fonts** (inside `<head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@100;200;300;400;500;600;700&family=Sarabun:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: `src/styles.scss`** (ng-zorro FIRST, then tokens — mirrors HostApp)

```scss
@import 'ng-zorro-antd/ng-zorro-antd.min.css';
@import '@exim/ui-kit/dist/css/design-tokens.css';

html, body { margin: 0; height: 100%; }
* { font-family: var(--font-families-base); }
```

- [ ] **Step 3: `src/environments/environments.ts`**

```ts
export const environment = {
  production: false,
  useMock: true,
  servicePaths: { baseDomain: '', onboarding: '' },
  otpConfig: { otpRequestCooldownSeconds: 30, otpExpiryMinutes: 5, otpMaxAttempts: 3, otpResendMax: 3 },
};
```
Create `.sit.ts`, `.uat.ts`, `.prod.ts` identical but `production: true` for prod (servicePaths still placeholder — filled when API exists).

- [ ] **Step 4: `angular.json` — add fileReplacements configs** under `architect.build.configurations`:

```jsonc
"sit":  { "fileReplacements": [{ "replace": "src/environments/environments.ts", "with": "src/environments/environments.sit.ts" }] },
"uat":  { "fileReplacements": [{ "replace": "src/environments/environments.ts", "with": "src/environments/environments.uat.ts" }] },
"production": { "fileReplacements": [{ "replace": "src/environments/environments.ts", "with": "src/environments/environments.prod.ts" }], "outputHashing": "all" }
```
Keep `development` as default. Ensure `production` config exists; serve uses `development`.

- [ ] **Step 5: `src/app/app.icons.ts`** — ng-zorro icons used (minimal):

```ts
import { LeftOutline, CheckCircleFill } from '@ant-design/icons-angular/icons';
export const icons = [LeftOutline, CheckCircleFill];
```
> **Optional/clean:** the app renders via `ex-icon` (ui-kit's own inline-SVG registry), so `nz-icon` may be unused. If the final app has no `nz-icon` usage and no ex-component needs nz icons at runtime, drop `app.icons.ts` + `provideNzIcons` + `NzIconModule` from `app.config.ts` (a "no business" win). Keep them only if a missing-icon warning appears at runtime.

- [ ] **Step 6: `src/app/app.config.ts`**

```ts
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { NzIconModule, provideNzIcons } from 'ng-zorro-antd/icon';
import { appRoutes } from './app.routes';
import { icons } from './app.icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    importProvidersFrom(NzIconModule),
    provideNzIcons(icons),
  ],
};
```

- [ ] **Step 7: `src/app/app.ts`** (root)

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet], template: '<router-outlet />' })
export class App {}
```
Update `src/main.ts`: `bootstrapApplication(App, appConfig)`.

- [ ] **Step 8: Verify build + commit**

```bash
npx ng build --configuration=development   # Expected: PASS
git add -A && git commit -m "feat: global config (styles, fonts, env, bootstrap)" && git push origin main
```

---

## Task 4: Shared models + validators (TDD)

**Files:** Create `src/app/shared/models/api-response.model.ts`, `src/app/shared/utils/validators.ts`, `src/app/shared/utils/validators.spec.ts`

- [ ] **Step 1: Write `api-response.model.ts`** (envelope verified vs `@exim/auth-sdk`)

```ts
export interface ApiResponseMeta { traceId: string; timestamp: string; path: string; }
export interface ApiResponse<T> { data?: T; meta: ApiResponseMeta; }
export interface ApiErrorResponse<E = unknown> {
  type: string; title: string; status: number; detail: string;
  instance: string; errorCode: string; traceId: string; timestamp: string; errors?: E;
}
```

- [ ] **Step 2: Write failing test `validators.spec.ts`**

```ts
import { isValidEmail, isValidJuristicId } from './validators';
describe('validators', () => {
  it('email: valid', () => expect(isValidEmail('a@b.com')).toBe(true));
  it('email: invalid', () => expect(isValidEmail('abc@gmail.c')).toBe(false));
  it('juristicId: exactly 13 digits', () => expect(isValidJuristicId('0105563000012')).toBe(true));
  it('juristicId: 11 digits invalid', () => expect(isValidJuristicId('01234567891')).toBe(false));
  it('juristicId: non-numeric invalid', () => expect(isValidJuristicId('010556300001x')).toBe(false));
  it('juristicId: all zeros passes (length-only, NO checksum)', () => expect(isValidJuristicId('0000000000000')).toBe(true));
});
```

- [ ] **Step 3: Run test → FAIL**

```bash
npx ng test --watch=false --include='**/validators.spec.ts'
```
Expected: FAIL (module not found).

- [ ] **Step 4: Implement `validators.ts`**

```ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (v: string): boolean => EMAIL_RE.test(v.trim());
export const isValidJuristicId = (v: string): boolean => /^\d{13}$/.test(v.trim());
```

- [ ] **Step 5: Run test → PASS, then commit**

```bash
npx ng test --watch=false --include='**/validators.spec.ts'   # Expected: PASS
git add -A && git commit -m "feat: shared api-response model + validators (length-only juristic id)" && git push origin main
```

---

## Task 5: Subscription domain model (DTOs + enums)

**Files:** Create `src/app/services/onboarding-service/subscription/subscription.model.ts`

- [ ] **Step 1: Write the model** (single source of contract)

```ts
import { ApiResponse } from '../../../shared/models/api-response.model';

export enum EligibilityFailure {
  EmailNotFound = 'EMAIL_NOT_FOUND',
  JuristicNotFound = 'JURISTIC_NOT_FOUND',
  BothInvalid = 'BOTH_INVALID',
  NoMatch = 'NO_MATCH',
  EmailNotLinked = 'EMAIL_NOT_LINKED',
}
export enum OtpFailure { Incorrect = 'INCORRECT', Expired = 'EXPIRED', Exceeded = 'EXCEEDED' }

export interface VerifyEligibilityRequest { email: string; juristicId: string; }
export interface VerifyEligibilityResult { eligible: boolean; failure?: EligibilityFailure; }
export interface RequestOtpResult { ref: string; expiresInMinutes: number; }
export interface VerifyOtpRequest { ref: string; code: string; }
export interface VerifyOtpResult { verified: boolean; failure?: OtpFailure; remainingAttempts?: number; }
export interface SubscribeResult { subscribed: boolean; }

export type EligibilityResponse = ApiResponse<VerifyEligibilityResult>;
export type RequestOtpResponse = ApiResponse<RequestOtpResult>;
export type VerifyOtpResponse = ApiResponse<VerifyOtpResult>;
export type SubscribeResponse = ApiResponse<SubscribeResult>;
```

- [ ] **Step 2: Verify build + commit**

```bash
npx ng build --configuration=development   # Expected: PASS
git add -A && git commit -m "feat: subscription domain model (eligibility/otp DTOs + enums)" && git push origin main
```

---

## Task 6: Mock + service layer (TDD) — all business rules live here

**Files:** Create `subscription.mock.ts`, `subscription.mock.spec.ts`, `subscription.service.ts`

**Mock triggers (single source — also documented in README):**
- eligible: `0105563000012` + `test@superapp.com`
- email not found: email `notfound@example.com` → `EmailNotFound`
- juristic not found: id `1111111111111` → `JuristicNotFound`
- not found modal: id `0000000000000` → `NoMatch`
- email not linked modal: email `notlinked@example.com` → `EmailNotLinked`
- OTP correct: `12345678`; expired: `00000000`; otherwise incorrect (count down `otpMaxAttempts`, then `Exceeded`)

- [ ] **Step 1: Write failing `subscription.mock.spec.ts`**

```ts
import { firstValueFrom } from 'rxjs';
import { mockVerifyEligibility, mockVerifyOtp, resetMockState } from './subscription.mock';
import { EligibilityFailure, OtpFailure } from './subscription.model';

describe('subscription.mock', () => {
  beforeEach(() => resetMockState());
  it('eligible on happy values', async () => {
    const r = await firstValueFrom(mockVerifyEligibility({ email: 'test@superapp.com', juristicId: '0105563000012' }));
    expect(r.data?.eligible).toBe(true);
  });
  it('NoMatch on all-zero id', async () => {
    const r = await firstValueFrom(mockVerifyEligibility({ email: 'test@superapp.com', juristicId: '0000000000000' }));
    expect(r.data?.failure).toBe(EligibilityFailure.NoMatch);
  });
  it('EmailNotLinked on notlinked email', async () => {
    const r = await firstValueFrom(mockVerifyEligibility({ email: 'notlinked@example.com', juristicId: '0105563000012' }));
    expect(r.data?.failure).toBe(EligibilityFailure.EmailNotLinked);
  });
  it('OTP correct verifies', async () => {
    const r = await firstValueFrom(mockVerifyOtp({ ref: 'SE-1', code: '12345678' }));
    expect(r.data?.verified).toBe(true);
  });
  it('OTP exceeded after max attempts', async () => {
    for (let i = 0; i < 2; i++) await firstValueFrom(mockVerifyOtp({ ref: 'SE-1', code: '99999999' }));
    const r = await firstValueFrom(mockVerifyOtp({ ref: 'SE-1', code: '99999999' }));
    expect(r.data?.failure).toBe(OtpFailure.Exceeded);
  });
});
```

- [ ] **Step 2: Run → FAIL**

```bash
npx ng test --watch=false --include='**/subscription.mock.spec.ts'   # Expected: FAIL
```

- [ ] **Step 3: Implement `subscription.mock.ts`** (delay 800ms, attempt counter; `otpMaxAttempts` from env)

```ts
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environments';
import {
  EligibilityFailure, OtpFailure,
  VerifyEligibilityRequest, EligibilityResponse,
  RequestOtpResponse, VerifyOtpRequest, VerifyOtpResponse, SubscribeResponse,
} from './subscription.model';

const meta = () => ({ traceId: 'mock-trace', timestamp: '1970-01-01T00:00:00Z', path: '/mock' });
const wrap = <T>(data: T): Observable<{ data: T; meta: ReturnType<typeof meta> }> =>
  of({ data, meta: meta() }).pipe(delay(800));

let otpAttempts = 0;
export const resetMockState = () => { otpAttempts = 0; };

export function mockVerifyEligibility(req: VerifyEligibilityRequest): Observable<EligibilityResponse> {
  const emailBad = req.email === 'notfound@example.com';
  const idBad = req.juristicId === '1111111111111';
  let failure: EligibilityFailure | undefined;
  if (req.juristicId === '0000000000000') failure = EligibilityFailure.NoMatch;
  else if (req.email === 'notlinked@example.com') failure = EligibilityFailure.EmailNotLinked;
  else if (emailBad && idBad) failure = EligibilityFailure.BothInvalid;
  else if (emailBad) failure = EligibilityFailure.EmailNotFound;
  else if (idBad) failure = EligibilityFailure.JuristicNotFound;
  return wrap({ eligible: !failure, failure });
}

export function mockRequestOtp(): Observable<RequestOtpResponse> {
  otpAttempts = 0;
  return wrap({ ref: 'SE-0123456', expiresInMinutes: environment.otpConfig.otpExpiryMinutes });
}

export function mockVerifyOtp(req: VerifyOtpRequest): Observable<VerifyOtpResponse> {
  const max = environment.otpConfig.otpMaxAttempts;
  if (req.code === '12345678') { otpAttempts = 0; return wrap({ verified: true }); }
  if (req.code === '00000000') return wrap({ verified: false, failure: OtpFailure.Expired });
  otpAttempts += 1;
  if (otpAttempts >= max) return wrap({ verified: false, failure: OtpFailure.Exceeded, remainingAttempts: 0 });
  return wrap({ verified: false, failure: OtpFailure.Incorrect, remainingAttempts: max - otpAttempts });
}

export function mockSubscribe(): Observable<SubscribeResponse> { return wrap({ subscribed: true }); }
```

- [ ] **Step 4: Implement `subscription.service.ts`** (mock branch + real HttpClient skeleton)

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import * as mock from './subscription.mock';
import {
  VerifyEligibilityRequest, EligibilityResponse, RequestOtpResponse,
  VerifyOtpRequest, VerifyOtpResponse, SubscribeResponse,
} from './subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.servicePaths.baseDomain}/${environment.servicePaths.onboarding}`;

  verifyEligibility(req: VerifyEligibilityRequest): Observable<EligibilityResponse> {
    if (environment.useMock) return mock.mockVerifyEligibility(req);
    return this.http.post<EligibilityResponse>(`${this.base}/v1/eligibility`, req);
  }
  requestOtp(email: string): Observable<RequestOtpResponse> {
    if (environment.useMock) return mock.mockRequestOtp();
    return this.http.post<RequestOtpResponse>(`${this.base}/v1/otp/request`, { email });
  }
  verifyOtp(req: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    if (environment.useMock) return mock.mockVerifyOtp(req);
    return this.http.post<VerifyOtpResponse>(`${this.base}/v1/otp/verify`, req);
  }
  subscribe(): Observable<SubscribeResponse> {
    if (environment.useMock) return mock.mockSubscribe();
    return this.http.post<SubscribeResponse>(`${this.base}/v1/subscribe`, {});
  }
}
```

- [ ] **Step 5: Run tests → PASS, commit**

```bash
npx ng test --watch=false --include='**/subscription.mock.spec.ts'   # Expected: PASS
git add -A && git commit -m "feat: subscription mock + service (mock branch + http skeleton)" && git push origin main
```

---

## Task 7: Flow state (TDD)

**Files:** Create `src/app/state/onboarding-flow.state.ts`, `onboarding-flow.state.spec.ts`

- [ ] **Step 1: Failing test**

```ts
import { OnboardingFlowState } from './onboarding-flow.state';
describe('OnboardingFlowState', () => {
  it('starts empty and stores then resets', () => {
    const s = new OnboardingFlowState();
    expect(s.email()).toBe('');
    s.setIdentity('a@b.com', '0105563000012'); s.setOtpRef('SE-1'); s.markOtpVerified(); s.markSubscribed();
    expect(s.email()).toBe('a@b.com'); expect(s.otpRef()).toBe('SE-1');
    expect(s.otpVerified()).toBe(true); expect(s.subscribed()).toBe(true);
    s.reset();
    expect(s.email()).toBe(''); expect(s.otpVerified()).toBe(false);
  });
});
```

- [ ] **Step 2: Run → FAIL**, then **Step 3: Implement**

```ts
import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class OnboardingFlowState {
  readonly email = signal('');
  readonly juristicId = signal('');
  readonly otpRef = signal('');
  readonly otpVerified = signal(false);
  readonly subscribed = signal(false);
  setIdentity(email: string, juristicId: string) { this.email.set(email); this.juristicId.set(juristicId); }
  setOtpRef(ref: string) { this.otpRef.set(ref); }
  markOtpVerified() { this.otpVerified.set(true); }
  markSubscribed() { this.subscribed.set(true); }
  reset() { this.email.set(''); this.juristicId.set(''); this.otpRef.set(''); this.otpVerified.set(false); this.subscribed.set(false); }
}
```

- [ ] **Step 4: Run → PASS, commit**

```bash
npx ng test --watch=false --include='**/onboarding-flow.state.spec.ts'   # Expected: PASS
git add -A && git commit -m "feat: onboarding flow state (signals)" && git push origin main
```

---

## Task 8: Routes + flow guard (TDD guard)

**Files:** Create `src/app/app.routes.const.ts`, `src/app/guards/flow.guard.ts`, `flow.guard.spec.ts`; Modify `src/app/app.routes.ts`

- [ ] **Step 1: `app.routes.const.ts`**

```ts
export const ROUTES = { landing: '', register: 'register', otp: 'otp', terms: 'terms', success: 'success' } as const;
```

- [ ] **Step 2: Failing guard test** (`flow.guard.spec.ts`) — verify redirect when precondition missing

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { flowGuard } from './flow.guard';
import { OnboardingFlowState } from '../state/onboarding-flow.state';

describe('flowGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  it('redirects to / when otp precondition missing', () => {
    const res = TestBed.runInInjectionContext(() => flowGuard('otp')({} as any, {} as any));
    expect(res).not.toBe(true); // returns UrlTree('/')
  });
  it('allows when precondition met', () => {
    const s = TestBed.inject(OnboardingFlowState);
    s.setIdentity('a@b.com', '0105563000012'); s.setOtpRef('SE-1');
    const res = TestBed.runInInjectionContext(() => flowGuard('otp')({} as any, {} as any));
    expect(res).toBe(true);
  });
});
```
> `provideRouter([])` is REQUIRED — `flowGuard` calls `inject(Router)`, which throws without it.

- [ ] **Step 3: Run → FAIL**, then **Step 4: Implement `flow.guard.ts`**

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OnboardingFlowState } from '../state/onboarding-flow.state';

type Step = 'register' | 'otp' | 'terms' | 'success';
export function flowGuard(step: Step): CanActivateFn {
  return () => {
    const s = inject(OnboardingFlowState);
    const router = inject(Router);
    const ok =
      step === 'register' ? true :
      step === 'otp' ? !!s.email() && !!s.otpRef() :
      step === 'terms' ? s.otpVerified() :
      /* success */ s.subscribed();
    return ok ? true : router.createUrlTree(['/']);
  };
}
```

- [ ] **Step 5: `app.routes.ts`** — lazy routes wrapped in layout

```ts
import { Routes } from '@angular/router';
import { OnboardingLayout } from './layouts/onboarding-layout/onboarding-layout';
import { flowGuard } from './guards/flow.guard';

export const appRoutes: Routes = [
  { path: '', component: OnboardingLayout, children: [
    { path: '', loadComponent: () => import('./pages/landing/landing').then(m => m.Landing) },
    { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
    { path: 'otp', canActivate: [flowGuard('otp')], loadComponent: () => import('./pages/otp/otp').then(m => m.Otp) },
    { path: 'terms', canActivate: [flowGuard('terms')], loadComponent: () => import('./pages/terms/terms').then(m => m.Terms) },
    { path: 'success', canActivate: [flowGuard('success')], loadComponent: () => import('./pages/success/success').then(m => m.Success) },
  ]},
  { path: '**', redirectTo: '' },
];
```
- [ ] **Step 6: Create stubs so the lazy `loadComponent` imports + layout resolve at build time**

esbuild resolves `loadComponent: () => import(...)` at **build time** — a missing module is a build error, not a lazy no-op. Create minimal stubs now; Tasks 9 & 11–15 flesh them out.

Layout stub `src/app/layouts/onboarding-layout/onboarding-layout.ts`:
```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({ selector: 'app-onboarding-layout', standalone: true, imports: [RouterOutlet], template: '<router-outlet />' })
export class OnboardingLayout {}
```
Five page stubs `src/app/pages/{name}/{name}.ts` (class names MUST match `.then(m => m.X)`: Landing, Register, Otp, Terms, Success):
```ts
import { Component } from '@angular/core';
@Component({ selector: 'app-landing', standalone: true, template: '' })
export class Landing {}
```

- [ ] **Step 7: Verify build + guard test → PASS, commit**

```bash
CHROME_BIN="/c/Program Files/Google/Chrome/Application/chrome.exe" npx ng test --watch=false --include='**/flow.guard.spec.ts'   # Expected: PASS
npx ng build --configuration=development   # Expected: PASS (routes resolve via stubs)
git add -A && git commit -m "feat: routes + flow guard + layout/page stubs" && git push origin main
```

---

## Task 9: Onboarding layout + top-bar + brand-backdrop (responsive)

**Files:** Create `layouts/onboarding-layout/onboarding-layout.{ts,html,scss}`, `components/top-bar/top-bar.{ts,html,scss}`, `components/brand-backdrop/brand-backdrop.{ts,html,scss}`

- [ ] **Step 1: `brand-backdrop`** — circular gradient EXIM decoration (pure presentational; `ex-`/CSS). Inputs: none. SCSS uses `var(--semantic-color-primary-default)` (#034EA1) + soft circles per Figma bottom graphic.

- [ ] **Step 2: `top-bar`** — back chevron + centered title.

```ts
// top-bar.ts
import { Component, input, output } from '@angular/core';
import { IconComponent } from '@exim/ui-kit';
@Component({ selector: 'app-top-bar', standalone: true, imports: [IconComponent],
  templateUrl: './top-bar.html', styleUrl: './top-bar.scss' })
export class TopBar {
  title = input<string>('');
  showBack = input<boolean>(true);
  back = output<void>();
}
```
`top-bar.html`: chevron (`<ex-icon name="chevron-left" />`) bound to `back.emit()` when `showBack()`, plus `{{ title() }}`. Title text used by pages: "สมัครรับข่าวสารผ่าน LINE".

- [ ] **Step 3: `onboarding-layout`** — phone-frame shell with `<router-outlet/>`

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandBackdrop } from '../../components/brand-backdrop/brand-backdrop';
@Component({ selector: 'app-onboarding-layout', standalone: true, imports: [RouterOutlet, BrandBackdrop],
  templateUrl: './onboarding-layout.html', styleUrl: './onboarding-layout.scss' })
export class OnboardingLayout {}
```
`onboarding-layout.scss` (responsive — the core requirement):

```scss
:host { display:block; min-height:100dvh; background: var(--semantic-color-primary-default, #034EA1); }
.frame {
  width: 100%; min-height: 100dvh; margin: 0 auto; background:#fff; position: relative; overflow: hidden;
}
@media (min-width: 768px) {
  :host { display:flex; align-items:center; justify-content:center; padding: 24px 0; }
  .frame { width: 412px; min-height: 0; height: min(844px, calc(100dvh - 48px)); border-radius: 28px;
           box-shadow: 0 20px 60px rgba(0,0,0,.35); }
}
```
`onboarding-layout.html`: `<div class="frame"><app-brand-backdrop/><router-outlet/></div>`

- [ ] **Step 4: Verify build + commit**

```bash
npx ng build --configuration=development   # Expected: PASS (layout fleshed out; routes already resolved via T8 stubs)
git add -A && git commit -m "feat: responsive onboarding layout + top-bar + brand-backdrop" && git push origin main
```
> This task REPLACES the T8 layout stub with the real responsive shell + adds `top-bar`/`brand-backdrop`.

---

## Task 10: Result modal + mock-trigger hint

**Files:** Create `components/result-modal/result-modal.{ts,html,scss}`, `components/mock-trigger-hint/mock-trigger-hint.{ts,html,scss}`

- [ ] **Step 1: `result-modal`** — bottom-sheet (wraps `ex-modal`) for not-found / not-linked / otp-exceeded.

```ts
import { Component, computed, input, output } from '@angular/core';
import { ModalComponent, ModalButton, IconComponent } from '@exim/ui-kit';
@Component({ selector: 'app-result-modal', standalone: true, imports: [ModalComponent, IconComponent],
  templateUrl: './result-modal.html', styleUrl: './result-modal.scss' })
export class ResultModal {
  open = input<boolean>(false);
  variant = input<'not-found' | 'not-linked' | 'otp-exceeded'>('not-found');
  heading = input<string>(''); body = input<string>(''); buttonText = input<string>('ตกลง');
  confirm = output<void>(); closed = output<void>();
  protected readonly iconName = computed(() =>
    this.variant() === 'not-linked' ? 'user' : this.variant() === 'otp-exceeded' ? 'warning' : 'close');
  // Build the ModalButton per the vendored ModalButton shape; wire its click to confirm.emit()
  protected readonly rightBtn = computed<ModalButton>(() => ({ label: this.buttonText() } as ModalButton));
}
```
`result-modal.html` (ex-modal uses `isOpen` + content projection, NOT heading/body inputs):
```html
<ex-modal [isOpen]="open()" [rightButton]="rightBtn()" (closed)="closed.emit()">
  <div class="result-modal__body">
    <ex-icon [name]="iconName()" class="result-modal__icon" />
    <h3>{{ heading() }}</h3>
    <p>{{ body() }}</p>
  </div>
</ex-modal>
```
> **Pin before building:** read `ModalButton` + `ModalPosition` in the vendored `types/exim-ui-kit.d.ts`. Confirmed `ex-modal` API: `isOpen`, `leftButton`/`rightButton: ModalButton`, `width`, `position`, `(closed)`, body via `<ng-content>`. Wire the `rightButton` click → `confirm.emit()` per `ModalButton`'s action field. Use `position="bottom"` if `ModalPosition` supports it (bottom-sheet per Figma); else default + CSS. Icon names (`close`/`user`/`warning`) — confirm in the ui-kit icon registry; fall back to ng-zorro icons if absent.

- [ ] **Step 2: `mock-trigger-hint`** — dev-only collapsible hint, shown only when `environment.useMock`. Lists the trigger table from the spec so the app is self-documenting when played.

- [ ] **Step 3: Verify build + commit**

```bash
npx ng build --configuration=development   # Expected: PASS
git add -A && git commit -m "feat: result modal + dev mock-trigger hint" && git push origin main
```

---

## Tasks 11–15: Pages

> **Per-page convention:** create `{page}.ts` (standalone, `inject()`, signals), `{page}.html`, `{page}.scss`, `{page}.state.ts` (`@Injectable()`, provided in component `providers:[]`), `{page}.message.ts` (Thai copy consts), `{page}.selector.ts` (data-testid consts), `{page}.spec.ts` (smoke: component creates). Each action sets an `isLoading` signal → button `[disabled]`/`ex-spinning` during the 800ms mock delay; clear error on retry. Use the Figma node IDs to screenshot exact layout (via Figma MCP). Exact Thai copy is in the spec §7/§8.

### Task 11: Landing (frame `4:24`)
- [ ] Build `pages/landing` — logo, `ex-title` heading "สมัครรับข่าวสารผ่าน LINE", description, brand graphic, `ex-button` "ดำเนินการต่อ" → `router.navigate(['/register'])`.
- [ ] Verify build + smoke spec + commit/push.

### Task 12: Register (frames `13:3212` base; states `13:3982/28:999/28:1123/18:4642/28:1550/29:1104/28:1275`)
- [ ] `register.message.ts`: all copy from spec §7.2/§8 (heading "กรอกข้อมูลยืนยันตัวตน", subtext, field labels, each inline error string, modal heading/body/buttons).
- [ ] `register.state.ts`: signals `email`, `juristicId`, `emailError`, `idError`, `isLoading`, `modal` ('none'|'not-found'|'not-linked'); methods: `submit()` → client-validate (`isValidEmail`,`isValidJuristicId`) → set inline errors; if valid → `firstValueFrom(service.verifyEligibility(...))` → map `failure` to inline errors or `modal`; on eligible → `firstValueFrom(service.requestOtp(email))` → `flow.setIdentity`,`flow.setOtpRef` → navigate `/otp`. **All failure→UI mapping stays in this state reading the result flag — no business rule here, just rendering.**
- [ ] `register.ts`/`.html`: email-first layout (`ex-input-field` Email then เลขนิติบุคคล), `app-top-bar`, `app-result-modal` (bind variant/heading/body), submit button.
- [ ] Verify build + smoke spec + commit/push.

### Task 13: OTP (frames `24:7505` base; states `24:7645/24:7900/24:7949/24:7747/24:8172/24:7803/24:7549/24:7857`)
- [ ] `otp.message.ts`: heading "กรอกรหัส OTP", "ระบบได้ส่งรหัส OTP ไปยัง Email: {email}", "Ref: {ref}", "OTP มีอายุการใช้งาน {n} นาที", resend link + all error/warning strings from spec §7.3/§8.
- [ ] `otp.state.ts`: signals `code`, `error` (Incorrect/Expired text), `remainingAttempts`, `isLoading`, `exceededModal`, resend: `remainingTime`, `canResend`. Methods: `verify()` (explicit, disabled until 8 digits) → `service.verifyOtp` → verified: `flow.markOtpVerified()` + navigate `/terms`; Incorrect → error + remainingAttempts; Expired → error; Exceeded → open modal. `resend()` → `service.requestOtp` → restart cooldown. **Cooldown:** `setInterval` cleared before each restart AND in `DestroyRef.onDestroy` (mirror HostApp register-user-otp-step); duration `environment.otpConfig.otpRequestCooldownSeconds`; `formatTime()` mm:ss.
- [ ] `otp.ts`/`.html`: `ex-input-otp [length]="8" inputType="numeric"`, `ex-alert` for errors, `ex-toast` resend warning, `app-result-modal variant="otp-exceeded"` (button "กลับไปหน้ากรอกข้อมูลยืนยันตัวตน" → `/register`), `ex-button` "ยืนยัน".
- [ ] Verify build + spec (cover: verify success navigates, exceeded opens modal, interval cleared on destroy) + commit/push.

### Task 14: Terms (frames `8:1938` top / `24:8328` bottom)
- [ ] `terms.message.ts`: heading "ข้อกำหนดและเงื่อนไข", placeholder PDPA body (พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 style), hint "กรุณาเลื่อนอ่านให้ครบถ้วน", button "ยอมรับและดำเนินการต่อ".
- [ ] `terms.state.ts`: `scrolledToBottom`, `isLoading`. `accept()` → `service.subscribe()` → `flow.markSubscribed()` → `/success`.
- [ ] `terms.ts`/`.html`: scrollable content; `(scroll)` handler sets `scrolledToBottom` when near bottom; button `[disabled]="!scrolledToBottom()"`.
- [ ] Verify build + smoke spec + commit/push.

### Task 15: Success (frame `4:333`)
- [ ] `success.message.ts`: "สมัครรับข่าวสารสำเร็จ!", body "บัญชี LINE ของท่านได้รับการเชื่อมต่อกับระบบ SuperApp เรียบร้อยแล้ว", pill "เชื่อมต่อกับบัญชี {email}", button.
- [ ] `success.ts`: `ex-icon name="check"` graphic, show `flow.email()`; button → `flow.reset()` + navigate `/`.
- [ ] Verify build + smoke spec + commit/push.

---

## Task 16: CI (Cloudflare Pages) + README

**Files:** Create `.github/workflows/deploy.yml`, replace `README.md`

- [ ] **Step 1: `.github/workflows/deploy.yml`** — exactly the YAML in spec §13 (`project-name onboarding-mobile`, output `dist/onboarding-mobile/browser`, npm-auth step for `@exim` using `AZURE_ARTIFACTS_TOKEN`, no APIM/MSAL inject). Confirm the build output path matches `angular.json` `outputPath` (default `dist/onboarding-mobile`; Angular `application` builder emits `/browser`).

- [ ] **Step 2: `README.md`** — sections:
  - Overview (mock LINE-connectivity onboarding)
  - **Local setup:** `npx vsts-npm-auth -config .npmrc` (Azure auth) → `npm install` → `npm start`. Note the dev fallback (vendoring) only needed where Azure auth is unavailable.
  - **Mock triggers table** (from Task 6 / spec §8)
  - **Responsive:** desktop centered phone-frame, mobile full-bleed (DevTools 375px)
  - **Deploy:** push `main` → GitHub Actions → Cloudflare Pages. **Required GitHub secrets** (`gh secret set` commands from spec §13 + UI fallback): `AZURE_ARTIFACTS_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. **CI is red until these are set — expected.**
  - **Migration notes** (spec §15)

- [ ] **Step 3: Commit + push**

```bash
git add -A && git commit -m "ci: Cloudflare Pages deploy workflow + README" && git push origin main
```

---

## Task 17: Full-flow verification

- [ ] **Step 1: Production build**

```bash
npx ng build --configuration=production   # Expected: PASS; output dist/onboarding-mobile/browser
```

- [ ] **Step 2: Run unit tests**

```bash
npx ng test --watch=false --browsers=ChromeHeadless   # Expected: all PASS (validators, mock, state, guard)
```

- [ ] **Step 3: Manual smoke (serve + verify)**

```bash
npx ng serve
```
Verify (per spec §14): happy path Landing→Register→OTP→Terms→Success; each mock trigger reaches its state; desktop shows centered phone-frame, mobile (DevTools 375px) full-bleed; refresh on `/otp` redirects to `/`.

- [ ] **Step 4: Commit any fixes + push.**

---

## Self-Review Notes (author)

- Spec coverage: landing/register/otp/terms/success + all error states + mock layer + flow guard + responsive + CI all have tasks. ✅
- Flow order (Register→OTP→Terms) reflected in routes (T8) + page navigations (T12/T13/T14). ✅
- Business-rule boundary: all taxonomy in `subscription.mock.ts` (T6); states only map result flags. ✅
- Failure contract: 200 + `failure` flag (T5/T6). ✅
- `@exim/ui-kit` API names (T9/T10/T13: `IconComponent` name `chevron-left`/`check`, `ex-input-otp length`/`inputType`/`otpComplete`, `ex-input-field` `error`/`helperText`, `ex-button`) — confirm against vendored `types/` on first use; watch 1.5.2↔1.6.10 drift.
- Known: CI red until user sets 3 secrets; local build uses vendored ui-kit copy.
```
