# Design Spec — `onboarding-mobile`

EXIM SuperApp — LINE Connectivity onboarding (corporate/juristic subscribe) · clean mock-data frontend (Angular 21)

- **Date:** 2026-06-23
- **Status:** Verified (4-agent adversarial verification applied) — pending user review
- **Repo:** `C:\Source\Private\onboarding-mobile` · GitHub `Supakorn08/onboarding-mobile` (branch `main`)
- **Figma:** SuperApp — LINE Connectivity · `node-id=29-1185` (Flow: Register to subscribe, 27 frames, mobile 375px)

> เวอร์ชันนี้แก้ตาม findings จาก verification workflow (ui-kit APIs / HostApp+FX conventions / Figma coverage / completeness critic) — จุดที่เปลี่ยนสำคัญ: **flow order**, **corporate/juristic ID**, **ApiResponse envelope**, **ตัด /result page**, validation/OTP/flow-guard rules

---

## 1. Goal & Non-Goals

### Goal
Angular 21 standalone (single repo, no MF) ที่:
1. เขียนตาม convention `Frontend_HostAppSuperApp` / `Frontend_RemoteAppFX` ทุกอย่าง → migrate (copy-paste page/service/state) เข้า shell จริงง่าย
2. ใช้ UI kit `@exim/ui-kit` (look & feel เดียวกับ SuperApp)
3. mock-data ล้วน — แต่ service layer ออกแบบให้สลับเป็น API จริงได้โดยแก้ที่เดียว
4. Responsive 2 ขนาด — desktop (centered phone-frame) + mobile (375px ตาม Figma, full-bleed)
5. "เล่นได้เลย" — `npm install && npm start` คลิกไหลทั้ง flow ครบทุก state ผ่าน mock triggers
6. CI deploy ไป **Cloudflare Pages** (Method B: GitHub Actions + Wrangler) เลียนแบบ `sa-onboarding-demo`

**Domain:** เป็น flow ให้ลูกค้า **นิติบุคคล (corporate/juristic)** ยืนยันตัวตนด้วย **เลขนิติบุคคล 13 หลัก + Email ที่ลงทะเบียนกับ SuperApp** เพื่อเชื่อมบัญชี LINE แล้วรับข่าวสาร

### Non-Goals (clean = ตัดทิ้ง)
- ❌ Module Federation, Nx, SSR/`@angular/ssr`, `@angular/platform-server`, express
- ❌ MSAL/Azure AD, `@exim/auth-sdk`, OneTrust, SignalR/realtime, idle, CSRF, `@exim/onboarding`, `@exim/util-sdk`, `@ng-idle/*`
- ❌ i18n runtime (`@angular/localize`/`$localize`) — hardcode ไทยใน `.message.ts`
- ❌ Backend/API จริง (เฟสนี้ mock เท่านั้น)
- ❌ จอ `/result` แบบ standalone (Figma ไม่มี — error ทุกตัวเป็น inline/modal)
- ❌ Thai national-ID **mod-11 checksum** — ใช้ length-only 13 หลัก (เพื่อให้ mock trigger ทำงาน)

---

## 2. Decisions (ยืนยันกับ user)

| # | ประเด็น | เลือก | เหตุผล |
|---|---------|-------|--------|
| 1 | ดึง `@exim/ui-kit` | Install จาก Azure Artifacts | ตรง HostApp, migration ง่าย |
| 2 | Tooling | Angular CLI standalone (no Nx/MF/SSR) | "single repo ลอยๆ" |
| 3 | Desktop layout | Centered phone-frame | clean, ตรง Figma, ไม่ต้องเดา |
| 4 | Scope | ~5 pages + state variants (จาก 27 frames) | ครบทุก frame, maintain ง่าย |
| 5 | File convention | แบบ remote-FX (`.message.ts` + `.selector.ts`) | mirror ที่ใกล้สุด |
| 6 | CI/CD | Cloudflare Pages (Method B) | เลียนแบบ `sa-onboarding-demo` |

---

## 3. Tech Stack & Dependencies

