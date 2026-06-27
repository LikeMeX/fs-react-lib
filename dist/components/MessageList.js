"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MessageBubble_1 = require("./MessageBubble");
const MessageList = ({ messages, footer }) => {
    const bottomRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, footer]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-1 py-2", children: [messages.map(m => ((0, jsx_runtime_1.jsx)(MessageBubble_1.MessageBubble, { message: m }, m.id))), footer, (0, jsx_runtime_1.jsx)("div", { ref: bottomRef })] }));
};
exports.MessageList = MessageList;
