import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Drawer, Dropdown, Input, Modal, Tooltip } from 'antd';
import {
    LuHistory as LuHistoryRaw,
    LuMaximize2 as LuMaximize2Raw,
    LuMessageSquare as LuMessageSquareRaw,
    LuMessageSquarePlus as LuMessageSquarePlusRaw,
    LuMinimize2 as LuMinimize2Raw,
    LuSearch as LuSearchRaw,
    LuTrash2 as LuTrash2Raw,
    LuUserCog as LuUserCogRaw,
    LuX as LuXRaw,
} from 'react-icons/lu';

type IconFC = React.FC<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
const LuHistory = LuHistoryRaw as unknown as IconFC;
const LuMaximize2 = LuMaximize2Raw as unknown as IconFC;
const LuMessageSquare = LuMessageSquareRaw as unknown as IconFC;
const LuMessageSquarePlus = LuMessageSquarePlusRaw as unknown as IconFC;
const LuMinimize2 = LuMinimize2Raw as unknown as IconFC;
const LuSearch = LuSearchRaw as unknown as IconFC;
const LuTrash2 = LuTrash2Raw as unknown as IconFC;
const LuUserCog = LuUserCogRaw as unknown as IconFC;
const LuX = LuXRaw as unknown as IconFC;
const LuMoreVertical: IconFC = props => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size ?? 18}
        height={props.size ?? 18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
        aria-hidden={props['aria-hidden'] ? 'true' : undefined}>
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
    </svg>
);
import axios from 'axios';
import { useAssistant } from '../contexts/assistantContext';
import {
    AssistantHistoryEntry,
    AssistantSurface,
    listAssistantConversations,
    readAssistantFullPagePreference,
    removeAssistantConversation,
    upsertAssistantConversation,
    writeAssistantFullPagePreference,
} from '../helpers/assistantConversationHistory';
import {
    canUseLearningAssistant,
    isFsAiApiConfigured,
} from '../helpers/canUseLearningAssistant';
import { buildLearningMetadata } from '../helpers/buildLearningMetadata';
import {
    AssistantUserProfile,
    isAssistantUserProfileComplete,
    readAssistantUserProfile,
    userProfileOutToAssistant,
    writeAssistantUserProfile,
} from '../helpers/assistantUserProfile';
import { hasDisplayableAssistantProfile } from '../helpers/assistantProfileDisplay';
import {
    isSkillpassOnboardingEnabled,
    oauthClaimsFromUserMember,
} from '../helpers/oauthUserEnsure';
import { mapApiConversationToHistoryEntry } from '../helpers/mapApiConversationHistory';
import { useAssistantConversation } from '../hooks/useAssistantConversation';
import { useAssistantPhase } from '../hooks/useAssistantPhase';
import { useAssistantStream } from '../hooks/useAssistantStream';
import { fsAiApi } from '../services/fsAiApi';
import {
    AssistantMessage,
    AssistantUserMember,
    LearningModeApi,
} from '../types/learningAssistant';
import { onboardingApi, UserProfileOut } from '../services/onboardingApi';
import { ASSISTANT_PANEL_WIDTH } from './constants';
import { Composer } from './Composer';
import { MessageList } from './MessageList';
import { OnboardingWizard } from './OnboardingWizard';
import { AssistantProfileCard } from './AssistantProfileCard';
import { ModePicker } from './ModePicker';
import { SuggestedActions } from './SuggestedActions';
import { WelcomeMessage } from './WelcomeMessage';

export interface AssistantPanelProps {
    /** 'general' = no course context. 'enroll'/'watch' for course-bound flows. */
    surface?: AssistantSurface;
    courseId?: number | null;
    lessonId?: number | null;
    chapterId?: number | null;
    lessonComplete?: boolean;
    courseComplete?: boolean;
    /** Allowed modes. Default ['general']. ModePicker shown only when length > 1. */
    modes?: LearningModeApi[];
    /** Host app user / decoded JWT. Used by buildLearningMetadata and entitlement gate. */
    userMember?: AssistantUserMember;
    /** Override entitlement check. */
    canUse?: boolean;
    /** Called when sending a message; return current player time in seconds (watch only). */
    getVideoTimestamp?: () => number;
    learningPathId?: string | number | null;
    learningPathName?: string | null;
    additionalContext?: Record<string, unknown> | null;
}

function previewTitle(text: string, max = 72): string {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t || 'บทสนทนา';
    return `${t.slice(0, max)}…`;
}

type HistoryTimeBucket = 'today' | 'yesterday' | 'week' | 'older';

const HISTORY_BUCKET_ORDER: HistoryTimeBucket[] = ['today', 'yesterday', 'week', 'older'];

