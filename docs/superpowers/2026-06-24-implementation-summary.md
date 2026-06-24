# onboarding-mobile — Implementation Summary

**Date:** 2026-06-24 · **Repo:** `github.com/Supakorn08/onboarding-mobile` (branch `main`)
**Spec:** [`specs/2026-06-23-onboarding-mobile-frontend-design.md`](specs/2026-06-23-onboarding-mobile-frontend-design.md) · **Plan:** [`plans/2026-06-23-onboarding-mobile.md`](plans/2026-06-23-onboarding-mobile.md)

A clean, mock-data Angular 21 frontend for the EXIM SuperApp **"สมัครรับข่าวสารผ่าน LINE"** (LINE-connectivity, corporate/juristic subscribe) onboarding flow — built to mirror `Frontend_HostAppSuperApp` conventions and the `@exim/ui-kit` design system, ready to swap mock → real API by flipping one flag.

---

## ✅ สิ่งที่ทำเสร็จ (Done & verified)

| Area | Status |
|------|--------|
| Angular 21 CLI standalone scaffold (zoneless→zone for ng-zorro, vitest) | ✅ |
| 5 pages: Landing → Register → OTP → Terms → Success (flow order verified vs Figma) | ✅ |
| Logic layer: `ApiResponse<T>`/`ApiErrorResponse`, validators, mock + service, flow state, `flowGuard` | ✅ |
| All business taxonomy isolated in `subscription.mock.ts` (pages/state only render flags) | ✅ |
| Mock triggers reach every error/edge state (inline + bottom-sheet modals) | ✅ |
| Responsive: desktop centered phone-frame + mobile full-bleed (375px) | ✅ verified both widths |
| `@exim/ui-kit` consumed (button, input-field, input-otp, modal, alert, icon, title) | ✅ |
| Cloudflare Pages CI workflow authored | ✅ (see action item #1) |
| README + spec + plan + this summary | ✅ |

**Verification evidence**
- `npm run build` (production) → exit 0; output `dist/onboarding-mobile/browser`
- `npx ng test --watch=false` → **20/20 vitest specs pass** (validators, mock, flow-state, guard, 5 page smokes, app)
- Headless-Chrome screenshots of all 5 screens at **1440px and 390px**; Playwright width measurements confirm no horizontal overflow (`docScrollW=390`) and all 8 OTP boxes fit (span 12→364px in a 390px frame).

**Commits on `main`**
```
118bd4e fix(responsive): mobile layout fits within viewport on all screens
fff69bd docs: project README
4448978 feat: terms page (scroll-gated PDPA -> subscribe -> success)
fbdd26b feat: otp page (8-digit, states, resend cooldown, exceeded modal)
f2613fc feat: register page (eligibility states + modals)
53ec392 fix(deps): declare quill + ngx-quill (peer deps of @exim/ui-kit barrel)
350de92 feat: landing + success pages
cdc77b9 feat: responsive onboarding layout + top-bar/brand-backdrop + result-modal
aeae8c2 feat: logic layer (models, validators, mock+service, flow state, routes+guard)
e0266d4 feat: scaffold Angular 21 app foundation
(+ 9c5f7f1 spec, f8f4638 plan)
```

---

## 🔴 ต้องทำเอง (User action required — credentials only I cannot provide)

### 1. เพิ่มไฟล์ CI workflow เข้า remote
`/.github/workflows/deploy.yml` ถูกสร้างไว้ในเครื่องแล้ว **แต่ push ขึ้น GitHub ไม่ได้** เพราะ git credential ของเครื่องนี้ (PAT) ไม่มี `workflow` scope. เลือกทางใดทางหนึ่ง:
- **GitHub UI:** repo → Add file → Create new file → path `.github/workflows/deploy.yml` → วางเนื้อหาด้านล่าง → Commit
- **หรือ** re-auth git ด้วย token ที่มี `workflow` scope แล้ว push ไฟล์นี้

<details><summary>เนื้อหา <code>.github/workflows/deploy.yml</code> ฉบับเต็ม (วางได้เลย)</summary>

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Configure npm auth for @exim private registry
        run: |
          echo "@exim:registry=https://pkgs.dev.azure.com/eximth/_packaging/eximth/npm/registry/" > .npmrc
          echo "always-auth=true" >> .npmrc
          echo "//pkgs.dev.azure.com/eximth/_packaging/eximth/npm/registry/:_authToken=${{ secrets.AZURE_ARTIFACTS_TOKEN }}" >> .npmrc

      - name: Install dependencies
        run: npm install

      - name: Build (production)
        run: npm run build

      - name: Create Cloudflare Pages project (first run only)
        uses: cloudflare/wrangler-action@v3
        continue-on-error: true
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages project create onboarding-mobile --production-branch main

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist/onboarding-mobile/browser --project-name onboarding-mobile --branch main --commit-dirty=true
```
</details>

### 2. ตั้ง GitHub repository secrets 3 ตัว
```bash
gh secret set AZURE_ARTIFACTS_TOKEN  --repo Supakorn08/onboarding-mobile --body "<azure-artifacts-PAT-base64>"   # Packaging: Read on pkgs.dev.azure.com/eximth
gh secret set CLOUDFLARE_API_TOKEN   --repo Supakorn08/onboarding-mobile --body "<cf-token>"                    # scope: Account -> Cloudflare Pages -> Edit
gh secret set CLOUDFLARE_ACCOUNT_ID  --repo Supakorn08/onboarding-mobile --body "<cf-account-id>"               # dash.cloudflare.com/<ACCOUNT_ID>
```
ไม่มี `gh` (เครื่องนี้ก็ไม่มี): GitHub repo → Settings → Secrets and variables → Actions → New repository secret

> **สำคัญ:** จนกว่าจะทำ #1 **และ** #2 ครบ — **ยังไม่มี CI deploy เกิดขึ้นเลย** (workflow ยังไม่อยู่บน remote) และเมื่อเพิ่มแล้ว run จะ **แดงจนกว่า secrets ครบ** ทั้งสองเรื่องนี้คือ "รอ credential ของคุณ" ไม่ใช่ bug. Cloudflare API token/account id — ผม fabricate ให้ไม่ได้ และเครื่องนี้ไม่มีเก็บไว้

### 3. รัน local
```bash
npx vsts-npm-auth -config .npmrc   # auth เข้า Azure Artifacts (ครั้งเดียว)
npm install
npm start                          # http://localhost:4200
```

---

## ⚠️ ข้อควรรู้ (Notes & known limitations)

- **`@exim/ui-kit` ใช้ vendored copy v1.5.2 ตอน build ในเครื่องนี้** (จาก `sa-onboarding-demo/node_modules`) เพราะ Azure Artifacts auth ไม่มีในเครื่อง. `package.json` ระบุ `^1.6.10` — CI/เครื่องคุณ (หลัง auth) จะดึงตัวจริง. API ที่ใช้ verify จาก source 1.6.10 ตรงกับ 1.5.2 ที่ใช้ build จริง
- **OTP 8 ช่อง:** `ex-input-otp` มี natural width ~440px (กว้างกว่าจอ 375–390px) → ใส่ `transform: scale(0.8)` ให้ครบ 8 ช่องบนมือถือ (ตรงสไตล์ Figma ที่ช่องเล็ก). ถ้า ui-kit รุ่นใหม่ปรับ box ให้ responsive เอง สามารถลบ scale นี้ได้
- **quill/ngx-quill** ประกาศเป็น dependency แม้ไม่ได้ใช้ text-editor — เพราะ `@exim/ui-kit` barrel re-export `TextEditorComponent` ดึง quill ตอน build
- **Test = vitest/jsdom** (Angular 21 default) ไม่ใช่ Karma — page specs เป็น smoke (creates); logic (validators/mock/state/guard) มี unit test จริง ตาม spec ที่ deprioritize test coverage
- **ยังไม่ได้ทดสอบ end-to-end แบบกรอกจริงผ่าน UI** (ไม่มี Playwright ใน deps ของ project) — happy path + error mapping มี unit test ที่ระดับ mock/state; ทุกจอ render ผ่านจริงด้วย screenshot

---

## 🔁 Migration → shell (Frontend_HostAppSuperApp)
- `src/app/pages/{name}/*` ก๊อปเข้า `apps/shell/src/app/pages/` ตรง (convention เดียวกัน)
- `subscription.service.ts`: ลบ `useMock` branch, ใส่ `servicePaths` จริง, ใช้ `ApiResponse`/`ApiErrorResponse` จาก `@exim/auth-sdk`
- `.message.ts` (ไทย hardcode) → `$localize`/ARB; Success exit (`reset()`→`/`) → ปิด LIFF/กลับ host
- รายละเอียดเพิ่มใน spec §15
