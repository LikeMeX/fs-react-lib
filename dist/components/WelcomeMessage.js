"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeMessage = void 0;
const react_1 = __importDefault(require("react"));
const WELCOME_BY_MODE = {
    general: {
        icon: '🌐',
        title: 'สวัสดี! ผมคือผู้ช่วยการเรียนของคุณ',
        description: 'อยากวางแผน สำรวจ หรือเริ่มต้นจากตรงไหนดี? เลือกหัวข้อด้านล่าง หรือพิมพ์คำถามได้เลย',
    },
    before_class: {
        icon: '🎯',
        title: 'พร้อมเตรียมตัวก่อนเรียนแล้ว!',
        description: 'มาทำความรู้จักคอร์สนี้กันก่อนเริ่มเรียน — ลองเลือกสิ่งที่อยากรู้ก่อนได้เลย',
    },
    during_class: {
        icon: '📚',
        title: 'อยู่ระหว่างเรียน ผมช่วยคุณได้',
        description: 'ติดตรงไหน อยากให้อธิบายเพิ่ม หรือสรุปช่วงนี้ — เลือกได้เลย',
    },
    after_class: {
        icon: '📝',
        title: 'มาทบทวนหลังเรียนกัน!',
        description: 'จะสรุป Key Takeaways ทำ Flashcards หรือออกข้อสอบให้ลองทำ — เริ่มตรงไหนก็ได้',
    },
    apply: {
        icon: '🚀',
        title: 'ถึงเวลานำไปใช้จริง!',
        description: 'ลองทำ Mini-Project ซ้อมสัมภาษณ์ หรือออกแบบ Portfolio — เลือกได้ตามเป้าหมาย',
    },
};
const WelcomeMessage = ({ mode }) => {
    const content = WELCOME_BY_MODE[mode] ?? WELCOME_BY_MODE.general;
    return (react_1.default.createElement("div", { className: "flex flex-col items-center gap-3 px-2 py-6 text-center text-blackFS-100" },
        react_1.default.createElement("div", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primaryFS-400 to-pinkFS-500 text-2xl shadow-[0_8px_24px_rgba(132,44,221,0.35)]" },
            react_1.default.createElement("span", { "aria-hidden": true }, content.icon)),
        react_1.default.createElement("h3", { className: "m-0 text-base font-semibold leading-snug text-white" }, content.title),
        react_1.default.createElement("p", { className: "m-0 max-w-[34ch] text-sm leading-relaxed text-blackFS-200" }, content.description)));
};
exports.WelcomeMessage = WelcomeMessage;