const HISTORY_BUCKET_LABELS: Record<HistoryTimeBucket, string> = {
    today: 'วันนี้',
    yesterday: 'เมื่อวาน',
    week: '7 วันที่ผ่านมา',
    older: 'ก่อนหน้านี้',
};

type ProfileStep = 'current_job' | 'target_job' | 'industry' | 'timeframe';

const PROFILE_STEPS: ProfileStep[] = ['current_job', 'target_job', 'industry', 'timeframe'];

const PROFILE_QUESTIONS: Record<ProfileStep, string> = {
    current_job: 'สวัสดีครับ! ก่อนเริ่มเรียน ขอทำความรู้จักหน่อย — ตอนนี้คุณทำงานในตำแหน่งอะไร?',
    target_job: 'เยี่ยมเลย! แล้วเป้าหมาย/ตำแหน่งที่อยากเป็นในอนาคตคืออะไร?',
    industry: 'รับทราบ คุณอยู่ในอุตสาหกรรมหรือสายงานไหน?',
    timeframe: 'อีกหนึ่งคำถาม — อยากบรรลุเป้าหมายภายในกรอบเวลาเท่าไร? (เช่น 3 เดือน, 6 เดือน, 1 ปี)',
};

const PROFILE_DONE_MESSAGE =
    'ขอบคุณครับ! บันทึกข้อมูลแล้ว ผู้ช่วยจะปรับคำตอบให้เหมาะกับคุณยิ่งขึ้น เริ่มถามอะไรเกี่ยวกับคอร์สนี้ได้เลย';

function getHistoryTimeBucket(updatedAt: number): HistoryTimeBucket {
    const now = new Date();
    const d = new Date(updatedAt);
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startToday - startThat) / 86400000);
    if (diffDays < 0) return 'today';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays >= 2 && diffDays <= 6) return 'week';
    return 'older';
}

const DEFAULT_MODES: LearningModeApi[] = ['general'];

