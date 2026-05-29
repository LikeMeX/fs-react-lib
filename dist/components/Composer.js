"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Composer = void 0;
const react_1 = __importStar(require("react"));
const lu_1 = require("react-icons/lu");
const LuArrowUp = lu_1.LuArrowUp;
const LuLoader = lu_1.LuLoader;
const LuPaperclip = lu_1.LuPaperclip;
const Composer = ({ disabled, loading, onSend, onAttach, placeholder = 'Type your message here...', }) => {
    const [value, setValue] = (0, react_1.useState)('');
    const submit = () => {
        const t = value.trim();
        if (!t || disabled || loading)
            return;
        onSend(t);
        setValue('');
    };
    const canSend = value.trim().length > 0 && !disabled && !loading;
    return (react_1.default.createElement("div", { className: "mt-3 rounded-2xl border border-blackFS-500 bg-blackFS-700 px-3 py-2.5" },
        react_1.default.createElement("textarea", { value: value, onChange: e => setValue(e.target.value), placeholder: placeholder, rows: 2, disabled: disabled || loading, onKeyDown: e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                }
            }, className: "block w-full resize-none border-0 bg-transparent p-0 text-sm text-blackFS-100 placeholder-blackFS-300 focus:outline-none focus:ring-0 disabled:opacity-60" }),
        react_1.default.createElement("div", { className: `mt-2 flex items-center ${onAttach ? 'justify-between' : 'justify-end'}` },
            onAttach ? (react_1.default.createElement("button", { type: "button", "aria-label": "\u0E41\u0E19\u0E1A\u0E44\u0E1F\u0E25\u0E4C", disabled: disabled || loading, onClick: onAttach, className: "flex h-8 w-8 items-center justify-center rounded-full text-blackFS-300 transition hover:text-blackFS-100 disabled:cursor-not-allowed disabled:opacity-50" },
                react_1.default.createElement(LuPaperclip, { size: 18 }))) : null,
            react_1.default.createElement("button", { type: "button", "aria-label": "\u0E2A\u0E48\u0E07", disabled: !canSend, onClick: submit, className: "flex h-8 w-8 items-center justify-center rounded-full bg-primaryFS-500 text-white transition hover:bg-primaryFS-400 disabled:cursor-not-allowed disabled:opacity-40" }, loading ? react_1.default.createElement(LuLoader, { size: 16, className: "animate-spin" }) : react_1.default.createElement(LuArrowUp, { size: 16 })))));
};
exports.Composer = Composer;
