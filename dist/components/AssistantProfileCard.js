"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantProfileCard = void 0;
const react_1 = __importDefault(require("react"));
const lu_1 = require("react-icons/lu");
const assistantProfileDisplay_1 = require("../helpers/assistantProfileDisplay");
const LuPencil = lu_1.LuPencil;
const AssistantProfileCard = ({ profile, summary, onEdit, }) => {
    const rows = (0, assistantProfileDisplay_1.assistantProfileDisplayRows)(profile);
    return (react_1.default.createElement("section", { "aria-labelledby": "assistant-profile-heading", className: "mb-3 shrink-0 rounded-xl border border-blackFS-500 bg-blackFS-700/90 px-3.5 py-3" },
        react_1.default.createElement("div", { className: "mb-2 flex items-start justify-between gap-2" },
            react_1.default.createElement("div", { className: "min-w-0" },
                react_1.default.createElement("h3", { id: "assistant-profile-heading", className: "m-0 text-sm font-semibold text-blackFS-100" }, "\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C SkillPass"),
                react_1.default.createElement("p", { className: "m-0 mt-0.5 text-xs text-blackFS-300" }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E25\u0E49\u0E27 \u2014 \u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E08\u0E30\u0E1B\u0E23\u0E31\u0E1A\u0E04\u0E33\u0E15\u0E2D\u0E1A\u0E43\u0E2B\u0E49\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E04\u0E38\u0E13")),
            react_1.default.createElement("button", { type: "button", onClick: onEdit, className: "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-blackFS-500 bg-blackFS-800 px-2.5 py-1.5 text-xs font-medium text-blackFS-100 transition hover:border-primaryFS-400 hover:bg-blackFS-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400" },
                react_1.default.createElement(LuPencil, { size: 14, "aria-hidden": true }),
                "\u0E41\u0E01\u0E49\u0E44\u0E02")),
        summary ? (react_1.default.createElement("p", { className: "m-0 mb-2 text-sm leading-relaxed text-blackFS-200" }, summary)) : null,
        rows.length > 0 ? (react_1.default.createElement("dl", { className: "m-0 grid gap-1.5 text-sm" }, rows.map(row => (react_1.default.createElement("div", { key: row.label, className: "grid grid-cols-[minmax(0,38%)_1fr] gap-x-2 gap-y-0.5" },
            react_1.default.createElement("dt", { className: "m-0 text-blackFS-300" }, row.label),
            react_1.default.createElement("dd", { className: "m-0 font-medium text-blackFS-100" }, row.value)))))) : null));
};
exports.AssistantProfileCard = AssistantProfileCard;