function initialModeFor(surface: AssistantSurface, modes: LearningModeApi[]): LearningModeApi {
    if (surface === 'enroll' && modes.includes('before_class')) return 'before_class';
    if (surface === 'watch' && modes.includes('during_class')) return 'during_class';
    if (modes.includes('general')) return 'general';
    return modes[0] ?? 'general';
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
    surface = 'general',
    courseId = null,
    lessonId,
    chapterId,
    lessonComplete = false,
    courseComplete = false,
    modes,
    userMember,
    canUse,
    getVideoTimestamp,
    learningPathId,
    learningPathName,
    additionalContext,
}) => {
    const { open, setOpen } = useAssistant();
    const allowedModes = modes && modes.length ? modes : DEFAULT_MODES;
    const singleMode = allowedModes.length === 1;
    const initialMode = initialModeFor(surface, allowedModes);

    const [selectedMode, setSelectedMode] = useState<LearningModeApi | null>(
        singleMode ? initialMode : null
    );
    const [pinnedConversationId, setPinnedConversationId] = useState<string | null>(null);
    const [enrollHandoffChecked, setEnrollHandoffChecked] = useState(false);
    const [sessionKey, setSessionKey] = useState(0);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [historyRefresh, setHistoryRefresh] = useState(0);
    const [serverHistory, setServerHistory] = useState<AssistantHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [fullPage, setFullPage] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<AssistantUserProfile | null>(null);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [profileEditOpen, setProfileEditOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [profileDraft, setProfileDraft] = useState<Partial<AssistantUserProfile>>({});
    const [profileStepIdx, setProfileStepIdx] = useState(0);
    const skillpassOn = isSkillpassOnboardingEnabled();
    const [fsAiUserId, setFsAiUserId] = useState<string | null>(null);
    const [ensureReady, setEnsureReady] = useState(!skillpassOn);
    const [ensureError, setEnsureError] = useState<string | null>(null);
    /** Upstream has no POST /users/ensure (older fs-ai) — chat works without SkillPass profile sync. */
    const [ensureEndpointUnavailable, setEnsureEndpointUnavailable] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(!skillpassOn);
    const [serverUserProfile, setServerUserProfile] = useState<UserProfileOut | null>(null);
    const [profileSummaryTh, setProfileSummaryTh] = useState<string | null>(null);

    const allowed = canUse ?? canUseLearningAssistant(userMember);
    const configured = isFsAiApiConfigured();

    const effectiveProfile = useMemo<AssistantUserProfile | null>(
        () => userProfile ?? userProfileOutToAssistant(serverUserProfile),
        [userProfile, serverUserProfile]
    );

    const hasSavedProfile = hasDisplayableAssistantProfile(effectiveProfile);

    const needsSkillpassOnboarding =
        skillpassOn && ensureReady && !!fsAiUserId && !onboardingComplete && !hasSavedProfile;

    const inSkillpassOnboarding =
        needsSkillpassOnboarding || (skillpassOn && ensureReady && !!fsAiUserId && profileEditOpen);

    /** SkillPass needs fs-ai user id from ensure; without host userMember we still allow general chat. */
    const skillpassConversationReady =
        !skillpassOn ||
        !!fsAiUserId ||
        ensureEndpointUnavailable ||
        !userMember;

    const convQuery = useAssistantConversation(
        courseId,
        selectedMode ?? initialMode,
        allowed &&
            configured &&
            ensureReady &&
            !inSkillpassOnboarding &&
            skillpassConversationReady,
        {
            pinnedConversationId: pinnedConversationId,
            sessionKey,
            fsAiUserId,
        }
    );
    const conversationId = convQuery.data ?? null;
    const { ensureConversation, isLoading: isCreatingConversation } = convQuery;

    const chatInputReady =
        allowed &&
        configured &&
        ensureReady &&
        !inSkillpassOnboarding &&
        skillpassConversationReady &&
        !isCreatingConversation;

    const { apiMode, lastError } = useAssistantPhase({
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

    const { messages, setMessages, suggestedActions, streaming, error: streamError, send, reset } = useAssistantStream();

    useEffect(() => {
        setFullPage(readAssistantFullPagePreference());
        if (!skillpassOn) {
            setUserProfile(readAssistantUserProfile());
        }
        setProfileLoaded(true);
    }, [skillpassOn]);

    useEffect(() => {
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
            const claims = oauthClaimsFromUserMember(userMember);
            if (!claims) {
                if (!cancelled) setEnsureReady(true);
                return;
            }
            try {
                const res = await onboardingApi.ensureUser(claims);
                if (cancelled) return;
                setFsAiUserId(res.user_id);
                setOnboardingComplete(res.onboarding_complete);
                setServerUserProfile(res.user_profile ?? null);
                const mapped = userProfileOutToAssistant(res.user_profile);
                if (mapped) {
                    setUserProfile(mapped);
                    writeAssistantUserProfile(mapped);
                }
                if (res.onboarding_complete) {
                    setOnboardingComplete(true);
                }
            } catch (e) {
                if (!cancelled) {
                    const status = axios.isAxiosError(e) ? e.response?.status : undefined;
                    if (status === 404) {
                        setEnsureEndpointUnavailable(true);
                        setOnboardingComplete(true);
                        setEnsureError(null);
                    } else {
                        setEnsureError(
                            e instanceof Error ? e.message : 'เชื่อมต่อ Futureskill ไม่สำเร็จ'
                        );
                    }
                }
            } finally {
                if (!cancelled) setEnsureReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [profileLoaded, skillpassOn, userMember]);

    const profileComplete = skillpassOn
        ? onboardingComplete || hasSavedProfile
        : isAssistantUserProfileComplete(userProfile);
    const inLegacyProfileChat =
        !skillpassOn && profileLoaded && (!profileComplete || profileEditOpen);
    const inProfileChat = inLegacyProfileChat;

    const canOpenProfileMenu =
        profileLoaded &&
        (skillpassOn
            ? ensureReady && !!fsAiUserId && (hasSavedProfile || onboardingComplete)
            : profileComplete);
    const currentProfileStep: ProfileStep | null =
        inProfileChat && profileStepIdx < PROFILE_STEPS.length ? PROFILE_STEPS[profileStepIdx] : null;

    const profileChatMessages = useMemo<AssistantMessage[]>(() => {
        if (!inProfileChat) return [];
        const out: AssistantMessage[] = [];
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

    const persistLegacyUserProfile = useCallback(
        async (finalProfile: AssistantUserProfile) => {
            writeAssistantUserProfile(finalProfile);
            setUserProfile(finalProfile);
            if (!fsAiUserId) return;
            try {
                const res = await onboardingApi.updateUserProfile(fsAiUserId, finalProfile);
                setOnboardingComplete(res.onboarding_complete);
                setServerUserProfile(res.user_profile ?? null);
            } catch {
                /* local profile still saved */
            }
        },
        [fsAiUserId]
    );

    const handleProfileAnswer = useCallback(
        (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || !currentProfileStep) return;
            const nextDraft: Partial<AssistantUserProfile> = {
                ...profileDraft,
                [currentProfileStep]: trimmed,
            };
            setProfileDraft(nextDraft);
            const nextIdx = profileStepIdx + 1;
            setProfileStepIdx(nextIdx);
            if (nextIdx >= PROFILE_STEPS.length) {
                const finalProfile: AssistantUserProfile = {
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
        },
        [currentProfileStep, profileDraft, profileStepIdx, persistLegacyUserProfile]
    );

    const refreshEnsureUser = useCallback(async () => {
        if (!userMember) return;
        const claims = oauthClaimsFromUserMember(userMember);
        if (!claims) return;
        const res = await onboardingApi.ensureUser(claims);
        setFsAiUserId(res.user_id);
        setOnboardingComplete(res.onboarding_complete);
        setServerUserProfile(res.user_profile ?? null);
        const mapped = userProfileOutToAssistant(res.user_profile);
        if (mapped) {
            setUserProfile(mapped);
            writeAssistantUserProfile(mapped);
        }
        if (res.onboarding_complete) {
            setOnboardingComplete(true);
        }
    }, [userMember]);

    const handleOnboardingComplete = useCallback(() => {
        setProfileEditOpen(false);
        setOnboardingComplete(true);
        void refreshEnsureUser().catch(() => undefined);
    }, [refreshEnsureUser]);

    useEffect(() => {
        if (!skillpassOn || !fsAiUserId || !onboardingComplete || profileEditOpen || !hasSavedProfile) {
            setProfileSummaryTh(null);
            return;
        }
        let cancelled = false;
        void onboardingApi
            .getOutcome(fsAiUserId)
            .then(oc => {
                if (!cancelled) setProfileSummaryTh(oc.starter_profile.summary_th ?? null);
            })
            .catch(() => {
                if (!cancelled) setProfileSummaryTh(null);
            });
        return () => {
            cancelled = true;
        };
    }, [skillpassOn, fsAiUserId, onboardingComplete, profileEditOpen, hasSavedProfile]);

    const startProfileEdit = useCallback(() => {
        if (skillpassOn) {
            setProfileEditOpen(true);
            return;
        }
        setProfileDraft(userProfile ?? {});
        let idx = 0;
        if (userProfile) {
            for (idx = 0; idx < PROFILE_STEPS.length; idx++) {
                if (!userProfile[PROFILE_STEPS[idx]]?.trim()) break;
            }
        }
        setProfileStepIdx(idx);
        setProfileEditOpen(true);
    }, [skillpassOn, userProfile]);

    const openProfileMenu = useCallback(() => {
        setProfileMenuOpen(true);
    }, []);

    const handleProfileEditFromMenu = useCallback(() => {
        setProfileMenuOpen(false);
        startProfileEdit();
    }, [startProfileEdit]);

    const cancelProfileEdit = useCallback(() => {
        setProfileEditOpen(false);
        setProfileDraft({});
        setProfileStepIdx(0);
    }, []);

    const loadServerHistory = useCallback(async () => {
        if (!fsAiUserId) return;
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const res = await fsAiApi.listConversations(fsAiUserId, { limit: 100 });
            setServerHistory(res.items.map(mapApiConversationToHistoryEntry));
        } catch (err) {
            const status = axios.isAxiosError(err) ? err.response?.status : undefined;
            const detail = axios.isAxiosError(err)
                ? typeof err.response?.data === 'string'
                    ? err.response.data
                    : JSON.stringify(err.response?.data)
                : (err as Error)?.message;
            setHistoryError(`โหลดประวัติไม่สำเร็จ (${status ?? 'network'}): ${detail || ''}`);
        } finally {
            setHistoryLoading(false);
        }
    }, [fsAiUserId]);

    useEffect(() => {
        if (!historyOpen || !fsAiUserId) return;
        void loadServerHistory();
    }, [historyOpen, fsAiUserId, historyRefresh, loadServerHistory]);

    // Watch surface: continue the user's most recent conversation (server-backed when logged in)
    useEffect(() => {
        if (surface !== 'watch' || enrollHandoffChecked) return;
        if (pinnedConversationId) {
            setEnrollHandoffChecked(true);
            return;
        }
        if (fsAiUserId) {
            let cancelled = false;
            void fsAiApi
                .listConversations(fsAiUserId, { limit: 1 })
                .then(res => {
                    if (cancelled) return;
                    const latest = res.items[0];
                    if (latest?.id) setPinnedConversationId(String(latest.id));
                    setEnrollHandoffChecked(true);
                })
                .catch(() => {
                    if (!cancelled) setEnrollHandoffChecked(true);
                });
            return () => {
                cancelled = true;
            };
        }
        const enrollItems = listAssistantConversations(courseId ?? null, 'enroll');
        if (enrollItems.length > 0) {
            setPinnedConversationId(enrollItems[0].id);
        }
        setEnrollHandoffChecked(true);
    }, [surface, courseId, pinnedConversationId, enrollHandoffChecked, fsAiUserId]);

    useEffect(() => {
        if (!historyOpen) setHistorySearch('');
    }, [historyOpen]);

    useEffect(() => {
        reset();
    }, [pinnedConversationId, sessionKey, reset]);

    useEffect(() => {
        if (!pinnedConversationId || pinnedConversationId !== conversationId) return;
        let cancelled = false;
        setHistoryError(null);
        fsAiApi
            .getConversation(pinnedConversationId)
            .then(conv => {
                if (cancelled) return;
                const seeded: AssistantMessage[] = (conv.messages || [])
                    .filter(m => m.role === 'user' || m.role === 'assistant')
                    .map(m => ({
                        id: m.id,
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                        sources: m.sources,
                    }));
                setMessages(seeded);
            })
            .catch(err => {
                if (cancelled) return;
                const status = axios.isAxiosError(err) ? err.response?.status : undefined;
                const detail = axios.isAxiosError(err)
                    ? typeof err.response?.data === 'string'
                        ? err.response?.data
                        : JSON.stringify(err.response?.data)
                    : (err as Error)?.message;
                if (status === 404) {
                    removeAssistantConversation(pinnedConversationId);
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

    const historyItems = useMemo(() => {
        if (fsAiUserId) return serverHistory;
        return listAssistantConversations(courseId ?? null, surface);
    }, [fsAiUserId, serverHistory, courseId, surface]);

    const filteredHistoryItems = useMemo(() => {
        const q = historySearch.trim().toLowerCase();
        if (!q) return historyItems;
        return historyItems.filter(
            e => e.title.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
        );
    }, [historyItems, historySearch]);

    const groupedHistory = useMemo(() => {
        const map = new Map<HistoryTimeBucket, typeof historyItems>();
        for (const b of HISTORY_BUCKET_ORDER) map.set(b, []);
        for (const entry of filteredHistoryItems) {
            const bucket = getHistoryTimeBucket(entry.updatedAt);
            const arr = map.get(bucket);
            if (arr) arr.push(entry);
        }
        return map;
    }, [filteredHistoryItems]);

    const openHistory = useCallback(() => {
        setHistoryRefresh(n => n + 1);
        setHistoryOpen(true);
    }, []);

    const handleSelectHistory = useCallback(
        (id: string) => {
            setPinnedConversationId(id);
            setHistoryOpen(false);
        },
        [setPinnedConversationId]
    );

    const handleNewConversation = useCallback(() => {
        setPinnedConversationId(null);
        setSessionKey(k => k + 1);
        setHistoryOpen(false);
    }, []);

    const handleRemoveHistoryEntry = useCallback(
        (id: string) => {
            Modal.confirm({
                title: 'ลบบทสนทนานี้?',
                content: fsAiUserId
                    ? 'การสนทนาจะถูกลบจากบัญชีของคุณและจะหายจากทุกหน้า'
                    : 'ลบเฉพาะรายการในประวัติบนเครื่องนี้',
                okText: 'ลบ',
                cancelText: 'ยกเลิก',
                okButtonProps: { danger: true },
                onOk: async () => {
                    if (fsAiUserId) {
                        await fsAiApi.deleteConversation(id);
                    } else {
                        removeAssistantConversation(id);
                    }
                    setHistoryRefresh(n => n + 1);
                    if (pinnedConversationId === id) setPinnedConversationId(null);
                },
            });
        },
        [pinnedConversationId, fsAiUserId]
    );

    const toggleFullPage = useCallback(() => {
        setFullPage(v => {
            const next = !v;
            writeAssistantFullPagePreference(next);
            return next;
        });
    }, []);

    const handleSend = useCallback(
        async (text: string, actionIntent?: string) => {
            if (!allowed || !chatInputReady) return;
            if (!singleMode && !selectedMode && !pinnedConversationId) return;

            let activeConversationId = conversationId;
            if (!activeConversationId) {
                try {
                    activeConversationId = await ensureConversation();
                } catch {
                    return;
                }
            }

            const ts = getVideoTimestamp?.() ?? undefined;
            const metadata = buildLearningMetadata({
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
                profileOverride:
                    userProfile ??
                    userProfileOutToAssistant(serverUserProfile) ??
                    undefined,
            });
            const title = previewTitle(text);
            if (fsAiUserId) {
                void fsAiApi.updateConversationTitle(activeConversationId, title).catch(() => {
                    /* title sync is best-effort */
                });
                setHistoryRefresh(n => n + 1);
            } else {
                upsertAssistantConversation({
                    id: activeConversationId,
                    courseId: courseId ?? null,
                    surface,
                    title,
                });
                setHistoryRefresh(n => n + 1);
            }
            await send(activeConversationId, { message: text, metadata });
        },
        [
            allowed,
            chatInputReady,
            apiMode,
            chapterId,
            conversationId,
            ensureConversation,
            courseComplete,
            courseId,
            getVideoTimestamp,
            lessonComplete,
            lessonId,
            learningPathId,
            learningPathName,
            additionalContext,
            pinnedConversationId,
            selectedMode,
            send,
            singleMode,
            surface,
            fsAiUserId,
            serverUserProfile,
            userMember,
            userProfile,
        ]
    );

    if (!allowed || !configured) {
        return null;
    }

    const showPicker = !singleMode && messages.length === 0 && !selectedMode && !pinnedConversationId;
    const panelWidthStyle = fullPage ? undefined : ASSISTANT_PANEL_WIDTH;

    return (
        <>
            <aside
                aria-hidden={!open ? 'true' : 'false'}
                style={panelWidthStyle !== undefined ? { width: panelWidthStyle } : undefined}
                className={`fixed z-40 flex flex-col border-l border-blackFS-500 bg-blackFS-800 shadow-2xl transition-[transform,width] duration-300 ease-out ${
                    fullPage ? 'inset-0 max-w-none' : 'inset-y-0 right-0 max-w-[100vw]'
                } ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex h-full min-h-0 flex-col p-4">
                    <header className="mb-3 flex shrink-0 items-center gap-1 border-b border-blackFS-600 pb-3">
                        <Tooltip title="บทสนทนาก่อนหน้า">
                            <button
                                type="button"
                                aria-label="เลือกบทสนทนาก่อนหน้า"
                                onClick={openHistory}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400">
                                <LuHistory size={20} aria-hidden />
                            </button>
                        </Tooltip>
                        <h2 className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-white">
                            ผู้ช่วยการเรียน
                        </h2>
                        <Tooltip title="สนทนาใหม่">
                            <button
                                type="button"
                                aria-label="เริ่มบทสนทนาใหม่"
                                onClick={handleNewConversation}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400">
                                <LuMessageSquarePlus size={20} aria-hidden />
                            </button>
                        </Tooltip>
                        <Tooltip title={profileEditOpen ? 'กลับไปสนทนา' : 'แก้ไขโปรไฟล์ผู้เรียน'}>
                            <button
                                type="button"
                                aria-label={profileEditOpen ? 'กลับไปสนทนา' : 'แก้ไขโปรไฟล์ผู้เรียน'}
                                onClick={profileEditOpen ? cancelProfileEdit : openProfileMenu}
                                disabled={profileEditOpen ? false : !canOpenProfileMenu}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400 disabled:opacity-40">
                                <LuUserCog size={20} aria-hidden />
                            </button>
                        </Tooltip>
                        <Tooltip title={fullPage ? 'โหมดแผงข้าง' : 'โหมดเต็มหน้าจอ'}>
                            <button
                                type="button"
                                aria-label={fullPage ? 'ย่อแผงผู้ช่วย' : 'ขยายแผงผู้ช่วยเต็มหน้าจอ'}
                                onClick={toggleFullPage}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400">
                                {fullPage ? <LuMinimize2 size={20} aria-hidden /> : <LuMaximize2 size={20} aria-hidden />}
                            </button>
                        </Tooltip>
                        <Tooltip title="ปิดผู้ช่วย">
                            <button
                                type="button"
                                aria-label="ปิดผู้ช่วยการเรียน"
                                onClick={() => setOpen(false)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400">
                                <LuX size={20} aria-hidden />
                            </button>
                        </Tooltip>
                    </header>
                    {lastError === 'FORBIDDEN' && (
                        <Alert type="error" message="ไม่มีสิทธิ์ใช้งานผู้ช่วย" className="mb-3" showIcon />
                    )}
                    {convQuery.isError && (
                        <Alert type="error" message="ไม่สามารถสร้างบทสนทนาได้" className="mb-3" showIcon />
                    )}
                    {streamError && (
                        <Alert type="error" message={streamError} className="mb-3" showIcon closable />
                    )}
                    {historyError && (
                        <Alert
                            type="warning"
                            message={historyError}
                            className="mb-3"
                            showIcon
                            closable
                            onClose={() => setHistoryError(null)}
                        />
                    )}
                    {ensureError && (
                        <Alert
                            type="error"
                            message={ensureError}
                            className="mb-3"
                            showIcon
                            closable
                            onClose={() => setEnsureError(null)}
                        />
                    )}
                    <div
                        className={`flex min-h-0 flex-1 flex-col ${
                            inSkillpassOnboarding || inProfileChat ? 'overflow-hidden' : 'overflow-y-auto'
                        }`}>
                        {inSkillpassOnboarding && fsAiUserId ? (
                            <OnboardingWizard
                                fsAiUserId={fsAiUserId}
                                restart={profileEditOpen && (onboardingComplete || hasSavedProfile)}
                                onComplete={handleOnboardingComplete}
                            />
                        ) : inProfileChat ? (
                            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                                <MessageList messages={profileChatMessages} />
                            </div>
                        ) : showPicker ? (
                            <ModePicker
                                disabled={!chatInputReady}
                                modes={allowedModes}
                                onSelect={mode => setSelectedMode(mode)}
                            />
                        ) : (
                            <>
                                {messages.length === 0 ? (
                                    <WelcomeMessage mode={apiMode} />
                                ) : (
                                    <MessageList messages={messages} />
                                )}
                                <SuggestedActions
                                    mode={apiMode}
                                    actions={suggestedActions}
                                    disabled={streaming || !chatInputReady || isCreatingConversation}
                                    onSelect={(message, actionIntent) => {
                                        void handleSend(message, actionIntent);
                                    }}
                                />
                            </>
                        )}
                    </div>
                    {!inSkillpassOnboarding && (
                        <div className="shrink-0 border-t border-blackFS-600 pt-3">
                            <Composer
                                disabled={
                                    inProfileChat
                                        ? !currentProfileStep
                                        : !chatInputReady
                                }
                                loading={inProfileChat ? false : streaming || isCreatingConversation}
                                onSend={text => {
                                    if (inProfileChat) {
                                        handleProfileAnswer(text);
                                    } else {
                                        void handleSend(text);
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </aside>

            <Drawer
                title="บทสนทนาก่อนหน้า"
                placement="left"
                width={360}
                onClose={() => setHistoryOpen(false)}
                open={historyOpen}
                destroyOnClose={false}
                extra={
                    <Tooltip title="เริ่มบทสนทนาใหม่">
                        <button
                            type="button"
                            aria-label="เริ่มบทสนทนาใหม่จากแผงประวัติ"
                            onClick={handleNewConversation}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-black/70 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-500 dark:text-white/80 dark:hover:bg-white/10">
                            <LuMessageSquarePlus size={20} aria-hidden />
                        </button>
                    </Tooltip>
                }
                styles={{
                    body: { paddingTop: 12, paddingBottom: 16 },
                }}
                classNames={{
                    body: 'bg-zinc-50 dark:bg-zinc-950',
                }}>
                <div className="flex flex-col gap-4">
                    <Input
                        allowClear
                        value={historySearch}
                        onChange={e => setHistorySearch(e.target.value)}
                        placeholder="ค้นหาจากหัวข้อหรือรหัส…"
                        aria-label="ค้นหาบทสนทนา"
                        prefix={<LuSearch className="text-black/40 dark:text-white/45" size={16} aria-hidden />}
                        className="rounded-xl border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900"
                    />
                    {historyLoading ? (
                        <p className="text-center text-sm text-black/60 dark:text-white/55">กำลังโหลดประวัติ…</p>
                    ) : historyItems.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-black/15 bg-white px-4 py-8 text-center dark:border-white/15 dark:bg-zinc-900/80">
                            <LuMessageSquare
                                className="mx-auto mb-3 text-black/25 dark:text-white/30"
                                size={36}
                                aria-hidden
                            />
                            <p className="text-sm font-medium text-black/75 dark:text-white/75">
                                ยังไม่มีบทสนทนาที่บันทึก
                            </p>
                            <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                                ส่งข้อความเพื่อให้หัวข้อปรากฏที่นี่
                            </p>
                        </div>
                    ) : filteredHistoryItems.length === 0 ? (
                        <p className="text-center text-sm text-black/60 dark:text-white/55">
                            ไม่พบบทสนทนาที่ตรงกับ &ldquo;{historySearch.trim()}&rdquo;
                        </p>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {HISTORY_BUCKET_ORDER.map(bucket => {
                                const items = groupedHistory.get(bucket) ?? [];
                                if (!items.length) return null;
                                return (
                                    <section key={bucket} aria-labelledby={`history-bucket-${bucket}`}>
                                        <h3
                                            id={`history-bucket-${bucket}`}
                                            className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-black/45 dark:text-white/45">
                                            {HISTORY_BUCKET_LABELS[bucket]}
                                        </h3>
                                        <ul className="m-0 list-none space-y-2 p-0" role="list">
                                            {items.map(entry => {
                                                const active = entry.id === conversationId;
                                                const dateLabel = new Date(entry.updatedAt).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                });
                                                return (
                                                    <li key={entry.id}>
                                                        <div
                                                            className={`flex min-h-[52px] overflow-hidden rounded-xl border transition-colors ${
                                                                active
                                                                    ? 'border-primaryFS-500/50 bg-primaryFS-500/15 shadow-sm dark:bg-primaryFS-500/20'
                                                                    : 'border-black/8 bg-white hover:border-black/15 hover:bg-zinc-50/90 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/18 dark:hover:bg-zinc-800/90'
                                                            }`}>
                                                            <Tooltip title={entry.title} placement="right">
                                                                <button
                                                                    type="button"
                                                                    aria-current={active ? 'true' : undefined}
                                                                    aria-label={`เปิดบทสนทนา: ${entry.title}`}
                                                                    onClick={() => handleSelectHistory(entry.id)}
                                                                    className="flex min-h-[52px] min-w-0 flex-1 items-start gap-3 px-3 py-3 text-left touch-manipulation">
                                                                    <span
                                                                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                                            active
                                                                                ? 'bg-primaryFS-500/25 text-primaryFS-600 dark:text-primaryFS-300'
                                                                                : 'bg-black/[0.06] text-black/50 dark:bg-white/10 dark:text-white/55'
                                                                        }`}>
                                                                        <LuMessageSquare size={18} aria-hidden />
                                                                    </span>
                                                                    <span className="min-w-0 flex-1">
                                                                        <span className="line-clamp-2 text-sm font-medium leading-snug text-black/90 dark:text-white/90">
                                                                            {entry.title}
                                                                        </span>
                                                                        <time
                                                                            dateTime={new Date(entry.updatedAt).toISOString()}
                                                                            className="mt-1 block text-xs tabular-nums text-black/50 dark:text-white/50">
                                                                            {dateLabel}
                                                                        </time>
                                                                    </span>
                                                                </button>
                                                            </Tooltip>
                                                            <Dropdown
                                                                trigger={['click']}
                                                                placement="bottomRight"
                                                                menu={{
                                                                    items: [
                                                                        {
                                                                            key: 'remove',
                                                                            danger: true,
                                                                            icon: <LuTrash2 size={16} aria-hidden />,
                                                                            label: 'ลบจากรายการ',
                                                                            onClick: () => handleRemoveHistoryEntry(entry.id),
                                                                        },
                                                                    ],
                                                                }}>
                                                                <button
                                                                    type="button"
                                                                    aria-label={`ตัวเลือกสำหรับ ${entry.title}`}
                                                                    onClick={e => e.stopPropagation()}
                                                                    className="flex h-[52px] w-11 shrink-0 items-center justify-center border-l border-black/8 text-black/45 transition hover:bg-black/[0.04] hover:text-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primaryFS-500 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">
                                                                    <LuMoreVertical size={18} aria-hidden />
                                                                </button>
                                                            </Dropdown>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Drawer>

            <Drawer
                title="แก้ไขโปรไฟล์ผู้เรียน"
                placement="right"
                width={360}
                onClose={() => setProfileMenuOpen(false)}
                open={profileMenuOpen}
                destroyOnClose={false}
                styles={{
                    body: { paddingTop: 12, paddingBottom: 16 },
                }}
                classNames={{
                    body: 'bg-zinc-50 dark:bg-zinc-950',
                }}>
                {effectiveProfile && hasSavedProfile ? (
                    <AssistantProfileCard
                        profile={effectiveProfile}
                        summary={profileSummaryTh}
                        onEdit={handleProfileEditFromMenu}
                        className="mb-0"
                    />
                ) : skillpassOn ? (
                    <div className="rounded-xl border border-dashed border-black/15 bg-white px-4 py-8 text-center dark:border-white/15 dark:bg-zinc-900/80">
                        <p className="text-sm font-medium text-black/75 dark:text-white/75">
                            ยังไม่มีโปรไฟล์ผู้เรียน
                        </p>
                        <p className="mt-2 text-xs text-black/55 dark:text-white/55">
                            กรอกแบบสอบถาม Futureskill เพื่อให้ผู้ช่วยปรับคำตอบให้เหมาะกับคุณ
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="m-0 text-sm text-black/70 dark:text-white/70">
                            ตั้งค่าโปรไฟล์ผู้เรียนเพื่อให้ผู้ช่วยแนะนำเนื้อหาได้ตรงกับเป้าหมายของคุณ
                        </p>
                        <button
                            type="button"
                            onClick={handleProfileEditFromMenu}
                            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primaryFS-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryFS-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400">
                            เริ่มตั้งค่าโปรไฟล์
                        </button>
                    </div>
                )}
            </Drawer>
        </>
    );
};