- **Angular** ~21.1.0 — standalone, signals, `inject()`, functional guards
- **Build:** Angular CLI (`@angular/build` / esbuild)
- **UI:** `ng-zorro-antd` ~21.1.0 + `@exim/ui-kit` ^1.6.10 + `@ant-design/icons-angular` ^21.0.0
- **State:** signal-based `.state.ts` (no NgRx)
- **HTTP:** `HttpClient` (`provideHttpClient(withFetch())`)
- **Style:** SCSS + CSS custom properties (design tokens)
- **Fonts:** Anuphan / Sarabun

**dependencies (minimal):** `@angular/{animations,common,compiler,core,forms,platform-browser,router}` ~21.1.0, `@angular/cdk` ^21.1.3, `ng-zorro-antd` ~21.1.0, `@ant-design/icons-angular` ^21.0.0, `@exim/ui-kit` ^1.6.10, `rxjs` ~7.8.0, `zone.js` ^0.16.0, `tslib` ^2.3.0
**devDependencies:** `@angular/cli` ~21.1.0, `@angular-devkit/build-angular` ~21.1.0, `@angular/compiler-cli` ~21.1.0, `typescript` ~5.9.2 (+ karma/jasmine ถ้าต้องการ test)
**ตัดออก (เทียบ HostApp):** msal, auth-sdk, onboarding, util-sdk, ng-idle, localize, platform-server, ssr, nx, module-federation, express, quill/ngx-quill (ไม่ใช้ text-editor)

---

## 4. การดึง UI Kit (Azure Artifacts)

`.npmrc` (root) — ตาม `Frontend_RemoteAppFX/.npmrc`:
```
@exim:registry=https://pkgs.dev.azure.com/eximth/_packaging/eximth/npm/registry/
always-auth=true
registry=https://registry.npmjs.org/
```
- ก่อน install: user รัน auth (`npx vsts-npm-auth -config .npmrc` หรือเติม `_authToken`) → `npm install`
- peer deps: `ng-zorro-antd`, `@angular/cdk` (public) — onboarding flow ไม่ใช้ quill จึงไม่ต้องลง
- CSS tokens: `@exim/ui-kit/dist/css/design-tokens.css` (generated ตอน build ของ lib; มากับ package)
- ⚠️ **Build risk:** barrel `@exim/ui-kit` re-export `TextEditorComponent` → import อะไรก็ตามจาก barrel อาจดึง `quill`/`ngx-quill` ตอน build (เรื่อง module resolution ไม่ใช่ tree-shaking) — ถ้า first build แดงเพราะหา quill ไม่เจอ ให้ลง `quill`/`ngx-quill` เพิ่ม หรือ deep-import component (อย่าตีความว่าเป็นปัญหาลึก)

**ex-components (verified API):**
| Component | selector | key API |
|---|---|---|
| Button | `ex-button` | `variant`, `size`, `loading`, `disabled`, `width` |
| Input field | `ex-input-field` | `label`, `placeholder`, `helperText`, `error: boolean`, ngModel |
| OTP | `ex-input-otp` | `length=input<number>(4)` → ตั้ง 8, `inputType` ('text'\|'numeric'\|'alphanumeric') → ตั้ง 'numeric', `(otpComplete)=output<string>`, ngModel |
| Checkbox | `ex-checkbox` | ControlValueAccessor, `size` |
| Modal | `ex-modal` | generic backdrop modal (ใช้กับ bottom-sheet error) |
| Alert | `ex-alert` | info/warning/error/success (inline OTP error) |
| Toast | `ex-toast` | resend warning (yellow) |
| Spinning | `ex-spinning` | loading |
| Title | `ex-title` | heading + subtitle |
| Icon | `ex-icon` | ชื่อ icon: `chevron-left` (back), `check` (success) — verified ใน icon-registry |

---

## 5. โครงสร้างโฟลเดอร์

