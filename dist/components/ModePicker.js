"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModePicker = void 0;
const react_1 = __importDefault(require("react"));
const ALL_MODES = [
    { mode: 'general', icon: '🌐', label: 'ทั่วไป', description: 'วางแผนและสำรวจทั่วไป' },
    { mode: 'before_class', icon: '🎯', label: 'ก่อนเรียน', description: 'เตรียมตัวก่อนเรียนคอร์ส' },
    { mode: 'during_class', icon: '📚', label: 'ระหว่างเรียน', description: 'ช่วยตอบคำถามขณะเรียน' },
    { mode: 'after_class', icon: '📝', label: 'หลังเรียน', description: 'ทบทวนและฝึกฝน' },
    { mode: 'apply', icon: '🚀', label: 'นำไปใช้', description: 'ลงมือทำโปรเจกต์จริง' },
];
const ModePicker = ({ onSelect, disabled, modes }) => {
    const allowed = modes && modes.length ? ALL_MODES.filter(m => modes.includes(m.mode)) : ALL_MODES;
    return (react_1.default.createElement("div", { className: "flex flex-col gap-4 text-blackFS-100" },
        react_1.default.createElement("div", { className: "flex items-start gap-3" },
            react_1.default.createElement("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primaryFS-400 to-pinkFS-500 text-base" }, "\uD83E\uDD16"),
            react_1.default.createElement("h3", { className: "m-0 text-base font-semibold leading-9" }, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E42\u0E2B\u0E21\u0E14 AI \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E19\u0E35\u0E49")),
        react_1.default.createElement("p", { className: "m-0 text-sm text-blackFS-200" }, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E42\u0E2B\u0E21\u0E14\u0E17\u0E35\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E2A\u0E34\u0E48\u0E07\u0E17\u0E35\u0E48\u0E04\u0E38\u0E13\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49:"),
        react_1.default.createElement("ul", { className: "m-0 flex list-disc flex-col gap-2 pl-5 text-sm text-blackFS-200" }, allowed.map(m => (react_1.default.createElement("li", { key: m.mode },
            react_1.default.createElement("span", { className: "font-semibold text-blackFS-100" }, m.label),
            react_1.default.createElement("span", { className: "text-blackFS-200" },
                " \u2013 ",
                m.description))))),
        react_1.default.createElement("div", { className: "flex flex-wrap gap-2" }, allowed.map(m => (react_1.default.createElement("button", { key: m.mode, type: "button", disabled: disabled, onClick: () => onSelect(m.mode), "aria-label": m.label, className: "flex items-center gap-1.5 rounded-full border border-blackFS-500 bg-blackFS-700 px-3.5 py-2 text-sm text-blackFS-100 transition hover:border-primaryFS-400 hover:bg-blackFS-600 disabled:cursor-not-allowed disabled:opacity-50" },
            react_1.default.createElement("span", { "aria-hidden": true }, m.icon),
            react_1.default.createElement("span", null, m.label)))))));
};
exports.ModePicker = ModePicker;
