"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Composer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lu_1 = require("react-icons/lu");
const LuArrowUp = lu_1.LuArrowUp;
const LuLoader = lu_1.LuLoader;
const LuPaperclip = lu_1.LuPaperclip;
/** Touch-friendly minimum; ~3 lines before internal scroll. */
const COMPOSER_MIN_HEIGHT_PX = 52;
const COMPOSER_MAX_HEIGHT_PX = 160;
const Composer = ({ disabled, loading, onSend, onAttach, placeholder = 'Type your message here...', }) => {
    const [value, setValue] = (0, react_1.useState)('');
    const textareaRef = (0, react_1.useRef)(null);
    const syncTextareaHeight = (0, react_1.useCallback)(() => {
        const el = textareaRef.current;
        if (!el)
            return;
        el.style.height = 'auto';
        const scrollHeight = el.scrollHeight;
        const nextHeight = Math.min(Math.max(scrollHeight, COMPOSER_MIN_HEIGHT_PX), COMPOSER_MAX_HEIGHT_PX);
        el.style.height = `${nextHeight}px`;
        el.style.overflowY = scrollHeight > COMPOSER_MAX_HEIGHT_PX ? 'auto' : 'hidden';
    }, []);
    (0, react_1.useLayoutEffect)(() => {
        syncTextareaHeight();
    }, [value, syncTextareaHeight]);
    const submit = () => {
        const t = value.trim();
        if (!t || disabled || loading)
            return;
        onSend(t);
        setValue('');
    };
    const canSend = value.trim().length > 0 && !disabled && !loading;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "shrink-0 rounded-2xl border border-blackFS-500 bg-blackFS-700 px-3 py-2.5", children: [(0, jsx_runtime_1.jsx)("textarea", { ref: textareaRef, value: value, onChange: e => setValue(e.target.value), placeholder: placeholder, rows: 1, disabled: disabled || loading, onKeyDown: e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                    }
                }, className: "block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-base leading-relaxed text-blackFS-100 placeholder-blackFS-300 focus:outline-none focus:ring-0 disabled:opacity-60", style: { minHeight: COMPOSER_MIN_HEIGHT_PX, maxHeight: COMPOSER_MAX_HEIGHT_PX } }), (0, jsx_runtime_1.jsxs)("div", { className: `mt-2 flex items-center ${onAttach ? 'justify-between' : 'justify-end'}`, children: [onAttach ? ((0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": "\u0E41\u0E19\u0E1A\u0E44\u0E1F\u0E25\u0E4C", disabled: disabled || loading, onClick: onAttach, className: "flex h-11 w-11 items-center justify-center rounded-full text-blackFS-300 transition hover:text-blackFS-100 disabled:cursor-not-allowed disabled:opacity-50", children: (0, jsx_runtime_1.jsx)(LuPaperclip, { size: 18 }) })) : null, (0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": "\u0E2A\u0E48\u0E07", disabled: !canSend, onClick: submit, className: "flex h-11 w-11 items-center justify-center rounded-full bg-primaryFS-500 text-white transition hover:bg-primaryFS-400 disabled:cursor-not-allowed disabled:opacity-40", children: loading ? (0, jsx_runtime_1.jsx)(LuLoader, { size: 18, className: "animate-spin" }) : (0, jsx_runtime_1.jsx)(LuArrowUp, { size: 18 }) })] })] }));
};
exports.Composer = Composer;