```
onboarding-mobile/
├── .npmrc
├── .github/workflows/deploy.yml      # Cloudflare Pages (Method B)
├── angular.json                      # build configs: dev/sit/uat/prod + fileReplacements
├── package.json
├── tsconfig.json / tsconfig.app.json
├── README.md                         # auth+install+run + ตาราง mock triggers
├── public/                           # static assets (favicon ฯลฯ; ไม่มี 404.html — ให้ SPA fallback ทำงาน)
├── docs/superpowers/specs/           # spec นี้
└── src/
    ├── main.ts                       # bootstrapApplication(App, appConfig)
    ├── index.html                    # โหลด Anuphan/Sarabun
    ├── styles.scss                   # @import ng-zorro ก่อน → design-tokens → base font
    ├── environments/
    │   ├── environments.ts           # dev: useMock:true, servicePaths, otpConfig
    │   ├── environments.sit.ts / .uat.ts / .prod.ts
    └── app/
        ├── app.ts                    # root: <router-outlet>
        ├── app.config.ts             # ~20 บรรทัด providers
        ├── app.routes.ts             # lazy loadComponent + flowGuard
        ├── app.routes.const.ts       # ROUTES const
        ├── app.icons.ts              # ng-zorro icons ที่ใช้
        ├── layouts/onboarding-layout/        # phone-frame responsive shell
        ├── guards/flow.guard.ts              # functional guard ต่อ route
        ├── pages/
        │   ├── landing/
        │   ├── register/             # heading "กรอกข้อมูลยืนยันตัวตน"
        │   ├── otp/
        │   ├── terms/
        │   └── success/
        │       └── (แต่ละ page: .ts .html .scss .state.ts .message.ts .selector.ts .spec.ts)
        ├── components/
        │   ├── top-bar/                       # back chevron + title
        │   ├── brand-backdrop/                # circular gradient EXIM
        │   ├── result-modal/                  # generic bottom-sheet (not-found / not-linked / otp-exceeded)
        │   └── mock-trigger-hint/             # dev-only hint (แสดงเมื่อ useMock)
        ├── services/
        │   └── onboarding-service/subscription/
        │       ├── subscription.service.ts    # HttpClient + mock branch
        │       ├── subscription.mock.ts        # mock data + triggers
        │       └── subscription.model.ts       # ApiResponse/ApiErrorResponse + DTOs + enums
        ├── state/onboarding-flow.state.ts      # cross-step flow state (root)
        └── shared/
            ├── models/api-response.model.ts
            ├── utils/validators.ts             # emailValidator, juristicId13Validator
            └── messages/
```

---

## 6. Routing & Flow ✅ (corrected — terms หลัง OTP)

**Happy path (connector-traced, HIGH confidence):**
`/` Landing → `/register` → `/otp` → `/terms` → `/success`

| Path | Page | guard precondition |
|------|------|--------------------|
| `/` (landing) | Landing | — |
| `/register` | Register | — |
| `/otp` | Otp | flow.email && flow.otpRef |
| `/terms` | Terms | flow.otpVerified === true |
| `/success` | Success | flow.subscribed === true |
| `**` | → `/` | — |

**`flowGuard` (functional, จำเป็น):** ถ้า precondition ไม่ครบ (refresh/deep-link/state หาย) → `redirect '/'` ป้องกันจอพัง(เช่น OTP โชว์ email ว่าง)

**`OnboardingFlowState`** (signal, `providedIn:'root'`): `email`, `juristicId`, `otpRef`, `otpVerified`, `subscribed`, `consentAccepted` + `reset()`
- Back chevron ทำงานถูก, OTP รู้ email
- Success init → ใช้ guard ป้องกัน re-trigger; ปุ่มจบ → `reset()` + ไป `/` (demo loopable)

**Flow actions:**
- Landing "ดำเนินการต่อ" → `/register`
- Register submit → `verifyEligibility` → eligible: `requestOtp(email)` → set `otpRef` → `/otp`
- OTP "ยืนยัน" → `verifyOtp(ref, code)` → verified: set `otpVerified` → `/terms`
- Terms (scroll-gated) "ยอมรับและดำเนินการต่อ" → `subscribe()` → set `subscribed` → `/success`

---

## 7. Page-by-Page Spec

> ทุก action: `isLoading` signal คุม `[disabled]` + `ex-spinning` ระหว่าง mock delay (800ms), clear error ตอน retry

### 7.1 Landing (`pages/landing`) — frame `4:24`
- EXIM logo, heading "สมัครรับข่าวสารผ่าน LINE", คำอธิบาย, graphic (LINE/email + brand backdrop), ปุ่ม **"ดำเนินการต่อ"** → `/register`
- ex: `ex-button`, `ex-title`

