"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBubble = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_markdown_1 = __importDefault(require("react-markdown"));
const remark_gfm_1 = __importDefault(require("remark-gfm"));
const remark_math_1 = __importDefault(require("remark-math"));
const rehype_katex_1 = __importDefault(require("rehype-katex"));
const sanitizeAssistantMarkdown_1 = require("../helpers/sanitizeAssistantMarkdown");
const filterAssistantSources_1 = require("../helpers/filterAssistantSources");
const TypingIndicator_1 = require("./TypingIndicator");
function nodeHasContent(node) {
    if (node == null || node === false)
        return false;
    if (typeof node === 'string')
        return (0, sanitizeAssistantMarkdown_1.visibleStripped)(node).length > 0;
    if (typeof node === 'number')
        return true;
    if (Array.isArray(node))
        return node.some(nodeHasContent);
    if (react_1.default.isValidElement(node))
        return nodeHasContent(node.props.children);
    return false;
}
function mdastHasContent(node) {
    if (typeof node.value === 'string' && (0, sanitizeAssistantMarkdown_1.visibleStripped)(node.value).length > 0)
        return true;
    if (Array.isArray(node.children))
        return node.children.some(mdastHasContent);
    return false;
}
function pruneEmptyListItems() {
    return (tree) => {
        const walk = (node) => {
            if (!Array.isArray(node.children))
                return;
            if (node.type === 'list') {
                node.children = node.children.filter(child => child.type !== 'listItem' || mdastHasContent(child));
            }
            node.children.forEach(walk);
        };
        walk(tree);
    };
}
const markdownComponents = {
    p: ({ children }) => (0, jsx_runtime_1.jsx)("p", { className: "mb-2 last:mb-0", children: children }),
    h1: ({ children }) => (0, jsx_runtime_1.jsx)("h1", { className: "mb-2 mt-3 text-base font-bold", children: children }),
    h2: ({ children }) => (0, jsx_runtime_1.jsx)("h2", { className: "mb-2 mt-3 text-base font-semibold", children: children }),
    h3: ({ children }) => (0, jsx_runtime_1.jsx)("h3", { className: "mb-2 mt-3 text-sm font-semibold", children: children }),
    h4: ({ children }) => (0, jsx_runtime_1.jsx)("h4", { className: "mb-1 mt-2 text-sm font-semibold", children: children }),
    ul: ({ children }) => (nodeHasContent(children) ? (0, jsx_runtime_1.jsx)("ul", { className: "mb-2 list-disc pl-5", children: children }) : null),
    ol: ({ children }) => nodeHasContent(children) ? (0, jsx_runtime_1.jsx)("ol", { className: "mb-2 list-decimal pl-5", children: children }) : null,
    li: ({ children }) => (nodeHasContent(children) ? (0, jsx_runtime_1.jsx)("li", { className: "mb-1", children: children }) : null),
    strong: ({ children }) => (0, jsx_runtime_1.jsx)("strong", { className: "font-semibold", children: children }),
    em: ({ children }) => (0, jsx_runtime_1.jsx)("em", { className: "italic", children: children }),
    a: ({ children, href }) => ((0, jsx_runtime_1.jsx)("a", { href: href, target: "_blank", rel: "noopener noreferrer", className: "text-primaryFS-200 underline", children: children })),
    code: ({ inline, children }) => inline ? ((0, jsx_runtime_1.jsx)("code", { className: "rounded bg-black/30 px-1 py-0.5 text-xs", children: children })) : ((0, jsx_runtime_1.jsx)("code", { className: "block", children: children })),
    pre: ({ children }) => ((0, jsx_runtime_1.jsx)("pre", { className: "mb-2 overflow-x-auto rounded-md bg-black/40 p-2 text-xs", children: children })),
    blockquote: ({ children }) => ((0, jsx_runtime_1.jsx)("blockquote", { className: "mb-2 border-l-2 border-primaryFS-400 pl-2 italic opacity-90", children: children })),
    hr: () => (0, jsx_runtime_1.jsx)("hr", { className: "my-2 border-blackFS-500" }),
    table: ({ children }) => ((0, jsx_runtime_1.jsx)("div", { className: "mb-2 overflow-x-auto", children: (0, jsx_runtime_1.jsx)("table", { className: "w-full border-collapse text-xs", children: children }) })),
    th: ({ children }) => (0, jsx_runtime_1.jsx)("th", { className: "border border-blackFS-500 px-2 py-1 text-left", children: children }),
    td: ({ children }) => (0, jsx_runtime_1.jsx)("td", { className: "border border-blackFS-500 px-2 py-1", children: children }),
};
const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const isWaiting = !isUser && (0, sanitizeAssistantMarkdown_1.visibleStripped)(message.content).length === 0;
    const displaySources = (0, filterAssistantSources_1.filterDisplayableAssistantSources)(message.sources) ?? [];
    return ((0, jsx_runtime_1.jsxs)("div", { className: `max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? 'ml-auto rounded-br-sm bg-primaryFS-500 text-white' : 'mr-auto rounded-bl-sm bg-blackFS-600 text-blackFS-100'}`, children: [isUser ? ((0, jsx_runtime_1.jsx)("div", { className: "whitespace-pre-wrap", children: message.content })) : isWaiting ? ((0, jsx_runtime_1.jsx)(TypingIndicator_1.TypingIndicator, {})) : ((0, jsx_runtime_1.jsx)(react_markdown_1.default, { remarkPlugins: [remark_gfm_1.default, remark_math_1.default, pruneEmptyListItems], rehypePlugins: [rehype_katex_1.default], components: markdownComponents, children: (0, sanitizeAssistantMarkdown_1.sanitizeAssistantMarkdown)(message.content) })), displaySources.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { className: "mt-2 list-disc pl-4 text-xs opacity-80", children: displaySources.map((s, i) => ((0, jsx_runtime_1.jsx)("li", { children: s.url ? ((0, jsx_runtime_1.jsx)("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", className: "underline", children: s.title || s.url })) : (s.title) }, i))) }))] }));
};
exports.MessageBubble = MessageBubble;
