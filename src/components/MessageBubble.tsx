import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeAssistantMarkdown, visibleStripped } from '../helpers/sanitizeAssistantMarkdown';
import { filterDisplayableAssistantSources } from '../helpers/filterAssistantSources';
import { AssistantMessage } from '../types/learningAssistant';

interface MdastNode {
    type: string;
    value?: string;
    children?: MdastNode[];
}

export interface MessageBubbleProps {
    message: AssistantMessage;
}

function nodeHasContent(node: React.ReactNode): boolean {
    if (node == null || node === false) return false;
    if (typeof node === 'string') return visibleStripped(node).length > 0;
    if (typeof node === 'number') return true;
    if (Array.isArray(node)) return node.some(nodeHasContent);
    if (React.isValidElement(node)) return nodeHasContent((node.props as { children?: React.ReactNode }).children);
    return false;
}

function mdastHasContent(node: MdastNode): boolean {
    if (typeof node.value === 'string' && visibleStripped(node.value).length > 0) return true;
    if (Array.isArray(node.children)) return node.children.some(mdastHasContent);
    return false;
}

function pruneEmptyListItems() {
    return (tree: MdastNode) => {
        const walk = (node: MdastNode) => {
            if (!Array.isArray(node.children)) return;
            if (node.type === 'list') {
                node.children = node.children.filter(child => child.type !== 'listItem' || mdastHasContent(child));
            }
            node.children.forEach(walk);
        };
        walk(tree);
    };
}

const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    h1: ({ children }) => <h1 className="mb-2 mt-3 text-base font-bold">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-2 mt-3 text-sm font-semibold">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-1 mt-2 text-sm font-semibold">{children}</h4>,
    ul: ({ children }) => (nodeHasContent(children) ? <ul className="mb-2 list-disc pl-5">{children}</ul> : null),
    ol: ({ children }) =>
        nodeHasContent(children) ? <ol className="mb-2 list-decimal pl-5">{children}</ol> : null,
    li: ({ children }) => (nodeHasContent(children) ? <li className="mb-1">{children}</li> : null),
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ children, href }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primaryFS-200 underline">
            {children}
        </a>
    ),
    code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
        inline ? (
            <code className="rounded bg-black/30 px-1 py-0.5 text-xs">{children}</code>
        ) : (
            <code className="block">{children}</code>
        ),
    pre: ({ children }) => (
        <pre className="mb-2 overflow-x-auto rounded-md bg-black/40 p-2 text-xs">{children}</pre>
    ),
    blockquote: ({ children }) => (
        <blockquote className="mb-2 border-l-2 border-primaryFS-400 pl-2 italic opacity-90">{children}</blockquote>
    ),
    hr: () => <hr className="my-2 border-blackFS-500" />,
    table: ({ children }) => (
        <div className="mb-2 overflow-x-auto">
            <table className="w-full border-collapse text-xs">{children}</table>
        </div>
    ),
    th: ({ children }) => <th className="border border-blackFS-500 px-2 py-1 text-left">{children}</th>,
    td: ({ children }) => <td className="border border-blackFS-500 px-2 py-1">{children}</td>,
} as React.ComponentProps<typeof ReactMarkdown>['components'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const displaySources = filterDisplayableAssistantSources(message.sources) ?? [];
    return (
        <div
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? 'ml-auto rounded-br-sm bg-primaryFS-500 text-white' : 'mr-auto rounded-bl-sm bg-blackFS-600 text-blackFS-100'}`}>
            {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, pruneEmptyListItems]}
                    components={markdownComponents}>
                    {sanitizeAssistantMarkdown(message.content)}
                </ReactMarkdown>
            )}
            {displaySources.length > 0 && (
                <ul className="mt-2 list-disc pl-4 text-xs opacity-80">
                    {displaySources.map((s, i) => (
                        <li key={i}>
                            {s.url ? (
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                                    {s.title || s.url}
                                </a>
                            ) : (
                                s.title
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