### 7.2 Register (`pages/register`) — heading **"กรอกข้อมูลยืนยันตัวตน"**
- subtext: "กรอกเลขนิติบุคคล และ Email ที่ลงทะเบียนกับ SuperApp เพื่อยืนยันว่าคุณคือลูกค้าของเรา"
- **Layout (เลือก email-first — 11 ใน 13 frames):** field **Email** (placeholder `example@email.com`) ก่อน, field **เลขนิติบุคคล** (placeholder `0000000000000`, helper "ตัวอย่าง: 0105563000012 (13 หลัก)") ปุ่ม "ถัดไป"
- ex: `ex-input-field` ×2, `ex-button`, `top-bar`, `result-modal`
- **Client validation:** email = email regex; juristicId = `/^\d{13}$/` (length-only, **no checksum**)
- **States & exact copy:**
  - empty → ปุ่ม disabled
  - email invalid (inline): "รูปแบบของ Email ไม่ถูกต้อง"
  - id ไม่ครบ 13 (inline): "กรุณากรอกเลขนิติบุคคลให้ครบ 13 หลัก"
  - valid ทั้งคู่ → ปุ่ม active → `verifyEligibility`
- **Server (mock) eligibility outcomes:**
  - email ไม่มีในระบบ (inline): "ไม่มี Email นี้อยู่ในระบบ"
  - นิติบุคคลไม่มีในระบบ (inline): "ไม่มีเลขนิติบุคคลนี้อยู่ในระบบ"
  - ทั้งคู่ผิด (inline ทั้ง 2): "กรุณาตรวจสอบ Email อีกครั้ง" + "กรุณาตรวจสอบเลขนิติบุคคลอีกครั้ง"
  - ไม่พบข้อมูล (**modal**): heading "ไม่พบข้อมูลในระบบ" / body "ข้อมูลที่กรอกไม่ตรงกับลูกค้าที่ลงทะเบียนไว้กับ SuperApp กรุณาตรวจสอบ Email และเลขนิติบุคคลอีกครั้ง" / ปุ่ม "ตรวจสอบอีกครั้ง" (dismiss, อยู่หน้าเดิม)
  - Email ไม่เชื่อมบัญชีนิติบุคคล (**modal**): heading "Email นี้ยังไม่ได้เชื่อมต่อกับบัญชีนิติบุคคล" / body "...กรุณาใช้ Email อื่น" / ปุ่ม "ตกลง" (dismiss)

### 7.3 OTP (`pages/otp`) — heading "กรอกรหัส OTP"
- "ระบบได้ส่งรหัส OTP ไปยัง Email: {email}", **8 ช่อง** (`ex-input-otp length=8 inputType=numeric`), "Ref: {ref}", "OTP มีอายุการใช้งาน {otpExpiryMinutes} นาที", ลิงก์ "ขอรหัสอีกครั้ง", ปุ่ม **"ยืนยัน"** (explicit submit — disabled จนครบ 8 หลัก, **ไม่ auto-submit**)
- ex: `ex-input-otp`, `ex-alert`, `ex-toast`, `top-bar`, `ex-button`, `result-modal`
- **States & exact copy:**
  - empty / input (keypad) / filled
  - ผิด (เหลือสิทธิ์) inline alert: "กรอกรหัส OTP ไม่ถูกต้อง (กรอกได้อีก {n} ครั้ง)"
  - หมดอายุ inline alert: "รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่อีกครั้ง"
  - เกินจำนวนครั้ง (**inline + bottom-sheet modal**): heading "คุณกรอกรหัส OTP ไม่ถูกต้อง เกินจำนวนครั้งที่กำหนด" / body "กรุณากดเริ่มกระบวนการลงทะเบียนใหม่อีกครั้ง หากใช้ Email เดิม กรุณารอ 15 นาที" / ปุ่ม "กลับไปหน้ากรอกข้อมูลยืนยันตัวตน" → `/register`
  - resend warning (yellow toast): "คุณสามารถขอรหัส OTP ได้อีก 1 ครั้ง"
  - resend cooldown (link disabled): "ขอรหัสอีกครั้ง (รอ {s} วินาที)"
  - resend exceeded (link disabled): "(คุณขอรหัส OTP ครบตามจำนวนที่กำหนดแล้ว กรุณาลองใหม่ในอีก {m} นาที {s} วินาที)"
- **Resend cooldown mechanics (mirror HostApp register-user-otp-step):** `remainingTime`/`canResend` signals, `formatTime()` mm:ss, `setInterval` — **clear ก่อน restart ทุกครั้ง + clear ใน `DestroyRef.onDestroy`** (กัน interval ซ้อน/leak); duration จาก `environment.otpConfig.otpRequestCooldownSeconds`

