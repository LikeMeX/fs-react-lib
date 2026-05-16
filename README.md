# @fs/assistant

Shared in-app AI assistant ("FS AI") for the FutureSkill frontend workspace. Talks to `demo-ai.futureskill.co` via REST + SSE. Ships:

- `<AssistantPanel>` — slide-in chat drawer (general or course-aware modes).
- `<AssistantNavButton>` — toggle button (inline or floating FAB).
- `<AssistantContextProvider>` — panel open/close state, persisted to `localStorage`.
- `configureFsAi({ getToken })` — wires the host app's auth into the FS AI Axios client.
- `createFsAiProxyHandler()` — Next.js API factory that proxies `/api/fs-ai/**` to the upstream FS AI origin with the server-only `X-API-Key` injected.
- Hooks: `useAssistantConversation`, `useAssistantPhase`, `useAssistantStream`.
- Helpers: `buildLearningMetadata`, `canUseLearningAssistant`, `isFsAiApiConfigured`, conversation history store, user-profile store, SSE decoder, markdown sanitizer.

## Install

The package lives at `packages/fs-assistant` inside the `frontend/` pnpm workspace. Consumers add it as a workspace dep:

```jsonc
// frontend/<app>/package.json
{
    "dependencies": {
        "@fs/assistant": "workspace:*"
    }
}
```

Peer deps (any modern combination works):

- `react` ^17 || ^18, `react-dom` ^17 || ^18
- `next` ^12 || ^13 || ^14
- `axios` >=0.24
- `antd` ^5 + `@ant-design/cssinjs` ^1
- `@tanstack/react-query` ^4
- `react-icons` ^4 || ^5
- `react-markdown` ^7 || ^8
- `remark-gfm` ^3 || ^4

## Wiring (Next.js Pages Router)

In your `pages/_app.tsx`:

```tsx
import {
    AssistantContextProvider,
    AssistantPanel,
    AssistantNavButton,
    configureFsAi,
} from '@fs/assistant';
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

Add `pages/api/fs-ai/[[...slug]].ts`:

```ts
import { createFsAiProxyHandler } from '@fs/assistant';

export const config = { api: { bodyParser: false, responseLimit: false as const } };
export default createFsAiProxyHandler();
```

Add to your `tailwind.config.js`:

```js
const assistantTokens = require('@fs/assistant/tailwind-tokens');

module.exports = {
    content: [
        // ...existing paths...
        '../packages/fs-assistant/src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // existing app colors...
                blackFS: assistantTokens.blackFS,
                successFS: assistantTokens.successFS,
            },
        },
    },
};
```

For Next 12 add to `next.config.js`:

```js
const withTM = require('next-transpile-modules')(['@fs/assistant']);
module.exports = withTM({ /* ... */ });
```

(Next 13+: use `transpilePackages: ['@fs/assistant']` instead.)

## Env vars

| Var | Side | Purpose |
|-----|------|---------|
| `NEXT_PUBLIC_FS_AI_USE_PROXY` | Client | Set `"true"` to route through the Next API proxy (recommended). |
| `NEXT_PUBLIC_FS_AI_API_URL` | Client | Direct upstream origin (when proxy is disabled). |
| `FS_AI_API_URL` | Server | Upstream origin used by the proxy factory. |
| `FS_AI_X_API_KEY` | Server | Required by the upstream; never sent to the browser. |
| `NEXT_PUBLIC_LEARNING_ASSISTANT_SHOW_FOR_ALL` | Client | Dev flag — show the assistant regardless of pass entitlement. |

## Modes

`AssistantPanel` accepts a `modes` prop. When `modes.length === 1` the ModePicker screen is skipped and the chat opens directly. fs-learn-app passes all 5 modes (`general`, `before_class`, `during_class`, `after_class`, `apply`). fs-main and fs-ecommerce pass `['general']` (default).

`courseId` is optional. When omitted:

- `learning_mode='general'` is set at conversation creation.
- `patchLearningMode` is skipped.
- `learning_state.course_id` is omitted from message metadata.
- Conversation history is bucketed under `surface='general'` with `courseId=null`.

## API

```ts
import {
    AssistantPanel,
    AssistantNavButton,
    AssistantContextProvider,
    useAssistant,
    configureFsAi,
    fsAiApi,
    useAssistantConversation,
    useAssistantPhase,
    useAssistantStream,
    buildLearningMetadata,
    canUseLearningAssistant,
    isFsAiApiConfigured,
    listAssistantConversations,
    upsertAssistantConversation,
    removeAssistantConversation,
    createFsAiProxyHandler,
} from '@fs/assistant';
```

See [`src/index.ts`](src/index.ts) for the full surface.

## Tests

Unit tests for the shared helpers live in fs-learn-app's jest suite (`fs-learn-app/helpers/learning/__tests__/`) and exercise the package via its workspace symlink:

```bash
pnpm --filter fs-learn-app test
```

Coverage includes: SSE payload decoding, markdown sanitizer, source filtering, conversation history (incl. general bucket), learning metadata builder, entitlement gate, proxy handler error paths.
