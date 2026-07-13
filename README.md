# @likemex/fs-react-lib

[![npm](https://img.shields.io/npm/v/@likemex/fs-react-lib.svg)](https://www.npmjs.com/package/@likemex/fs-react-lib)
[![license](https://img.shields.io/npm/l/@likemex/fs-react-lib.svg)](LICENSE)

Shared in-app AI assistant ("FS AI") chat widget for Next.js apps. REST + Server-Sent Events streaming. Drop-in panel + floating button + Next.js API proxy + **FutureSkill design tokens** (assistant palette + full Tailwind preset).

Ships:

- `<AssistantPanel>` — slide-in chat drawer (general or course-aware modes).
- `<AssistantNavButton>` — toggle button (inline or floating FAB).
- `<AssistantContextProvider>` + `useAssistant()` — panel open/close state, persisted to `localStorage`.
- `configureFsAi({ getToken })` — wires host app auth into the FS AI Axios client.
- `createFsAiProxyHandler()` — Next.js API route factory that proxies `/api/fs-ai/**` to the upstream origin and injects the server-only `X-API-Key`.
- Hooks: `useAssistantConversation`, `useAssistantPhase`, `useAssistantStream`.
- Helpers: `buildLearningMetadata`, `canUseLearningAssistant`, `isFsAiApiConfigured`, conversation history store, user-profile store, SSE decoder, markdown sanitizer.
- **Design tokens**: `/tailwind-tokens` (assistant), `/tailwind-preset` + `/colors` (full FS design system) — see [Design tokens](#design-tokens).

## Install

```bash
npm install @likemex/fs-react-lib
# or
pnpm add @likemex/fs-react-lib
# or
yarn add @likemex/fs-react-lib
```

Peer deps (install whichever your app uses):

- `react` ^17 || ^18 + `react-dom` ^17 || ^18
- `next` ^12 || ^13 || ^14
- `axios` >=0.24
- `antd` ^5 + `@ant-design/cssinjs` ^1
- `@tanstack/react-query` ^4
- `react-icons` ^4 || ^5
- `react-markdown` ^7 || ^8
- `remark-gfm` ^3 || ^4

## Quick start (Next.js Pages Router)

### 1. Wire `pages/_app.tsx`

```tsx
import {
    AssistantContextProvider,
    AssistantPanel,
    AssistantNavButton,
    configureFsAi,
} from '@likemex/fs-react-lib';
import { auth } from 'services/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntdApp } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import 'antd/dist/reset.css';

configureFsAi({ getToken: () => auth.getToken() ?? null });
const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#842CDD' } }}>
            <AntdApp>
                <StyleProvider hashPriority="high">
                    <QueryClientProvider client={queryClient}>
                        <AssistantContextProvider>
                            <Component {...pageProps} />
                            <LearningAssistantShell
                                isLoggedIn={isLoggedIn}
                                pathname={router.pathname}
                                userMember={assistantUserMember}
                            >
                                {/* app routes */}
                            </LearningAssistantShell>
                        </AssistantContextProvider>
                    </QueryClientProvider>
                </StyleProvider>
            </AntdApp>
        </ConfigProvider>
    );
}
```

### 2. Add the proxy route

`pages/api/fs-ai/[[...slug]].ts`:

```ts
import { createFsAiProxyHandler } from '@likemex/fs-react-lib';

export const config = { api: { bodyParser: false, responseLimit: false as const } };
export default createFsAiProxyHandler();
```

### 3. Tailwind tokens + content path

`tailwind.config.js` (assistant widget only — see [Design tokens](#design-tokens) for the full FutureSkill palette):

```js
const assistantTokens = require('@likemex/fs-react-lib/tailwind-tokens');

module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        // scan compiled lib so Tailwind picks up its classes
        './node_modules/@likemex/fs-react-lib/dist/**/*.{js,d.ts}',
    ],
    theme: {
        extend: {
            colors: {
                // merge into existing palette
                primaryFS: assistantTokens.primaryFS,
                pinkFS: assistantTokens.pinkFS,
                blackFS: assistantTokens.blackFS,
                successFS: assistantTokens.successFS,
            },
        },
    },
};
```

### 4. Next 12 ESM peer compat

The compiled lib is CJS but pulls in ESM-only peers (`react-markdown@8`, `remark-gfm@3`). Next 12 needs:

```js
// next.config.js
const withTM = require('next-transpile-modules')(['@likemex/fs-react-lib']);

module.exports = withTM({
    experimental: { esmExternals: 'loose' },
    // ...rest of your config
});
```

Next 13+: replace `next-transpile-modules` with built-in `transpilePackages: ['@likemex/fs-react-lib']`.

### 5. Env vars

```dotenv
NEXT_PUBLIC_FS_AI_USE_PROXY=true
FS_AI_API_URL=https://<your-fs-ai-host>
FS_AI_X_API_KEY=<server-only-key>
```

| Var | Side | Purpose |
|-----|------|---------|
| `NEXT_PUBLIC_FS_AI_USE_PROXY` | Client | `"true"` routes through the Next API proxy (recommended — keeps the API key server-side). |
| `NEXT_PUBLIC_FS_AI_API_URL` | Client | Direct upstream origin (when proxy disabled). |
| `FS_AI_API_URL` | Server | Upstream origin used by the proxy factory. |
| `FS_AI_X_API_KEY` | Server | `X-API-Key` header injected by the proxy. **Never exposed to the browser.** |
| `NEXT_PUBLIC_LEARNING_ASSISTANT_SHOW_FOR_ALL` | Client | Dev flag — show the assistant regardless of pass entitlement. |

## Modes

`AssistantPanel` accepts a `modes` prop. When `modes.length === 1` the ModePicker screen is skipped — chat opens directly.

```tsx
// Course-bound app (5-mode picker)
<AssistantPanel
    surface="watch"
    courseId={courseId}
    lessonId={lessonId}
    modes={['general', 'before_class', 'during_class', 'after_class', 'apply']}
/>

// General-only app (no picker, no course)
<AssistantPanel surface="general" />
```

`courseId` is optional. When omitted:

- `learning_mode='general'` is set at conversation creation.
- `patchLearningMode` is skipped.
- `learning_state.course_id` is omitted from message metadata.
- Conversation history is bucketed under `surface='general'` with `courseId=null`.

## Server-side rendering

`AssistantPanel` uses TanStack Query and reads `localStorage`. For pages built with `getStaticProps` (SSG), wrap the panel with `next/dynamic` to skip server render:

```tsx
import dynamic from 'next/dynamic';
const AssistantPanel = dynamic(
    () => import('@likemex/fs-react-lib').then(m => m.AssistantPanel),
    { ssr: false }
);
```

Pages using `getServerSideProps` or no data fetching do not need this — the QueryClientProvider in `_app` is sufficient.

## API surface

```ts
import {
    // Components
    AssistantPanel,
    AssistantNavButton,
    AssistantContextProvider,
    Composer,
    MessageList,
    MessageBubble,
    ModePicker,
    SuggestedActions,
    WelcomeMessage,
    ASSISTANT_PANEL_WIDTH,
    SUGGESTED_ACTIONS_BY_MODE,

    // Context
    useAssistant,
    AssistantContext,

    // Auth + service
    configureFsAi,
    fsAiApi,

    // Hooks
    useAssistantConversation,
    useAssistantPhase,
    useAssistantStream,

    // Helpers
    buildLearningMetadata,
    canUseLearningAssistant,
    isFsAiApiConfigured,
    listAssistantConversations,
    upsertAssistantConversation,
    removeAssistantConversation,
    readAssistantFullPagePreference,
    writeAssistantFullPagePreference,
    readAssistantUserProfile,
    writeAssistantUserProfile,
    clearAssistantUserProfile,
    isAssistantUserProfileComplete,
    decodeSseDataPayload,
    extractTextFromStreamJson,
    filterDisplayableAssistantSources,
    sanitizeAssistantMarkdown,
    visibleStripped,
    isOrphanListMarkerLine,

    // Proxy factory
    createFsAiProxyHandler,
} from '@likemex/fs-react-lib';
```

Full type definitions in `dist/index.d.ts`.

## Design tokens

This package ships **two token layers**. Pick the one that matches your app — you do not need to open `colors.js` in the repo to use them; everything is published as npm subpath exports. Hex values below are the source of truth for what each token looks like.

### How to discover what's available

| Where to look | What you get |
|---------------|--------------|
| **This README** | Usage patterns, **hex color reference**, class names, and which subpath to import |
| **`package.json` → `exports`** | Official entry points (IDE autocomplete on `@likemex/fs-react-lib/…`) |
| **Installed package** | After `pnpm add`, browse `node_modules/@likemex/fs-react-lib/` — shipped files: `tailwind-tokens.js`, `tailwind-preset.js`, `colors.js` |
| **[npm package page](https://www.npmjs.com/package/@likemex/fs-react-lib)** | Version, files list, and this README |

```jsonc
// package.json exports (authoritative list)
{
  "@likemex/fs-react-lib/tailwind-tokens": "…",  // assistant widget palette
  "@likemex/fs-react-lib/tailwind-preset": "…",  // full FS design-system preset
  "@likemex/fs-react-lib/colors": "…"            // raw token source (JS/TS)
}
```

### Layer 1 — Assistant widget tokens (`/tailwind-tokens`)

Minimal palette used by `<AssistantPanel>` and related components. Class names in the compiled lib look like `bg-primaryFS-500`, `text-blackFS-100`, `from-pinkFS-500`.

```js
const { primaryFS, pinkFS, blackFS, successFS } =
    require('@likemex/fs-react-lib/tailwind-tokens');
```

| Key | Scale | Example class |
|-----|-------|---------------|
| `primaryFS` | 50–900 | `bg-primaryFS-500` |
| `pinkFS` | 100–900 | `text-pinkFS-400` |
| `blackFS` | 100–900 | `border-blackFS-500` |
| `successFS` | 100–900 | `text-successFS-500` |

#### Color reference (hex)

```css
/* Assistant widget — @likemex/fs-react-lib/tailwind-tokens */

/* primaryFS */
--primaryFS-50: #F1E7FB;
--primaryFS-100: #DBC5F5;
--primaryFS-200: #C39EEF;
--primaryFS-300: #AB74E9;
--primaryFS-400: #9852E3;
--primaryFS-500: #842CDD;
--primaryFS-600: #7A27D6;
--primaryFS-700: #6C1CCD;
--primaryFS-800: #5E13C7;
--primaryFS-900: #4900B9;

/* pinkFS */
--pinkFS-100: #FEE6E2;
--pinkFS-200: #FDC9C5;
--pinkFS-300: #FBA8AB;
--pinkFS-400: #F7919F;
--pinkFS-500: #F36D8C;
--pinkFS-600: #D04F7A;
--pinkFS-700: #AE3669;
--pinkFS-800: #8C2259;
--pinkFS-900: #370337;

/* blackFS */
--blackFS-100: #FFFFFF;
--blackFS-200: #E6E6EA;
--blackFS-300: #BCBCC0;
--blackFS-400: #7E7E82;
--blackFS-500: #2E2E30;
--blackFS-600: #212129;
--blackFS-700: #171722;
--blackFS-800: #0E0E1B;
--blackFS-900: #080817;

/* successFS */
--successFS-100: #CCFBED;
--successFS-200: #9BF8D1;
--successFS-300: #68ECBC;
--successFS-400: #41D9A2;
--successFS-500: #0DC180;
--successFS-600: #09A576;
--successFS-700: #068A5A;
--successFS-800: #046F48;
--successFS-900: #025C3C;
```

Use this layer when you only embed the AI assistant and want matching colors without pulling the full design system.

### Layer 2 — Full FutureSkill design system (`/tailwind-preset` + `/colors`)

Source of truth for FutureSkill product UIs: raw hex scales, semantic aliases, `colorsSemantic` utilities, and per-app overrides.

**Recommended — Tailwind preset** (generates all utility classes for you):

```js
// tailwind.config.js
const createPreset = require('@likemex/fs-react-lib/tailwind-preset');

module.exports = {
    presets: [
        createPreset('fsBizPanel'),   // or 'fsContentPanel' | 'fsAssessmentPanel'
        // createPreset()              // core-only, no panel-specific colors
    ],
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
};
```

Example classes after preset: `bg-purple-500`, `bg-deepPink-500`, `text-colorsSemantic-text-brand`, `bg-colorsSemantic-fill-brandStrong`.

**Programmatic access** (charts, inline styles, Ant Design `theme.token`, etc.):

```js
const tokens = require('@likemex/fs-react-lib/colors');

tokens.core.raw.purple[500];           // '#842CDD'
tokens.core.semantic.primary.DEFAULT;  // '#842CDD'
tokens.apps.fsBizPanel.rawColors;      // panel-specific extras
```

#### `colors.js` structure

```
colors
├── core
│   ├── raw       → neutral, purple, green, red, primary (CSS vars), accent, …
│   └── semantic  → primary, background, foreground
└── apps
    ├── fsBizPanel
    ├── fsContentPanel
    └── fsAssessmentPanel
```

Full dump of every named key (`gray.*`, `dark.*`, …) lives in `@likemex/fs-react-lib/colors` — the hex blocks below cover the scales developers use day-to-day.

#### Color reference (hex)

```css
/* Brand — core.raw */
--purple-50: #F1E7FB;
--purple-100: #DBC5F5;
--purple-200: #C39EEF;
--purple-300: #AB74E9;
--purple-400: #9852E3;
--purple-500: #842CDD;
--purple-600: #7A27D6;
--purple-700: #6C1CCD;
--purple-800: #5E13C7;
--purple-900: #4900B9;

--purpleDeep-50: #f8f0ff;
--purpleDeep-100: #f7f0ff;
--purpleDeep-200: #e9d6ff;
--purpleDeep-300: #cfadff;
--purpleDeep-400: #b485ff;
--purpleDeep-500: #975DFF;
--purpleDeep-600: #7343d9;
--purpleDeep-700: #542eb3;
--purpleDeep-800: #391d8c;
--purpleDeep-900: #261466;

--deepPink-50: #ffe6ee;
--deepPink-100: #ffbdd6;
--deepPink-200: #ff94c1;
--deepPink-300: #ff6bae;
--deepPink-400: #ff429e;
--deepPink-500: #FF1A8F;
--deepPink-600: #D90b7c;
--deepPink-700: #b30068;
--deepPink-800: #8C0056;
--deepPink-900: #660042;

/* Status */
--green-500: #00b35A;
--green-700: #009244;
--red-500: #ff3733;
--red-700: #e41f2d;
--yellow-500: #edb500;
--yellow-700: #ed9600;

--success-DEFAULT: #0DC180;
--success-50: #f2fbf7;
--success-100: #CCFBED;
--success-200: #9BF8D1;
--success-300: #68ECBC;
--success-400: #41D9A2;
--success-500: #0DC180;
--success-600: #09A576;
--success-700: #068A5A;
--success-800: #046F48;
--success-900: #025C3C;

--warning-DEFAULT: #FFC832;
--warning-50: #fefbf2;
--warning-100: #FFF8D6;
--warning-200: #FFEFAD;
--warning-300: #FFE483;
--warning-400: #FFDA65;
--warning-500: #FFC832;
--warning-600: #DBA524;
--warning-700: #B78419;
--warning-800: #93650F;
--warning-900: #7A4F09;

--danger-DEFAULT: #FF3F3F;
--danger-50: #fef5f5;
--danger-100: #FFD8D8;
--danger-200: #FFB2B2;
--danger-300: #FF8B8B;
--danger-400: #FF6F6F;
--danger-500: #FF3F3F;
--danger-600: #DB2E2E;
--danger-700: #B71F1F;
--danger-800: #931414;
--danger-900: #7A0C0C;

/* Neutrals */
--black-DEFAULT: #080817;
--black-100: #FFFFFF;
--black-200: #E6E6EA;
--black-300: #BCBCC0;
--black-400: #7E7E82;
--black-500: #2E2E30;
--black-600: #212129;
--black-700: #171722;
--black-800: #0E0E1B;
--black-900: #080817;

--baseLight-500: #191919;
--neutral-50: #ffffff;
--neutral-100: #fafafa;

/* Accent / assessment & OJT tags */
--accent-teal: #11C7BC;
--accent-paleBlue: #B5D2FF;
--accent-fscourse: #FF63A8;
--accent-blueViolet-50: #EDE7F6;
--accent-blueViolet-500: #472CDD;
--accent-burntOrange-500: #DB7725;
--accent-forestGreen-50: #E8F5E9;
--accent-forestGreen-500: #3B6D11;
--accent-vividGreen-50: #E5F6EA;
--accent-vividGreen-500: #00B35A;
--info-50: #F4FBFF;
--info-500: #3C9FFC;
--info-600: #3388EC;
--info-700: #0F8EFF;

/* Semantic — core.semantic */
--semantic-primary: #842CDD;
--semantic-primary-hover: #6C1CCD;
--semantic-primary-border: #7A27D6;
--semantic-primary-selectedBg: #DBC5F5;
--semantic-primary-foreground: #ffffff;
--semantic-background: #ffffff;
--semantic-foreground: #0a0f18;
```

#### App-specific colors

```css
/* fsContentPanel */
--classroom: #C4A9FF;
--embledlink: #FFE088;
--body: #161c27;
--fsSubCategory: #FC3287;
--lbody: #E8EAEC;
--lgreen: #97C711;
--limeGreen: #B1D941;
--paleMint: #D1FFE9;
--slateGray: #4C525F;
--nearBlack: #181717;
--terracotta: #D45454;
--oliveYellow: #C5C500;

/* fsBizPanel */
--classroom: #C4A9FF;
--classroomOnsite: #0fa73a4d;
--classroomOnline: #edb50066;
--tagClassroomOnline: #3D67FD;
--tagClassroomOnSite: #ED8F0A;
--learningPath: #93C4FF;
--information: #1A74A8;
--body: #161c27;
--sub-table: #05080C;
--ci-1: #0A0F18;
--embledlink: #FFE088;
--brightRed: #FF3C3C;
--deepIndigo: #2B0BA9;
--lavender: #977DFF;

/* fsAssessmentPanel */
--lightBG-100: #F9F9FE;
--setting-100: #FCF9FF;
```

#### CSS custom properties required by the preset

Some preset values use `color-mix()` / `var(--color-*)`. Define these in your global CSS (e.g. `:root` or a theme provider) before relying on `colorsSemantic` utilities. Recommended hex values map from the raw scales above (`primary` ← `purple`):

```css
:root {
  /* primary scale (theme-switchable) — map from purple */
  --color-primary-50: #F1E7FB;
  --color-primary-100: #DBC5F5;
  --color-primary-200: #C39EEF;
  --color-primary-300: #AB74E9;
  --color-primary-400: #9852E3;
  --color-primary-500: #842CDD;
  --color-primary-600: #7A27D6;
  --color-primary-700: #6C1CCD;
  --color-primary-800: #5E13C7;
  --color-primary-900: #4900B9;

  --color-deepPink-500: #FF1A8F;
  --color-baseLight-500: #191919;
  --color-neutral-50: #ffffff;

  --color-red-500: #ff3733;
  --color-yellow-500: #edb500;
  --color-green-500: #00b35A;

  --color-blueViolet-500: #472CDD;
  --color-burntOrange-500: #DB7725;
  --color-forestGreen-500: #3B6D11;
  --color-vividGreen-500: #00B35A;
  --color-info-500: #3C9FFC;
}
```

Raw hex scales (`purple`, `green`, `neutral`, …) work as Tailwind colors without these variables. `primary-*` utilities resolve to `var(--color-primary-*)` and need the block above.

### Which layer should I use?

| Your app | Import |
|----------|--------|
| Only embeds the AI assistant widget | `/tailwind-tokens` |
| FutureSkill panel / product UI (biz, content, assessment) | `/tailwind-preset` with the matching app name |
| Need token values in JS (charts, Ant Design, canvas) | `/colors` |
| Unsure what class names exist | Inspect `node_modules/@likemex/fs-react-lib/dist/**/*.js` or run Tailwind with `DEBUG=tailwindcss` |

## Prerequisites

- **Node.js** 24 (use `nvm install 24` / `asdf install nodejs 24` or download from nodejs.org)
- **pnpm** — install with `npm i -g pnpm`
- Active branch: `feat/enterprise-v2`

## Development

```bash
git clone https://github.com/LikeMeX/fs-react-lib.git
cd fs-react-lib
pnpm install
pnpm run build    # tsc → dist/
pnpm run lint     # tsc --noEmit
```

Publish (maintainers): tag a release, GitHub Action runs build + `npm publish --provenance`. See [`.github/workflows/publish.yaml`](.github/workflows/publish.yaml).

## License

[MIT](LICENSE) © LikeMeX
