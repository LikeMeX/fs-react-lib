"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantNavButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const lu_1 = require("react-icons/lu");
const assistantContext_1 = require("../contexts/assistantContext");
const LuBot = lu_1.LuBot;
const LuX = lu_1.LuX;
const canUseLearningAssistant_1 = require("../helpers/canUseLearningAssistant");
const AssistantNavButton = ({ userMember, canUse, floating }) => {
    const { open, toggle } = (0, assistantContext_1.useAssistant)();
    const allowed = canUse ?? (0, canUseLearningAssistant_1.canUseLearningAssistant)(userMember);
    if (!allowed || !(0, canUseLearningAssistant_1.isFsAiApiConfigured)())
        return null;
    if (open && floating)
        return null;
    const wrapperClass = floating
        ? 'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primaryFS-400 via-primaryFS-500 to-pinkFS-500 text-white shadow-[0_12px_30px_rgba(132,44,221,0.45)] ring-[3px] ring-black/20 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(132,44,221,0.5)] active:translate-y-0 active:scale-95'
        : 'group relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primaryFS-400 via-primaryFS-500 to-pinkFS-500 text-white shadow-[0_8px_20px_rgba(132,44,221,0.3)] ring-[3px] ring-blackFS-900 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(132,44,221,0.36)] active:translate-y-0 active:scale-95';
    return ((0, jsx_runtime_1.jsxs)("button", { type: "button", "aria-label": open ? 'ปิดผู้ช่วยการเรียน' : 'เปิดผู้ช่วยการเรียน', "aria-pressed": open ? 'true' : 'false', onClick: toggle, className: wrapperClass, children: [(0, jsx_runtime_1.jsx)("span", { "aria-hidden": true, className: "absolute right-0 top-0 h-2 w-2 rounded-full border border-white bg-successFS-500 shadow-[0_0_8px_rgba(13,193,128,0.85)]" }), (0, jsx_runtime_1.jsx)("span", { "aria-hidden": true, className: "relative z-10", children: open ? (0, jsx_runtime_1.jsx)(LuX, { size: floating ? 22 : 18, strokeWidth: 2.4 }) : (0, jsx_runtime_1.jsx)(LuBot, { size: floating ? 22 : 18, strokeWidth: 2.4 }) }, open ? 'close' : 'chat')] }));
};
exports.AssistantNavButton = AssistantNavButton;