### 7.4 Terms (`pages/terms`) — heading "ข้อกำหนดและเงื่อนไข" (หลัง OTP)
- เนื้อหา scrollable (อ้าง PDPA พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562), **scroll-gated**: ปุ่ม disabled จนเลื่อนถึงล่างสุด, hint "กรุณาเลื่อนอ่านให้ครบถ้วน", ปุ่ม "ยอมรับและดำเนินการต่อ"
- ex: `ex-button` + เนื้อหา + scroll detection (หรือ `ex-checkbox` ถ้า design ต้องการ)
- Action → `subscribe()` → `/success`
- (terms content = placeholder/lorem PDPA-style สำหรับ mock)

### 7.5 Success (`pages/success`) — frame `4:333`
- check graphic (เขียว), "สมัครรับข่าวสารสำเร็จ!", body "บัญชี LINE ของท่านได้รับการเชื่อมต่อกับระบบ SuperApp เรียบร้อยแล้ว", pill "เชื่อมต่อกับบัญชี {email}", ปุ่มจบ
- ex: `ex-icon` (check), `ex-title`, `ex-button`
- **Exit action:** `flowState.reset()` → ไป `/` (demo loopable); migration note: ใน shell จะปิด LIFF/กลับ host
- init: guard กัน re-trigger subscribe จาก back-nav

---

## 8. Mock Triggers (playability — document ใน README + `subscription.mock.ts`)

| State | Trigger (mock) | UI |
|-------|----------------|----|
| email format ผิด | email ไม่ valid | inline |
| id ไม่ครบ 13 | < 13 digit | inline |
| eligible (happy) | `0105563000012` + `test@superapp.com` | → OTP |
| email ไม่มีในระบบ | email `notfound@example.com` | inline |
| นิติบุคคลไม่มีในระบบ | id `1111111111111` | inline |
| ไม่พบข้อมูล | id `0000000000000` | modal |
| email ไม่เชื่อมนิติบุคคล | email `notlinked@example.com` | modal |
| OTP ถูก | `12345678` | → Terms |
| OTP ผิด | code อื่น | inline (นับครั้ง) |
| OTP หมดอายุ | `00000000` | inline expired |
| OTP เกินครั้ง | ผิดครบ `otpMaxAttempts` | inline + modal → Register |

> ค่าเหล่านี้เป็น mock กำหนดเอง ปรับได้ — เป็น single source ใน `subscription.mock.ts`

---

## 9. Mock ↔ API-ready Layer

### Contract (`subscription.model.ts`) — ✅ envelope จริงจาก `@exim/auth-sdk`
```ts
export interface ApiResponseMeta { traceId: string; timestamp: string; path: string; }
export interface ApiResponse<T> { data?: T; meta: ApiResponseMeta; }
// error แยก (RFC 7807 Problem Details):
export interface ApiErrorResponse<E = unknown> {
  type: string; title: string; status: number; detail: string;
  instance: string; errorCode: string; traceId: string; timestamp: string; errors?: E;
}

export enum EligibilityFailure {
  EmailNotFound = 'EMAIL_NOT_FOUND',
  JuristicNotFound = 'JURISTIC_NOT_FOUND',
  BothInvalid = 'BOTH_INVALID',
  NoMatch = 'NO_MATCH',
  EmailNotLinked = 'EMAIL_NOT_LINKED',
}
export interface VerifyEligibilityRequest { email: string; juristicId: string; }
export interface VerifyEligibilityResult { eligible: boolean; failure?: EligibilityFailure; }
export interface RequestOtpResult { ref: string; expiresInMinutes: number; }
export interface VerifyOtpRequest { ref: string; code: string; }
export enum OtpFailure { Incorrect='INCORRECT', Expired='EXPIRED', Exceeded='EXCEEDED' }
export interface VerifyOtpResult { verified: boolean; failure?: OtpFailure; remainingAttempts?: number; }
```

