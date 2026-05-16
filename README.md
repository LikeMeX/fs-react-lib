# @likemex/fs-react-lib

[![npm](https://img.shields.io/npm/v/@likemex/fs-react-lib.svg)](https://www.npmjs.com/package/@likemex/fs-react-lib)
[![license](https://img.shields.io/npm/l/@likemex/fs-react-lib.svg)](LICENSE)

Shared in-app AI assistant ("FS AI") chat widget for Next.js apps. REST + Server-Sent Events streaming. Drop-in panel + floating button + Next.js API proxy + Tailwind tokens.

Ships:

- `<AssistantPanel>` — slide-in chat drawer (general or course-aware modes).
- `<AssistantNavButton>` — toggle button (inline or floating FAB).
- `<AssistantContextProvider>` + `useAssistant()` — panel open/close state, persisted to `localStorage`.
- `configureFsAi({ getToken })` — wires host app auth into the FS AI Axios client.
- `createFsAiProxyHandler()` — Next.js API route factory that proxies `/api/fs-ai/**` to the upstream origin and injects the server-only `X-API-Key`.
- Hooks: `useAssistantConversation`, `useAssistantPhase`, `useAssistantStream`.
- Helpers: `buildLearningMetadata`, `canUseLearningAssistant`, `isFsAiApiConfigured`, conversation history store, user-profile store, SSE decoder, markdown sanitizer.

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
                            <AssistantNavButton floating canUse />
                            <AssistantPanel surface="general" canUse />
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

`tailwind.config.js`:

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

## Tailwind tokens subpath

```js
// CommonJS (tailwind.config.js)
const tokens = require('@likemex/fs-react-lib/tailwind-tokens');
// → { primaryFS, pinkFS, blackFS, successFS }
```

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
