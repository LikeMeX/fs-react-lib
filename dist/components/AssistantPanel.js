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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantPanel = void 0;
const react_1 = __importStar(require("react"));
const antd_1 = require("antd");
const lu_1 = require("react-icons/lu");
const LuHistory = lu_1.LuHistory;
const LuMaximize2 = lu_1.LuMaximize2;
const LuMessageSquare = lu_1.LuMessageSquare;
const LuMessageSquarePlus = lu_1.LuMessageSquarePlus;
const LuMinimize2 = lu_1.LuMinimize2;
const LuSearch = lu_1.LuSearch;
const LuTrash2 = lu_1.LuTrash2;
const LuUserCog = lu_1.LuUserCog;
const LuX = lu_1.LuX;
const LuMoreVertical = props => (react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: props.size ?? 18, height: props.size ?? 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className: props.className, "aria-hidden": props['aria-hidden'] ? 'true' : undefined },
    react_1.default.createElement("circle", { cx: "12", cy: "5", r: "1" }),
    react_1.default.createElement("circle", { cx: "12", cy: "12", r: "1" }),
    react_1.default.createElement("circle", { cx: "12", cy: "19", r: "1" })));
const axios_1 = __importDefault(require("axios"));
const assistantContext_1 = require("../contexts/assistantContext");
const assistantConversationHistory_1 = require("../helpers/assistantConversationHistory");
const canUseLearningAssistant_1 = require("../helpers/canUseLearningAssistant");
const buildLearningMetadata_1 = require("../helpers/buildLearningMetadata");
const assistantUserProfile_1 = require("../helpers/assistantUserProfile");
const assistantProfileDisplay_1 = require("../helpers/assistantProfileDisplay");
const oauthUserEnsure_1 = require("../helpers/oauthUserEnsure");
const mapApiConversationHistory_1 = require("../helpers/mapApiConversationHistory");
const useAssistantConversation_1 = require("../hooks/useAssistantConversation");
const useAssistantPhase_1 = require("../hooks/useAssistantPhase");
const useAssistantStream_1 = require("../hooks/useAssistantStream");
const fsAiApi_1 = require("../services/fsAiApi");
const onboardingApi_1 = require("../services/onboardingApi");
const constants_1 = require("./constants");
const Composer_1 = require("./Composer");
const MessageList_1 = require("./MessageList");
const OnboardingWizard_1 = require("./OnboardingWizard");
const AssistantProfileCard_1 = require("./AssistantProfileCard");
const ModePicker_1 = require("./ModePicker");
const SuggestedActions_1 = require("./SuggestedActions");
const WelcomeMessage_1 = require("./WelcomeMessage");
function previewTitle(text, max = 72) {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length <= max)
        return t || 'บทสนทนา';
    return `${t.slice(0, max)}…`;
}
const HISTORY_BUCKET_ORDER = ['today', 'yesterday', 'week', 'older'];
const HISTORY_BUCKET_LABELS = {
    today: 'วันนี้',
    yesterday: 'เมื่อวาน',
    week: '7 วันที่ผ่านมา',
    older: 'ก่อนหน้านี้',
};
const PROFILE_STEPS = ['current_job', 'target_job', 'industry', 'timeframe'];
const PROFILE_QUESTIONS = {
    current_job: 'สวัสดีครับ! ก่อนเริ่มเรียน ขอทำความรู้จักหน่อย — ตอนนี้คุณทำงานในตำแหน่งอะไร?',
    target_job: 'เยี่ยมเลย! แล้วเป้าหมาย/ตำแหน่งที่อยากเป็นในอนาคตคืออะไร?',
    industry: 'รับทราบ คุณอยู่ในอุตสาหกรรมหรือสายงานไหน?',
    timeframe: 'อีกหนึ่งคำถาม — อยากบรรลุเป้าหมายภายในกรอบเวลาเท่าไร? (เช่น 3 เดือน, 6 เดือน, 1 ปี)',
};
const PROFILE_DONE_MESSAGE = 'ขอบคุณครับ! บันทึกข้อมูลแล้ว ผู้ช่วยจะปรับคำตอบให้เหมาะกับคุณยิ่งขึ้น เริ่มถามอะไรเกี่ยวกับคอร์สนี้ได้เลย';
function getHistoryTimeBucket(updatedAt) {
    const now = new Date();
    const d = new Date(updatedAt);
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startToday - startThat) / 86400000);
    if (diffDays < 0)
        return 'today';
    if (diffDays === 0)
        return 'today';
    if (diffDays === 1)
        return 'yesterday';
    if (diffDays >= 2 && diffDays <= 6)
        return 'week';
    return 'older';
}
const DEFAULT_MODES = ['general'];
function initialModeFor(surface, modes) {
    if (surface === 'enroll' && modes.includes('before_class'))
        return 'before_class';
    if (surface === 'watch' && modes.includes('during_class'))
        return 'during_class';
    if (modes.includes('general'))
        return 'general';
    return modes[0] ?? 'general';
}
const AssistantPanel = ({ surface = 'general', courseId = null, lessonId, chapterId, lessonComplete = false, courseComplete = false, modes, userMember, canUse, getVideoTimestamp, learningPathId, learningPathName, additionalContext, }) => {
    const { open, setOpen } = (0, assistantContext_1.useAssistant)();
    const allowedModes = modes && modes.length ? modes : DEFAULT_MODES;
    const singleMode = allowedModes.length === 1;
    const initialMode = initialModeFor(surface, allowedModes);
    const [selectedMode, setSelectedMode] = (0, react_1.useState)(singleMode ? initialMode : null);
    const [pinnedConversationId, setPinnedConversationId] = (0, react_1.useState)(null);
    const [enrollHandoffChecked, setEnrollHandoffChecked] = (0, react_1.useState)(false);
    const [sessionKey, setSessionKey] = (0, react_1.useState)(0);
    const [historyOpen, setHistoryOpen] = (0, react_1.useState)(false);
    const [historySearch, setHistorySearch] = (0, react_1.useState)('');
    const [historyRefresh, setHistoryRefresh] = (0, react_1.useState)(0);
    const [serverHistory, setServerHistory] = (0, react_1.useState)([]);
    const [historyLoading, setHistoryLoading] = (0, react_1.useState)(false);
    const [fullPage, setFullPage] = (0, react_1.useState)(false);
    const [historyError, setHistoryError] = (0, react_1.useState)(null);
    const [userProfile, setUserProfile] = (0, react_1.useState)(null);
    const [profileLoaded, setProfileLoaded] = (0, react_1.useState)(false);
    const [profileEditOpen, setProfileEditOpen] = (0, react_1.useState)(false);
    const [profileDraft, setProfileDraft] = (0, react_1.useState)({});
    const [profileStepIdx, setProfileStepIdx] = (0, react_1.useState)(0);
    const skillpassOn = (0, oauthUserEnsure_1.isSkillpassOnboardingEnabled)();
    const [fsAiUserId, setFsAiUserId] = (0, react_1.useState)(null);
    const [ensureReady, setEnsureReady] = (0, react_1.useState)(!skillpassOn);
    const [ensureError, setEnsureError] = (0, react_1.useState)(null);
    /** Upstream has no POST /users/ensure (older fs-ai) — chat works without SkillPass profile sync. */
    const [ensureEndpointUnavailable, setEnsureEndpointUnavailable] = (0, react_1.useState)(false);
    const [onboardingComplete, setOnboardingComplete] = (0, react_1.useState)(!skillpassOn);
    const [serverUserProfile, setServerUserProfile] = (0, react_1.useState)(null);
    const [profileSummaryTh, setProfileSummaryTh] = (0, react_1.useState)(null);
    const allowed = canUse ?? (0, canUseLearningAssistant_1.canUseLearningAssistant)(userMember);
    const configured = (0, canUseLearningAssistant_1.isFsAiApiConfigured)();
    const effectiveProfile = (0, react_1.useMemo)(() => userProfile ?? (0, assistantUserProfile_1.userProfileOutToAssistant)(serverUserProfile), [userProfile, serverUserProfile]);
    const hasSavedProfile = (0, assistantProfileDisplay_1.hasDisplayableAssistantProfile)(effectiveProfile);
    const needsSkillpassOnboarding = skillpassOn && ensureReady && !!fsAiUserId && !onboardingComplete && !hasSavedProfile;
    const inSkillpassOnboarding = needsSkillpassOnboarding || (skillpassOn && ensureReady && !!fsAiUserId && profileEditOpen);
    /** SkillPass needs fs-ai user id from ensure; without host userMember we still allow general chat. */
    const skillpassConversationReady = !skillpassOn ||
        !!fsAiUserId ||
        ensureEndpointUnavailable ||
        !userMember;
    const convQuery = (0, useAssistantConversation_1.useAssistantConversation)(courseId, selectedMode ?? initialMode, allowed &&
        configured &&
        ensureReady &&
        !inSkillpassOnboarding &&
        skillpassConversationReady, {
        pinnedConversationId: pinnedConversationId,
        sessionKey,
        fsAiUserId,
    });
    const conversationId = convQuery.data ?? null;
    const { apiMode, lastError } = (0, useAssistantPhase_1.useAssistantPhase)({
        route: surface,
        conversationId,
        courseId: courseId ?? null,
        lessonId,
        chapterId,
        lessonComplete,
        courseComplete,
        enabled: allowed && configured && !!conversationId && !!courseId,
        overrideMode: selectedMode,
    });
    const { messages, setMessages, suggestedActions, streaming, error: streamError, send, reset } = (0, useAssistantStream_1.useAssistantStream)();
    (0, react_1.useEffect)(() => {
        setFullPage((0, assistantConversationHistory_1.readAssistantFullPagePreference)());
        if (!skillpassOn) {
            setUserProfile((0, assistantUserProfile_1.readAssistantUserProfile)());
        }
        setProfileLoaded(true);
    }, [skillpassOn]);
    (0, react_1.useEffect)(() => {
        if (!profileLoaded || !skillpassOn || !userMember) {
            if (skillpassOn && profileLoaded && !userMember) {
                setEnsureReady(true);
            }
            return;
        }
        let cancelled = false;
        setEnsureReady(false);
        setEnsureError(null);
        void (async () => {
            const claims = (0, oauthUserEnsure_1.oauthClaimsFromUserMember)(userMember);
            if (!claims) {
                if (!cancelled)
                    setEnsureReady(true);
                return;
            }
            try {
                const res = await onboardingApi_1.onboardingApi.ensureUser(claims);
                if (cancelled)
                    return;
                setFsAiUserId(res.user_id);
                setOnboardingComplete(res.onboarding_complete);
                setServerUserProfile(res.user_profile ?? null);
                const mapped = (0, assistantUserProfile_1.userProfileOutToAssistant)(res.user_profile);
                if (mapped) {
                    setUserProfile(mapped);
                    (0, assistantUserProfile_1.writeAssistantUserProfile)(mapped);
                }
                if (res.onboarding_complete) {
                    setOnboardingComplete(true);
                }
            }
            catch (e) {
                if (!cancelled) {
                    const status = axios_1.default.isAxiosError(e) ? e.response?.status : undefined;
                    if (status === 404) {
                        setEnsureEndpointUnavailable(true);
                        setOnboardingComplete(true);
                        setEnsureError(null);
                    }
                    else {
                        setEnsureError(e instanceof Error ? e.message : 'เชื่อมต่อ SkillPass ไม่สำเร็จ');
                    }
                }
            }
            finally {
                if (!cancelled)
                    setEnsureReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [profileLoaded, skillpassOn, userMember]);
    const profileComplete = skillpassOn
        ? onboardingComplete || hasSavedProfile
        : (0, assistantUserProfile_1.isAssistantUserProfileComplete)(userProfile);
    const inLegacyProfileChat = !skillpassOn && profileLoaded && (!profileComplete || profileEditOpen);
    const inProfileChat = inLegacyProfileChat;
    const showSkillpassProfileCard = skillpassOn &&
        ensureReady &&
        !!fsAiUserId &&
        !inSkillpassOnboarding &&
        !inProfileChat &&
        hasSavedProfile &&
        effectiveProfile != null;
    const currentProfileStep = inProfileChat && profileStepIdx < PROFILE_STEPS.length ? PROFILE_STEPS[profileStepIdx] : null;
    const profileChatMessages = (0, react_1.useMemo)(() => {
        if (!inProfileChat)
            return [];
        const out = [];
        for (let i = 0; i <= profileStepIdx && i < PROFILE_STEPS.length; i++) {
            const step = PROFILE_STEPS[i];
            out.push({
                id: `profile-q-${step}`,
                role: 'assistant',
                content: PROFILE_QUESTIONS[step],
            });
            const answer = profileDraft[step];
            if (answer) {
                out.push({
                    id: `profile-a-${step}`,
                    role: 'user',
                    content: answer,
                });
            }
        }
        if (profileStepIdx >= PROFILE_STEPS.length) {
            out.push({
                id: 'profile-done',
                role: 'assistant',
                content: PROFILE_DONE_MESSAGE,
            });
        }
        return out;
    }, [inProfileChat, profileStepIdx, profileDraft]);
    const persistLegacyUserProfile = (0, react_1.useCallback)(async (finalProfile) => {
        (0, assistantUserProfile_1.writeAssistantUserProfile)(finalProfile);
        setUserProfile(finalProfile);
        if (!fsAiUserId)
            return;
        try {
            const res = await onboardingApi_1.onboardingApi.updateUserProfile(fsAiUserId, finalProfile);
            setOnboardingComplete(res.onboarding_complete);
            setServerUserProfile(res.user_profile ?? null);
        }
        catch {
            /* local profile still saved */
        }
    }, [fsAiUserId]);
    const handleProfileAnswer = (0, react_1.useCallback)((text) => {
        const trimmed = text.trim();
        if (!trimmed || !currentProfileStep)
            return;
        const nextDraft = {
            ...profileDraft,
            [currentProfileStep]: trimmed,
        };
        setProfileDraft(nextDraft);
        const nextIdx = profileStepIdx + 1;
        setProfileStepIdx(nextIdx);
        if (nextIdx >= PROFILE_STEPS.length) {
            const finalProfile = {
                current_job: nextDraft.current_job ?? '',
                target_job: nextDraft.target_job ?? '',
                industry: nextDraft.industry ?? '',
                timeframe: nextDraft.timeframe ?? '',
            };
            void persistLegacyUserProfile(finalProfile);
            setProfileEditOpen(false);
            setProfileDraft({});
            setProfileStepIdx(0);
        }
    }, [currentProfileStep, profileDraft, profileStepIdx, persistLegacyUserProfile]);
    const refreshEnsureUser = (0, react_1.useCallback)(async () => {
        if (!userMember)
            return;
        const claims = (0, oauthUserEnsure_1.oauthClaimsFromUserMember)(userMember);
        if (!claims)
            return;
        const res = await onboardingApi_1.onboardingApi.ensureUser(claims);
        setFsAiUserId(res.user_id);
        setOnboardingComplete(res.onboarding_complete);
        setServerUserProfile(res.user_profile ?? null);
        const mapped = (0, assistantUserProfile_1.userProfileOutToAssistant)(res.user_profile);
        if (mapped) {
            setUserProfile(mapped);
            (0, assistantUserProfile_1.writeAssistantUserProfile)(mapped);
        }
        if (res.onboarding_complete) {
            setOnboardingComplete(true);
        }
    }, [userMember]);
    const handleOnboardingComplete = (0, react_1.useCallback)(() => {
        setProfileEditOpen(false);
        setOnboardingComplete(true);
        void refreshEnsureUser().catch(() => undefined);
    }, [refreshEnsureUser]);
    (0, react_1.useEffect)(() => {
        if (!skillpassOn || !fsAiUserId || !onboardingComplete || profileEditOpen || !hasSavedProfile) {
            setProfileSummaryTh(null);
            return;
        }
        let cancelled = false;
        void onboardingApi_1.onboardingApi
            .getOutcome(fsAiUserId)
            .then(oc => {
            if (!cancelled)
                setProfileSummaryTh(oc.starter_profile.summary_th ?? null);
        })
            .catch(() => {
            if (!cancelled)
                setProfileSummaryTh(null);
        });
        return () => {
            cancelled = true;
        };
    }, [skillpassOn, fsAiUserId, onboardingComplete, profileEditOpen, hasSavedProfile]);
    const startProfileEdit = (0, react_1.useCallback)(() => {
        if (skillpassOn) {
            setProfileEditOpen(true);
            return;
        }
        setProfileDraft(userProfile ?? {});
        let idx = 0;
        if (userProfile) {
            for (idx = 0; idx < PROFILE_STEPS.length; idx++) {
                if (!userProfile[PROFILE_STEPS[idx]]?.trim())
                    break;
            }
        }
        setProfileStepIdx(idx);
        setProfileEditOpen(true);
    }, [skillpassOn, userProfile]);
    const cancelProfileEdit = (0, react_1.useCallback)(() => {
        setProfileEditOpen(false);
        setProfileDraft({});
        setProfileStepIdx(0);
    }, []);
    const loadServerHistory = (0, react_1.useCallback)(async () => {
        if (!fsAiUserId)
            return;
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const res = await fsAiApi_1.fsAiApi.listConversations(fsAiUserId, { limit: 100 });
            setServerHistory(res.items.map(mapApiConversationHistory_1.mapApiConversationToHistoryEntry));
        }
        catch (err) {
            const status = axios_1.default.isAxiosError(err) ? err.response?.status : undefined;
            const detail = axios_1.default.isAxiosError(err)
                ? typeof err.response?.data === 'string'
                    ? err.response.data
                    : JSON.stringify(err.response?.data)
                : err?.message;
            setHistoryError(`โหลดประวัติไม่สำเร็จ (${status ?? 'network'}): ${detail || ''}`);
        }
        finally {
            setHistoryLoading(false);
        }
    }, [fsAiUserId]);
    (0, react_1.useEffect)(() => {
        if (!historyOpen || !fsAiUserId)
            return;
        void loadServerHistory();
    }, [historyOpen, fsAiUserId, historyRefresh, loadServerHistory]);
    // Watch surface: continue the user's most recent conversation (server-backed when logged in)
    (0, react_1.useEffect)(() => {
        if (surface !== 'watch' || enrollHandoffChecked)
            return;
        if (pinnedConversationId) {
            setEnrollHandoffChecked(true);
            return;
        }
        if (fsAiUserId) {
            let cancelled = false;
            void fsAiApi_1.fsAiApi
                .listConversations(fsAiUserId, { limit: 1 })
                .then(res => {
                if (cancelled)
                    return;
                const latest = res.items[0];
                if (latest?.id)
                    setPinnedConversationId(String(latest.id));
                setEnrollHandoffChecked(true);
            })
                .catch(() => {
                if (!cancelled)
                    setEnrollHandoffChecked(true);
            });
            return () => {
                cancelled = true;
            };
        }
        const enrollItems = (0, assistantConversationHistory_1.listAssistantConversations)(courseId ?? null, 'enroll');
        if (enrollItems.length > 0) {
            setPinnedConversationId(enrollItems[0].id);
        }
        setEnrollHandoffChecked(true);
    }, [surface, courseId, pinnedConversationId, enrollHandoffChecked, fsAiUserId]);
    (0, react_1.useEffect)(() => {
        if (!historyOpen)
            setHistorySearch('');
    }, [historyOpen]);
    (0, react_1.useEffect)(() => {
        reset();
    }, [conversationId, reset]);
    (0, react_1.useEffect)(() => {
        if (!pinnedConversationId || pinnedConversationId !== conversationId)
            return;
        let cancelled = false;
        setHistoryError(null);
        fsAiApi_1.fsAiApi
            .getConversation(pinnedConversationId)
            .then(conv => {
            if (cancelled)
                return;
            const seeded = (conv.messages || [])
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                sources: m.sources,
            }));
            setMessages(seeded);
        })
            .catch(err => {
            if (cancelled)
                return;
            const status = axios_1.default.isAxiosError(err) ? err.response?.status : undefined;
            const detail = axios_1.default.isAxiosError(err)
                ? typeof err.response?.data === 'string'
                    ? err.response?.data
                    : JSON.stringify(err.response?.data)
                : err?.message;
            if (status === 404) {
                (0, assistantConversationHistory_1.removeAssistantConversation)(pinnedConversationId);
                setHistoryError('บทสนทนานี้ไม่มีอยู่แล้ว — ถูกลบจากรายการ');
                setPinnedConversationId(null);
                setHistoryRefresh(n => n + 1);
                return;
            }
            setHistoryError(`โหลดบทสนทนาไม่สำเร็จ (${status ?? 'network'}): ${detail || ''}`);
        });
        return () => {
            cancelled = true;
        };
    }, [pinnedConversationId, conversationId, setMessages]);
    const historyItems = (0, react_1.useMemo)(() => {
        if (fsAiUserId)
            return serverHistory;
        return (0, assistantConversationHistory_1.listAssistantConversations)(courseId ?? null, surface);
    }, [fsAiUserId, serverHistory, courseId, surface]);
    const filteredHistoryItems = (0, react_1.useMemo)(() => {
        const q = historySearch.trim().toLowerCase();
        if (!q)
            return historyItems;
        return historyItems.filter(e => e.title.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }, [historyItems, historySearch]);
    const groupedHistory = (0, react_1.useMemo)(() => {
        const map = new Map();
        for (const b of HISTORY_BUCKET_ORDER)
            map.set(b, []);
        for (const entry of filteredHistoryItems) {
            const bucket = getHistoryTimeBucket(entry.updatedAt);
            const arr = map.get(bucket);
            if (arr)
                arr.push(entry);
        }
        return map;
    }, [filteredHistoryItems]);
    const openHistory = (0, react_1.useCallback)(() => {
        setHistoryRefresh(n => n + 1);
        setHistoryOpen(true);
    }, []);
    const handleSelectHistory = (0, react_1.useCallback)((id) => {
        setPinnedConversationId(id);
        setHistoryOpen(false);
    }, [setPinnedConversationId]);
    const handleNewConversation = (0, react_1.useCallback)(() => {
        setPinnedConversationId(null);
        setSessionKey(k => k + 1);
        setHistoryOpen(false);
    }, []);
    const handleRemoveHistoryEntry = (0, react_1.useCallback)((id) => {
        antd_1.Modal.confirm({
            title: 'ลบบทสนทนานี้?',
            content: fsAiUserId
                ? 'การสนทนาจะถูกลบจากบัญชีของคุณและจะหายจากทุกหน้า'
                : 'ลบเฉพาะรายการในประวัติบนเครื่องนี้',
            okText: 'ลบ',
            cancelText: 'ยกเลิก',
            okButtonProps: { danger: true },
            onOk: async () => {
                if (fsAiUserId) {
                    await fsAiApi_1.fsAiApi.deleteConversation(id);
                }
                else {
                    (0, assistantConversationHistory_1.removeAssistantConversation)(id);
                }
                setHistoryRefresh(n => n + 1);
                if (pinnedConversationId === id)
                    setPinnedConversationId(null);
            },
        });
    }, [pinnedConversationId, fsAiUserId]);
    const toggleFullPage = (0, react_1.useCallback)(() => {
        setFullPage(v => {
            const next = !v;
            (0, assistantConversationHistory_1.writeAssistantFullPagePreference)(next);
            return next;
        });
    }, []);
    const handleSend = (0, react_1.useCallback)(async (text, actionIntent) => {
        if (!conversationId || !allowed)
            return;
        const ts = getVideoTimestamp?.() ?? undefined;
        const metadata = (0, buildLearningMetadata_1.buildLearningMetadata)({
            userMember,
            courseId: courseId ?? undefined,
            lessonId: lessonId ?? undefined,
            chapterId: chapterId ?? undefined,
            videoTimestamp: ts,
            actionIntent,
            mode: apiMode,
            lessonCompleted: lessonComplete,
            courseCompleted: courseComplete,
            learningPathId,
            learningPathName,
            additionalContext,
            profileOverride: userProfile ??
                (0, assistantUserProfile_1.userProfileOutToAssistant)(serverUserProfile) ??
                undefined,
        });
        const title = previewTitle(text);
        if (fsAiUserId) {
            void fsAiApi_1.fsAiApi.updateConversationTitle(conversationId, title).catch(() => {
                /* title sync is best-effort */
            });
            setHistoryRefresh(n => n + 1);
        }
        else {
            (0, assistantConversationHistory_1.upsertAssistantConversation)({
                id: conversationId,
                courseId: courseId ?? null,
                surface,
                title,
            });
            setHistoryRefresh(n => n + 1);
        }
        await send(conversationId, { message: text, metadata });
    }, [
        allowed,
        apiMode,
        chapterId,
        conversationId,
        courseComplete,
        courseId,
        getVideoTimestamp,
        lessonComplete,
        lessonId,
        learningPathId,
        learningPathName,
        additionalContext,
        send,
        surface,
        fsAiUserId,
        serverUserProfile,
        userMember,
        userProfile,
    ]);
    if (!allowed || !configured) {
        return null;
    }
    const showPicker = !singleMode && messages.length === 0 && !selectedMode && !pinnedConversationId;
    const panelWidthStyle = fullPage ? undefined : constants_1.ASSISTANT_PANEL_WIDTH;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("aside", { "aria-hidden": !open ? 'true' : 'false', style: panelWidthStyle !== undefined ? { width: panelWidthStyle } : undefined, className: `fixed z-40 flex flex-col border-l border-blackFS-500 bg-blackFS-800 shadow-2xl transition-[transform,width] duration-300 ease-out ${fullPage ? 'inset-0 max-w-none' : 'inset-y-0 right-0 max-w-[100vw]'} ${open ? 'translate-x-0' : 'translate-x-full'}` },
            react_1.default.createElement("div", { className: "flex h-full min-h-0 flex-col p-4" },
                react_1.default.createElement("header", { className: "mb-3 flex shrink-0 items-center gap-1 border-b border-blackFS-600 pb-3" },
                    react_1.default.createElement(antd_1.Tooltip, { title: "\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32" },
                        react_1.default.createElement("button", { type: "button", "aria-label": "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32", onClick: openHistory, className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400" },
                            react_1.default.createElement(LuHistory, { size: 20, "aria-hidden": true }))),
                    react_1.default.createElement("h2", { className: "min-w-0 flex-1 truncate text-center text-sm font-semibold text-white" }, "\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E01\u0E32\u0E23\u0E40\u0E23\u0E35\u0E22\u0E19"),
                    react_1.default.createElement(antd_1.Tooltip, { title: "\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E43\u0E2B\u0E21\u0E48" },
                        react_1.default.createElement("button", { type: "button", "aria-label": "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E43\u0E2B\u0E21\u0E48", onClick: handleNewConversation, className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400" },
                            react_1.default.createElement(LuMessageSquarePlus, { size: 20, "aria-hidden": true }))),
                    react_1.default.createElement(antd_1.Tooltip, { title: profileEditOpen ? 'กลับไปสนทนา' : 'แก้ไขโปรไฟล์ผู้เรียน' },
                        react_1.default.createElement("button", { type: "button", "aria-label": profileEditOpen ? 'กลับไปสนทนา' : 'แก้ไขโปรไฟล์ผู้เรียน', onClick: profileEditOpen ? cancelProfileEdit : startProfileEdit, disabled: !profileLoaded || !profileComplete, className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400 disabled:opacity-40" },
                            react_1.default.createElement(LuUserCog, { size: 20, "aria-hidden": true }))),
                    react_1.default.createElement(antd_1.Tooltip, { title: fullPage ? 'โหมดแผงข้าง' : 'โหมดเต็มหน้าจอ' },
                        react_1.default.createElement("button", { type: "button", "aria-label": fullPage ? 'ย่อแผงผู้ช่วย' : 'ขยายแผงผู้ช่วยเต็มหน้าจอ', onClick: toggleFullPage, className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400" }, fullPage ? react_1.default.createElement(LuMinimize2, { size: 20, "aria-hidden": true }) : react_1.default.createElement(LuMaximize2, { size: 20, "aria-hidden": true }))),
                    react_1.default.createElement(antd_1.Tooltip, { title: "\u0E1B\u0E34\u0E14\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22" },
                        react_1.default.createElement("button", { type: "button", "aria-label": "\u0E1B\u0E34\u0E14\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E01\u0E32\u0E23\u0E40\u0E23\u0E35\u0E22\u0E19", onClick: () => setOpen(false), className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400" },
                            react_1.default.createElement(LuX, { size: 20, "aria-hidden": true })))),
                lastError === 'FORBIDDEN' && (react_1.default.createElement(antd_1.Alert, { type: "error", message: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22", className: "mb-3", showIcon: true })),
                convQuery.isError && (react_1.default.createElement(antd_1.Alert, { type: "error", message: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E44\u0E14\u0E49", className: "mb-3", showIcon: true })),
                streamError && (react_1.default.createElement(antd_1.Alert, { type: "error", message: streamError, className: "mb-3", showIcon: true, closable: true })),
                historyError && (react_1.default.createElement(antd_1.Alert, { type: "warning", message: historyError, className: "mb-3", showIcon: true, closable: true, onClose: () => setHistoryError(null) })),
                ensureError && (react_1.default.createElement(antd_1.Alert, { type: "error", message: ensureError, className: "mb-3", showIcon: true, closable: true, onClose: () => setEnsureError(null) })),
                react_1.default.createElement("div", { className: `flex min-h-0 flex-1 flex-col ${inSkillpassOnboarding || inProfileChat ? 'overflow-hidden' : 'overflow-y-auto'}` }, inSkillpassOnboarding && fsAiUserId ? (react_1.default.createElement(OnboardingWizard_1.OnboardingWizard, { fsAiUserId: fsAiUserId, restart: profileEditOpen && (onboardingComplete || hasSavedProfile), onComplete: handleOnboardingComplete })) : inProfileChat ? (react_1.default.createElement("div", { className: "flex min-h-0 flex-1 flex-col overflow-hidden" },
                    react_1.default.createElement(MessageList_1.MessageList, { messages: profileChatMessages }))) : showPicker ? (react_1.default.createElement(ModePicker_1.ModePicker, { disabled: !conversationId || convQuery.isLoading, modes: allowedModes, onSelect: mode => setSelectedMode(mode) })) : (react_1.default.createElement(react_1.default.Fragment, null,
                    showSkillpassProfileCard && effectiveProfile ? (react_1.default.createElement(AssistantProfileCard_1.AssistantProfileCard, { profile: effectiveProfile, summary: profileSummaryTh, onEdit: startProfileEdit })) : null,
                    messages.length === 0 ? (react_1.default.createElement(WelcomeMessage_1.WelcomeMessage, { mode: apiMode })) : (react_1.default.createElement(MessageList_1.MessageList, { messages: messages })),
                    react_1.default.createElement(SuggestedActions_1.SuggestedActions, { mode: apiMode, actions: suggestedActions, disabled: streaming || !conversationId, onSelect: (message, actionIntent) => {
                            void handleSend(message, actionIntent);
                        } })))),
                !inSkillpassOnboarding && (react_1.default.createElement("div", { className: "shrink-0 border-t border-blackFS-600 pt-3" },
                    react_1.default.createElement(Composer_1.Composer, { disabled: inProfileChat
                            ? !currentProfileStep
                            : !conversationId || convQuery.isLoading, loading: inProfileChat ? false : streaming, onSend: text => {
                            if (inProfileChat) {
                                handleProfileAnswer(text);
                            }
                            else {
                                void handleSend(text);
                            }
                        } }))))),
        react_1.default.createElement(antd_1.Drawer, { title: "\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32", placement: "left", width: 360, onClose: () => setHistoryOpen(false), open: historyOpen, destroyOnClose: false, extra: react_1.default.createElement(antd_1.Tooltip, { title: "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E43\u0E2B\u0E21\u0E48" },
                react_1.default.createElement("button", { type: "button", "aria-label": "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E43\u0E2B\u0E21\u0E48\u0E08\u0E32\u0E01\u0E41\u0E1C\u0E07\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34", onClick: handleNewConversation, className: "flex h-10 w-10 items-center justify-center rounded-lg text-black/70 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-500 dark:text-white/80 dark:hover:bg-white/10" },
                    react_1.default.createElement(LuMessageSquarePlus, { size: 20, "aria-hidden": true }))), styles: {
                body: { paddingTop: 12, paddingBottom: 16 },
            }, classNames: {
                body: 'bg-zinc-50 dark:bg-zinc-950',
            } },
            react_1.default.createElement("div", { className: "flex flex-col gap-4" },
                react_1.default.createElement(antd_1.Input, { allowClear: true, value: historySearch, onChange: e => setHistorySearch(e.target.value), placeholder: "\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E08\u0E32\u0E01\u0E2B\u0E31\u0E27\u0E02\u0E49\u0E2D\u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E2B\u0E31\u0E2A\u2026", "aria-label": "\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32", prefix: react_1.default.createElement(LuSearch, { className: "text-black/40 dark:text-white/45", size: 16, "aria-hidden": true }), className: "rounded-xl border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900" }),
                historyLoading ? (react_1.default.createElement("p", { className: "text-center text-sm text-black/60 dark:text-white/55" }, "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E42\u0E2B\u0E25\u0E14\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u2026")) : historyItems.length === 0 ? (react_1.default.createElement("div", { className: "rounded-xl border border-dashed border-black/15 bg-white px-4 py-8 text-center dark:border-white/15 dark:bg-zinc-900/80" },
                    react_1.default.createElement(LuMessageSquare, { className: "mx-auto mb-3 text-black/25 dark:text-white/30", size: 36, "aria-hidden": true }),
                    react_1.default.createElement("p", { className: "text-sm font-medium text-black/75 dark:text-white/75" }, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E17\u0E35\u0E48\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01"),
                    react_1.default.createElement("p", { className: "mt-1 text-xs text-black/50 dark:text-white/50" }, "\u0E2A\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E2B\u0E31\u0E27\u0E02\u0E49\u0E2D\u0E1B\u0E23\u0E32\u0E01\u0E0F\u0E17\u0E35\u0E48\u0E19\u0E35\u0E48"))) : filteredHistoryItems.length === 0 ? (react_1.default.createElement("p", { className: "text-center text-sm text-black/60 dark:text-white/55" },
                    "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32\u0E17\u0E35\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A \u201C",
                    historySearch.trim(),
                    "\u201D")) : (react_1.default.createElement("div", { className: "flex flex-col gap-5" }, HISTORY_BUCKET_ORDER.map(bucket => {
                    const items = groupedHistory.get(bucket) ?? [];
                    if (!items.length)
                        return null;
                    return (react_1.default.createElement("section", { key: bucket, "aria-labelledby": `history-bucket-${bucket}` },
                        react_1.default.createElement("h3", { id: `history-bucket-${bucket}`, className: "mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-black/45 dark:text-white/45" }, HISTORY_BUCKET_LABELS[bucket]),
                        react_1.default.createElement("ul", { className: "m-0 list-none space-y-2 p-0", role: "list" }, items.map(entry => {
                            const active = entry.id === conversationId;
                            const dateLabel = new Date(entry.updatedAt).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            });
                            return (react_1.default.createElement("li", { key: entry.id },
                                react_1.default.createElement("div", { className: `flex min-h-[52px] overflow-hidden rounded-xl border transition-colors ${active
                                        ? 'border-primaryFS-500/50 bg-primaryFS-500/15 shadow-sm dark:bg-primaryFS-500/20'
                                        : 'border-black/8 bg-white hover:border-black/15 hover:bg-zinc-50/90 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/18 dark:hover:bg-zinc-800/90'}` },
                                    react_1.default.createElement(antd_1.Tooltip, { title: entry.title, placement: "right" },
                                        react_1.default.createElement("button", { type: "button", "aria-current": active ? 'true' : undefined, "aria-label": `เปิดบทสนทนา: ${entry.title}`, onClick: () => handleSelectHistory(entry.id), className: "flex min-h-[52px] min-w-0 flex-1 items-start gap-3 px-3 py-3 text-left touch-manipulation" },
                                            react_1.default.createElement("span", { className: `mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active
                                                    ? 'bg-primaryFS-500/25 text-primaryFS-600 dark:text-primaryFS-300'
                                                    : 'bg-black/[0.06] text-black/50 dark:bg-white/10 dark:text-white/55'}` },
                                                react_1.default.createElement(LuMessageSquare, { size: 18, "aria-hidden": true })),
                                            react_1.default.createElement("span", { className: "min-w-0 flex-1" },
                                                react_1.default.createElement("span", { className: "line-clamp-2 text-sm font-medium leading-snug text-black/90 dark:text-white/90" }, entry.title),
                                                react_1.default.createElement("time", { dateTime: new Date(entry.updatedAt).toISOString(), className: "mt-1 block text-xs tabular-nums text-black/50 dark:text-white/50" }, dateLabel)))),
                                    react_1.default.createElement(antd_1.Dropdown, { trigger: ['click'], placement: "bottomRight", menu: {
                                            items: [
                                                {
                                                    key: 'remove',
                                                    danger: true,
                                                    icon: react_1.default.createElement(LuTrash2, { size: 16, "aria-hidden": true }),
                                                    label: 'ลบจากรายการ',
                                                    onClick: () => handleRemoveHistoryEntry(entry.id),
                                                },
                                            ],
                                        } },
                                        react_1.default.createElement("button", { type: "button", "aria-label": `ตัวเลือกสำหรับ ${entry.title}`, onClick: e => e.stopPropagation(), className: "flex h-[52px] w-11 shrink-0 items-center justify-center border-l border-black/8 text-black/45 transition hover:bg-black/[0.04] hover:text-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primaryFS-500 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80" },
                                            react_1.default.createElement(LuMoreVertical, { size: 18, "aria-hidden": true }))))));
                        }))));
                })))))));
};
exports.AssistantPanel = AssistantPanel;
