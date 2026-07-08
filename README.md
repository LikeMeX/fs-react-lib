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

This package ships **two token layers**. Pick the one that matches your app — you do not need to open `colors.js` in the repo to use them; everything is published as npm subpath exports.

### How to discover what's available

| Where to look | What you get |
|---------------|--------------|
| **This README** | Usage patterns, class names, and which subpath to import |
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

Use this layer when you only embed the AI assistant and want matching colors without pulling the full design system.

### Layer 2 — Full FutureSkill design system (`/tailwind-preset` + `/colors`)

Source of truth for FutureSkill product UIs: raw scales, semantic aliases, light/dark `colorsSemantic`, and per-app overrides.

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

Example classes after preset: `bg-purple-500`, `text-colorsSemantic-light-text-brand`, `bg-mainBrand-light-1000`, `border-assessment-openEnded-200`.

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
│   ├── raw            → neutral, purple, green, red, primary (CSS vars), accent, …
│   ├── semantic       → primary, background, foreground
│   └── themeExtensions → mainBrand, secondaryBrand, basicBase, assessment, ojt, neutralSolid()
└── apps
    ├── fsBizPanel
    ├── fsContentPanel
    └── fsAssessmentPanel
```

#### CSS custom properties required by the preset

Some preset values use `color-mix()` with CSS variables. Define these in your global CSS (e.g. `:root` or a theme provider) before relying on `mainBrand`, `secondaryBrand`, `basicBase`, `assessment`, or `ojt` utilities:

```css
:root {
  --color-primary-500: #842CDD;
  --color-primary-300: #AB74E9;
  --color-deepPink-500: #FF1A8F;
  --color-deepPink-300: #ff6bae;
  --color-neutral-50: #ffffff;
  --color-blueViolet-500: #472CDD;
  --color-burntOrange-500: #DB7725;
  --color-forestGreen-50: #E8F5E9;
  --color-forestGreen-500: #3B6D11;
  --color-vividGreen-50: #E5F6EA;
  --color-vividGreen-500: #00B35A;
  --color-info-50: #F4FBFF;
  --color-info-500: #3C9FFC;
}
```

Raw hex scales (`purple`, `green`, `neutral`, …) work without these variables.

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