### Service (`subscription.service.ts`)
```ts
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.servicePaths.baseDomain}/${environment.servicePaths.onboarding}`;

  verifyEligibility(req: VerifyEligibilityRequest): Observable<ApiResponse<VerifyEligibilityResult>> {
    if (environment.useMock) return mockVerifyEligibility(req);     // of(...).pipe(delay(800))
    return this.http.post<ApiResponse<VerifyEligibilityResult>>(`${this.base}/v1/eligibility`, req);
  }
  // requestOtp / verifyOtp / subscribe — รูปแบบเดียวกัน
}
```
- state เรียกด้วย `firstValueFrom(...)` แล้ว `.set()` signals (ตาม HostApp)
- **สลับเป็นจริง:** `useMock:false` + เติม `servicePaths.baseDomain/onboarding` (ไม่แก้ component/state)
- **Failure-delivery contract (assumption):** eligibility/OTP failure ส่งเป็น **success envelope 200 + `failure` flag** (ไม่ใช่ `ApiErrorResponse` 4xx) — frontend นี้เป็นคนนิยาม contract ให้ API จริง match ตามทีหลัง (กัน `useMock:false` swap พังเงียบ)
- **Business-rule boundary (clean/migration):** taxonomy ทั้งหมด (4 eligibility failures, OTP attempt-counting, lock-15-min, resend rules) อยู่ **ใน `subscription.mock.ts` เท่านั้น** — `register.state.ts`/`otp.state.ts`/pages เห็นแค่ผลลัพธ์ (`eligible/verified/failure?/remainingAttempts?`) แล้ว render; ห้าม branching ของ business rule รั่วเข้า state/page

---

## 10. Responsive Design

`OnboardingLayout`:
- **Mobile (< 768px):** full-bleed `100vw`/`100dvh` ตรง Figma
- **Desktop (≥ 768px):** container ~390–420px กึ่งกลาง + EXIM brand backdrop (gradient) เต็ม viewport รอบๆ + เงา/มุมโค้ง (phone-frame look)
- TopBar sticky บน container, content scroll ภายใน
- CSS media query + design tokens (`var(--space-*)`, `var(--semantic-color-*)`), หน่วย rem/`dvh`

---

## 11. Styling & Theme ✅

- `styles.scss` (mirror HostApp — **ng-zorro ก่อน แล้ว tokens**):
  ```scss
  @import 'ng-zorro-antd/ng-zorro-antd.min.css';
  @import '@exim/ui-kit/dist/css/design-tokens.css';
  * { font-family: var(--font-families-base); }
  ```
  (HostApp ใช้ `@import` ใน styles.scss + ลง styles.scss เดี่ยวใน build config — ไม่ใช่ styles array; ทำตามนี้)
- สีแบรนด์ EXIM blue `#034EA1` (verified `design-tokens.ts`), font Anuphan/Sarabun
- tokens: `semantic.space (0..12)`, `semantic.radius (none,sm,md,lg,xl,special)`, `text.size (caption,bodySm,bodyMd,bodyLg,h4..h1,display,special)`
- component styles co-located ใช้ `var(--token)` เท่านั้น

`index.html` font link (verified ตรง HostApp):
```html
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@100;200;300;400;500;600;700&family=Sarabun:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
```

---

## 12. App Bootstrap (clean) + Environments

