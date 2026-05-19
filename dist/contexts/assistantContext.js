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
exports.useAssistant = exports.AssistantContextProvider = exports.AssistantContext = void 0;
const react_1 = __importStar(require("react"));
exports.AssistantContext = (0, react_1.createContext)({
    open: false,
    setOpen: () => undefined,
    toggle: () => undefined,
});
const OPEN_PREF_KEY = 'assistant.open';
const AssistantContextProvider = ({ children }) => {
    const [open, setOpenState] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (typeof window === 'undefined')
            return;
        try {
            const v = window.localStorage.getItem(OPEN_PREF_KEY);
            setOpenState(v === 'true');
        }
        catch {
            setOpenState(false);
        }
    }, []);
    const persist = (0, react_1.useCallback)((next) => {
        if (typeof window === 'undefined')
            return;
        try {
            window.localStorage.setItem(OPEN_PREF_KEY, String(next));
        }
        catch {
            /* ignore */
        }
    }, []);
    const setOpen = (0, react_1.useCallback)((next) => {
        setOpenState(next);
        persist(next);
    }, [persist]);
    const toggle = (0, react_1.useCallback)(() => {
        setOpenState(v => {
            const next = !v;
            persist(next);
            return next;
        });
    }, [persist]);
    const value = (0, react_1.useMemo)(() => ({ open, setOpen, toggle }), [open, setOpen, toggle]);
    return react_1.default.createElement(exports.AssistantContext.Provider, { value: value }, children);
};
exports.AssistantContextProvider = AssistantContextProvider;
const useAssistant = () => (0, react_1.useContext)(exports.AssistantContext);
exports.useAssistant = useAssistant;
exports.default = exports.AssistantContextProvider;
