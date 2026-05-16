"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBubble = void 0;
const react_1 = __importDefault(require("react"));
const react_markdown_1 = __importDefault(require("react-markdown"));
const remark_gfm_1 = __importDefault(require("remark-gfm"));
const sanitizeAssistantMarkdown_1 = require("../helpers/sanitizeAssistantMarkdown");
const filterAssistantSources_1 = require("../helpers/filterAssistantSources");
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
    p: ({ children }) => react_1.default.createElement("p", { className: "mb-2 last:mb-0" }, children),
    h1: ({ children }) => react_1.default.createElement("h1", { className: "mb-2 mt-3 text-base font-bold" }, children),
    h2: ({ children }) => react_1.default.createElement("h2", { className: "mb-2 mt-3 text-base font-semibold" }, children),
    h3: ({ children }) => react_1.default.createElement("h3", { className: "mb-2 mt-3 text-sm font-semibold" }, children),
    h4: ({ children }) => react_1.default.createElement("h4", { className: "mb-1 mt-2 text-sm font-semibold" }, children),
    ul: ({ children }) => (nodeHasContent(children) ? react_1.default.createElement("ul", { className: "mb-2 list-disc pl-5" }, children) : null),
    ol: ({ children }) => nodeHasContent(children) ? react_1.default.createElement("ol", { className: "mb-2 list-decimal pl-5" }, children) : null,
    li: ({ children }) => (nodeHasContent(children) ? react_1.default.createElement("li", { className: "mb-1" }, children) : null),
    strong: ({ children }) => react_1.default.createElement("strong", { className: "font-semibold" }, children),
    em: ({ children }) => react_1.default.createElement("em", { className: "italic" }, children),
    a: ({ children, href }) => (react_1.default.createElement("a", { href: href, target: "_blank", rel: "noopener noreferrer", className: "text-primaryFS-200 underline" }, children)),
    code: ({ inline, children }) => inline ? (react_1.default.createElement("code", { className: "rounded bg-black/30 px-1 py-0.5 text-xs" }, children)) : (react_1.default.createElement("code", { className: "block" }, children)),
    pre: ({ children }) => (react_1.default.createElement("pre", { className: "mb-2 overflow-x-auto rounded-md bg-black/40 p-2 text-xs" }, children)),
    blockquote: ({ children }) => (react_1.default.createElement("blockquote", { className: "mb-2 border-l-2 border-primaryFS-400 pl-2 italic opacity-90" }, children)),
    hr: () => react_1.default.createElement("hr", { className: "my-2 border-blackFS-500" }),
    table: ({ children }) => (react_1.default.createElement("div", { className: "mb-2 overflow-x-auto" },
        react_1.default.createElement("table", { className: "w-full border-collapse text-xs" }, children))),
    th: ({ children }) => react_1.default.createElement("th", { className: "border border-blackFS-500 px-2 py-1 text-left" }, children),
    td: ({ children }) => react_1.default.createElement("td", { className: "border border-blackFS-500 px-2 py-1" }, children),
};
const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const displaySources = (0, filterAssistantSources_1.filterDisplayableAssistantSources)(message.sources) ?? [];
    return (react_1.default.createElement("div", { className: `max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? 'ml-auto rounded-br-sm bg-primaryFS-500 text-white' : 'mr-auto rounded-bl-sm bg-blackFS-600 text-blackFS-100'}` },
        isUser ? (react_1.default.createElement("div", { className: "whitespace-pre-wrap" }, message.content)) : (react_1.default.createElement(react_markdown_1.default, { remarkPlugins: [remark_gfm_1.default, pruneEmptyListItems], components: markdownComponents }, (0, sanitizeAssistantMarkdown_1.sanitizeAssistantMarkdown)(message.content))),
        displaySources.length > 0 && (react_1.default.createElement("ul", { className: "mt-2 list-disc pl-4 text-xs opacity-80" }, displaySources.map((s, i) => (react_1.default.createElement("li", { key: i }, s.url ? (react_1.default.createElement("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", className: "underline" }, s.title || s.url)) : (s.title))))))));
};
exports.MessageBubble = MessageBubble;