`app.config.ts`:
```ts
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
(providers ทั้งหมด verified ว่ามีจริงใน Angular 21.1 — import paths ตรง HostApp)

`environments.ts` (dev):
```ts
export const environment = {
  production: false,
  useMock: true,
  servicePaths: { baseDomain: '', onboarding: '' },   // เติมตอนต่อ API จริง
  otpConfig: {
    otpRequestCooldownSeconds: 30,
    otpExpiryMinutes: 5,
    otpMaxAttempts: 3,
    otpResendMax: 3,
  },
};
```

`angular.json` build configurations — **fileReplacements** ต่อ env (Angular CLI schema เดียวกับ Nx project.json):
- `sit` → `environments.ts` ↔ `environments.sit.ts`
- `uat` → `environments.uat.ts`
- `production` → `environments.prod.ts`
- npm scripts: `start`, `build`, `build:sit`, `build:uat`, `build:prod`

---

## 13. CI/CD — Cloudflare Pages (Method B)

`.github/workflows/deploy.yml` (เลียนแบบ `sa-onboarding-demo`, ตัด APIM/MSAL inject เพราะ mock):
```yaml
name: Deploy to Cloudflare Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - name: Configure npm auth for @exim private registry
        run: |
          echo "@exim:registry=https://pkgs.dev.azure.com/eximth/_packaging/eximth/npm/registry/" > .npmrc
          echo "always-auth=true" >> .npmrc
          echo "//pkgs.dev.azure.com/eximth/_packaging/eximth/npm/registry/:_authToken=${{ secrets.AZURE_ARTIFACTS_TOKEN }}" >> .npmrc
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build           # production
      - name: Create Pages project (first run)
        uses: cloudflare/wrangler-action@v3
        continue-on-error: true
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages project create onboarding-mobile --production-branch main
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist/onboarding-mobile/browser --project-name onboarding-mobile --branch main --commit-dirty=true
```
**Build output:** `dist/onboarding-mobile/browser` (Angular CLI default)
**Required GitHub Secrets (user ต้อง set เอง — เป็น credential ที่ AI fabricate ไม่ได้, และเครื่องนี้ไม่มี `gh` CLI):**
```
gh secret set AZURE_ARTIFACTS_TOKEN  --repo Supakorn08/onboarding-mobile --body "<azure-pat-base64>"
gh secret set CLOUDFLARE_API_TOKEN   --repo Supakorn08/onboarding-mobile --body "<cf-token>"   # scope: Account→Cloudflare Pages→Edit
gh secret set CLOUDFLARE_ACCOUNT_ID  --repo Supakorn08/onboarding-mobile --body "<cf-account-id>"
```
> Fallback (no `gh`): GitHub repo → Settings → Secrets and variables → Actions → New repository secret
> SPA routing: ห้ามมี `404.html` ใน build (ให้ Cloudflare serve index.html ทุก path)

---

## 14. Success Criteria

1. `npm install` (หลัง Azure auth) + `npm start` รันได้
2. Landing → Register → OTP → Terms → Success ครบ happy path
3. ทุก error/edge state เข้าถึงได้ตาม mock trigger (README table)
4. Responsive: desktop phone-frame กึ่งกลาง, mobile (375px) เต็มจอ
5. โครง `app/` + convention ตรง HostApp/FX (standalone, signals, `.state.ts`, lazy, services-per-domain)
6. `useMock:false` → service ยิง HttpClient (ไม่แก้ component)
7. `flowGuard` กัน refresh/deep-link พัง
8. README: auth+install+run + mock triggers; deploy.yml + คำสั่ง set secrets
9. push `main` → GitHub Actions deploy Cloudflare (เมื่อ secrets ครบ)

---

## 15. Migration Notes (→ shell จริง)
- `pages/{name}/*` ก๊อปเข้า `apps/shell/src/app/pages/` ตรง (convention เดียวกัน)
- `subscription.service.ts` → `services/onboarding-service/`, ลบ mock branch, ใช้ `servicePaths` จริง + `ApiResponse<T>`/`ApiErrorResponse` จาก `@exim/auth-sdk`
- `OnboardingFlowState`/pages = signals + `.state.ts` แบบเดียวกัน → ไม่แก้ pattern
- i18n: `.message.ts` (ไทย hardcode) → แปลงเป็น `$localize`/ARB ตอนเข้า shell
- Success exit: เปลี่ยน reset→`/` เป็นปิด LIFF/กลับ host

---

## 16. Resolved Open Items (จาก verification)
1. ✅ Flow order = Landing→Register→**OTP→Terms**→Success (connector-traced)
2. ✅ `ApiResponse<T>` = `{data?, meta:{traceId,timestamp,path}}` + `ApiErrorResponse` (RFC 7807)
3. servicePaths onboarding key = placeholder (เติมตอนต่อ API จริง)
4. ✅ ex-component APIs verified (§4)
5. ✅ design tokens verified (#034EA1, Anuphan/Sarabun, space/radius/text.size)
6. ✅ icon names: `chevron-left`, `check`
7. ✅ OTP: expiry 5 นาที, maxAttempts 3, cooldown 30s, resendMax 3 (env.otpConfig); lock 15 นาที
8. terms content = placeholder PDPA-style (mock)
9. ✅ ID validation = length-only 13 หลัก (no checksum) → mock trigger ถึง NOT_FOUND
10. ✅ NOT_FOUND = modal (ตัด /result page); OTP submit = explicit button
11. ✅ Design inconsistency: เลือก email-first layout (11/13 frames)
```
