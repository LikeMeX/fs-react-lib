"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAssistant = exports.AssistantContextProvider = exports.AssistantContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
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
    return (0, jsx_runtime_1.jsx)(exports.AssistantContext.Provider, { value: value, children: children });
};
exports.AssistantContextProvider = AssistantContextProvider;
const useAssistant = () => (0, react_1.useContext)(exports.AssistantContext);
exports.useAssistant = useAssistant;
exports.default = exports.AssistantContextProvider;
