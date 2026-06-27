"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModePicker = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ALL_MODES = [
    { mode: 'general', icon: '🌐', label: 'ทั่วไป', description: 'วางแผนและสำรวจทั่วไป' },
    { mode: 'before_class', icon: '🎯', label: 'ก่อนเรียน', description: 'เตรียมตัวก่อนเรียนคอร์ส' },
    { mode: 'during_class', icon: '📚', label: 'ระหว่างเรียน', description: 'ช่วยตอบคำถามขณะเรียน' },
    { mode: 'after_class', icon: '📝', label: 'หลังเรียน', description: 'ทบทวนและฝึกฝน' },
    { mode: 'apply', icon: '🚀', label: 'นำไปใช้', description: 'ลงมือทำโปรเจกต์จริง' },
];
const ModePicker = ({ onSelect, disabled, modes }) => {
    const allowed = modes && modes.length ? ALL_MODES.filter(m => modes.includes(m.mode)) : ALL_MODES;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 text-blackFS-100", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primaryFS-400 to-pinkFS-500 text-base", children: "\uD83E\uDD16" }), (0, jsx_runtime_1.jsx)("h3", { className: "m-0 text-base font-semibold leading-9", children: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E42\u0E2B\u0E21\u0E14 AI \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E19\u0E35\u0E49" })] }), (0, jsx_runtime_1.jsx)("p", { className: "m-0 text-sm text-blackFS-200", children: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E42\u0E2B\u0E21\u0E14\u0E17\u0E35\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E2A\u0E34\u0E48\u0E07\u0E17\u0E35\u0E48\u0E04\u0E38\u0E13\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49:" }), (0, jsx_runtime_1.jsx)("ul", { className: "m-0 flex list-disc flex-col gap-2 pl-5 text-sm text-blackFS-200", children: allowed.map(m => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-blackFS-100", children: m.label }), (0, jsx_runtime_1.jsxs)("span", { className: "text-blackFS-200", children: [" \u2013 ", m.description] })] }, m.mode))) }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: allowed.map(m => ((0, jsx_runtime_1.jsxs)("button", { type: "button", disabled: disabled, onClick: () => onSelect(m.mode), "aria-label": m.label, className: "flex items-center gap-1.5 rounded-full border border-blackFS-500 bg-blackFS-700 px-3.5 py-2 text-sm text-blackFS-100 transition hover:border-primaryFS-400 hover:bg-blackFS-600 disabled:cursor-not-allowed disabled:opacity-50", children: [(0, jsx_runtime_1.jsx)("span", { "aria-hidden": true, children: m.icon }), (0, jsx_runtime_1.jsx)("span", { children: m.label })] }, m.mode))) })] }));
};
exports.ModePicker = ModePicker;
