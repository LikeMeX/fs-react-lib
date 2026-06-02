import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'antd';
import { LuCheck as LuCheckRaw, LuLoader as LuLoaderRaw } from 'react-icons/lu';
import { AssistantMessage } from '../types/learningAssistant';
import {
    OnboardingOutcome,
    OnboardingSession,
    OnboardingStep,
    UserProfileOut,
    onboardingApi,
} from '../services/onboardingApi';
import { MessageList } from './MessageList';

type IconFC = React.FC<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
const LuCheck = LuCheckRaw as unknown as IconFC;
const LuLoader = LuLoaderRaw as unknown as IconFC;

export interface OnboardingWizardProps {
    fsAiUserId: string;
    restart?: boolean;
    /** Called when onboarding is finished or user continues after a completed session. */
    onComplete: (profile?: UserProfileOut | null) => void;
}

const DONE_MESSAGE =
    'ขอบคุณครับ! บันทึกโปรไฟล์ SkillPass แล้ว ผู้ช่วยจะปรับคำตอบให้เหมาะกับคุณยิ่งขึ้น เริ่มถามอะไรเกี่ยวกับการเรียนได้เลย';

const optionButtonClass =
    'flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm leading-snug transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryFS-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blackFS-800 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none';

const primaryButtonClass =
    'inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl bg-primaryFS-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 ease-out hover:bg-primaryFS-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryFS-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blackFS-800 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.99] motion-reduce:active:scale-100';

const secondaryButtonClass =
    'inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl border border-blackFS-500 bg-blackFS-700 px-4 py-2.5 text-sm font-medium text-blackFS-100 transition duration-150 ease-out hover:border-blackFS-400 hover:bg-blackFS-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryFS-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blackFS-800 disabled:cursor-not-allowed disabled:opacity-40';

const fieldInputClass =
    'w-full min-h-11 rounded-xl border border-blackFS-500 bg-blackFS-700 px-3.5 py-2.5 text-sm text-blackFS-100 placeholder-blackFS-300 transition focus:border-primaryFS-400 focus:outline-none focus:ring-2 focus:ring-primaryFS-500/40 disabled:cursor-not-allowed disabled:opacity-50';

const suggestionChipClass =
    'inline-flex min-h-9 touch-manipulation items-center rounded-full border border-blackFS-500 bg-blackFS-700/90 px-3 py-1.5 text-xs font-medium text-blackFS-200 transition duration-150 ease-out hover:border-primaryFS-400 hover:bg-blackFS-600 hover:text-blackFS-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryFS-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blackFS-800 disabled:cursor-not-allowed disabled:opacity-50';

/** Keeps long option lists from covering earlier onboarding questions in the panel. */
const scrollableOptionsClass =
    'max-h-[min(40vh,220px)] overflow-y-auto overscroll-contain pr-0.5 sm:max-h-[min(45vh,260px)]';

function isTextPrimaryStep(inputType: string): boolean {
    return (
        inputType === 'text' ||
        inputType === 'required_text' ||
        inputType === 'single_select' ||
        inputType === 'text_with_suggestions'
    );
}

function shouldUseTextPrimary(step: OnboardingStep): boolean {
    if (
        step.input_type === 'multi_select' ||
        step.input_type === 'number' ||
        step.input_type === 'optional_text'
    ) {
        return false;
    }
    if (isTextPrimaryStep(step.input_type)) return true;
    return Boolean(step.options?.length);
}

/** Maps typed text to API answer shape (option id + optional other_text). */
export function buildTextAnswerPayload(
    step: OnboardingStep,
    text: string
): { answer: string; otherText?: string } {
    const trimmed = text.trim();
    const options = step.options ?? [];
    const normalized = trimmed.toLowerCase();

    const matchById = options.find(o => o.id.toLowerCase() === normalized);
    if (matchById) return { answer: matchById.id };

    const matchByLabel = options.find(o => o.label.trim().toLowerCase() === normalized);
    if (matchByLabel) return { answer: matchByLabel.id };

    if (step.input_type === 'single_select') {
        const otherOption = options.find(
            o => o.id === 'other' || o.id.endsWith('_other')
        );
        if (otherOption) {
            return { answer: otherOption.id, otherText: trimmed };
        }
        return { answer: trimmed };
    }

    return { answer: trimmed };
}

function textPlaceholderForStep(stepId: string): string {
    const id = stepId.toLowerCase();
    if (id.includes('target') || id.includes('role') || id.includes('job')) {
        return 'พิมพ์ตำแหน่งหรือสายงานที่สนใจ เช่น Data Analyst';
    }
    if (id.includes('industry')) {
        return 'พิมพ์อุตสาหกรรมหรือสายงานของคุณ';
    }
    if (id.includes('current')) {
        return 'พิมพ์ตำแหน่งงานปัจจุบันของคุณ';
    }
    return 'พิมพ์คำตอบของคุณ';
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
    fsAiUserId,
    restart = false,
    onComplete,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<OnboardingSession | null>(null);
    const [outcome, setOutcome] = useState<OnboardingOutcome | null>(null);
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [multiSelected, setMultiSelected] = useState<string[]>([]);
    const [otherText, setOtherText] = useState('');
    const [textAnswer, setTextAnswer] = useState('');
    const [numberAnswer, setNumberAnswer] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadSession = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const s = restart
                ? await onboardingApi.startSession(fsAiUserId, true)
                : await onboardingApi.getSession(fsAiUserId, restart);
            setSession(s);
            if (s.is_complete) {
                const oc = await onboardingApi.getOutcome(fsAiUserId);
                setOutcome(oc);
                setMessages([
                    {
                        id: 'onboarding-done',
                        role: 'assistant',
                        content: `${DONE_MESSAGE}\n\n${oc.starter_profile.summary_th}`,
                    },
                ]);
            } else if (s.current_step) {
                setMessages([
                    {
                        id: `onboarding-${s.current_step.step_id}`,
                        role: 'assistant',
                        content: s.current_step.prompt_th,
                    },
                ]);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'โหลด onboarding ไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    }, [fsAiUserId, restart]);

    useEffect(() => {
        void loadSession();
    }, [loadSession]);

    const step = session?.current_step;
    const showComposer = !loading && !session?.is_complete && step;

    const resetInputs = () => {
        setMultiSelected([]);
        setOtherText('');
        setTextAnswer('');
        setNumberAnswer(null);
    };

    const finishFlow = async () => {
        try {
            const oc = await onboardingApi.getOutcome(fsAiUserId);
            setOutcome(oc);
        } catch {
            /* outcome optional for UI */
        }
        onComplete();
    };

    const submit = async (
        answer: string | string[] | number | null,
        display: string,
        otherTextOverride?: string
    ) => {
        if (!step || submitting) return;
        const loadingId = `loading-${Date.now()}`;
        setSubmitting(true);
        setError(null);
        setMessages(prev => [
            ...prev,
            { id: `user-${step.step_id}-${Date.now()}`, role: 'user', content: display },
            { id: loadingId, role: 'assistant', content: '' },
        ]);
        try {
            const resolvedOther =
                otherTextOverride ?? (otherText.trim() || undefined);
            const next = await onboardingApi.submitAnswer(
                fsAiUserId,
                step.step_id,
                answer,
                resolvedOther
            );
            setSession(next);
            resetInputs();
            setMessages(prev => {
                const withoutLoading = prev.filter(m => m.id !== loadingId);
                if (next.is_complete) {
                    return [
                        ...withoutLoading,
                        { id: 'onboarding-done', role: 'assistant', content: DONE_MESSAGE },
                    ];
                }
                if (next.current_step) {
                    return [
                        ...withoutLoading,
                        {
                            id: `onboarding-${next.current_step.step_id}`,
                            role: 'assistant',
                            content: next.current_step.prompt_th,
                        },
                    ];
                }
                return withoutLoading;
            });
            if (next.is_complete) {
                await finishFlow();
            }
        } catch (e) {
            setMessages(prev => prev.filter(m => m.id !== loadingId));
            setError(e instanceof Error ? e.message : 'ส่งคำตอบไม่สำเร็จ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSingleSelect = (id: string, label: string) => {
        void submit(id, label);
    };

    const handleMultiSubmit = () => {
        if (!multiSelected.length) return;
        const labels =
            step?.options.filter(o => multiSelected.includes(o.id)).map(o => o.label) ?? [];
        void submit(multiSelected, labels.join(', '));
    };

    const handleTextSubmit = () => {
        const t = textAnswer.trim();
        if (!t || !step) return;
        const payload = buildTextAnswerPayload(step, t);
        void submit(payload.answer, t, payload.otherText);
    };

    const handleNumberSubmit = () => {
        if (numberAnswer == null) return;
        void submit(numberAnswer, String(numberAnswer));
    };

    const toggleMulti = (id: string) => {
        setMultiSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const textPrimaryComposer = useMemo(() => {
        if (!step || !shouldUseTextPrimary(step)) return null;
        const suggestions = step.options ?? [];
        return (
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    className={fieldInputClass}
                    value={textAnswer}
                    onChange={e => setTextAnswer(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleTextSubmit();
                    }}
                    placeholder={textPlaceholderForStep(step.step_id)}
                    disabled={submitting}
                    autoFocus
                />
                <button
                    type="button"
                    className={primaryButtonClass}
                    disabled={submitting || !textAnswer.trim()}
                    onClick={handleTextSubmit}>
                    {submitting ? (
                        <LuLoader size={18} className="animate-spin" aria-hidden />
                    ) : (
                        'ถัดไป'
                    )}
                </button>
                {suggestions.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        <p className="m-0 text-xs text-blackFS-300">หรือเลือกตัวอย่าง</p>
                        <div className={`flex flex-wrap gap-2 ${scrollableOptionsClass}`}>
                            {suggestions.map(o => (
                                <button
                                    key={o.id}
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleSingleSelect(o.id, o.label)}
                                    className={suggestionChipClass}>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }, [step, textAnswer, submitting]);

    const optionButtons = useMemo(() => {
        if (!step?.options?.length) return null;
        if (shouldUseTextPrimary(step)) return null;
        if (step.input_type === 'multi_select') {
            const overMax =
                step.max_selections != null && multiSelected.length > step.max_selections;
            return (
                <div className="flex flex-col gap-3">
                    {step.max_selections != null && (
                        <p className="m-0 text-xs text-blackFS-300">
                            เลือกได้สูงสุด {step.max_selections} ข้อ
                        </p>
                    )}
                    <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${scrollableOptionsClass}`}>
                        {step.options.map(o => {
                            const selected = multiSelected.includes(o.id);
                            return (
                                <button
                                    key={o.id}
                                    type="button"
                                    disabled={submitting}
                                    aria-pressed={selected ? 'true' : 'false'}
                                    onClick={() => toggleMulti(o.id)}
                                    className={`${optionButtonClass} ${
                                        selected
                                            ? 'border-primaryFS-400 bg-primaryFS-500/15 text-blackFS-100'
                                            : 'border-blackFS-500 bg-blackFS-700 text-blackFS-200 hover:border-blackFS-400 hover:bg-blackFS-600 hover:text-blackFS-100'
                                    }`}>
                                    <span
                                        aria-hidden
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                            selected
                                                ? 'border-primaryFS-400 bg-primaryFS-500 text-white'
                                                : 'border-blackFS-400 bg-blackFS-800'
                                        }`}>
                                        {selected ? <LuCheck size={14} /> : null}
                                    </span>
                                    <span className="flex-1">{o.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    {multiSelected.includes('other') && (
                        <input
                            type="text"
                            className={fieldInputClass}
                            placeholder="ระบุเพิ่มเติม"
                            value={otherText}
                            onChange={e => setOtherText(e.target.value)}
                        />
                    )}
                    {overMax && (
                        <p className="m-0 text-xs text-red-300" role="alert">
                            เลือกได้ไม่เกิน {step.max_selections} ข้อ
                        </p>
                    )}
                    <button
                        type="button"
                        className={primaryButtonClass}
                        disabled={!multiSelected.length || overMax || submitting}
                        onClick={handleMultiSubmit}>
                        {submitting ? (
                            <LuLoader size={18} className="animate-spin" aria-hidden />
                        ) : (
                            'ถัดไป'
                        )}
                    </button>
                </div>
            );
        }
        return (
            <div className={`flex flex-col gap-2 ${scrollableOptionsClass}`}>
                {step.options.map(o => (
                    <button
                        key={o.id}
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSingleSelect(o.id, o.label)}
                        className={`${optionButtonClass} border-blackFS-500 bg-blackFS-700 text-blackFS-100 hover:border-primaryFS-400 hover:bg-blackFS-600`}>
                        {submitting ? (
                            <LuLoader size={16} className="ml-auto animate-spin text-blackFS-300" aria-hidden />
                        ) : null}
                        <span className="flex-1">{o.label}</span>
                    </button>
                ))}
            </div>
        );
    }, [step, multiSelected, otherText, submitting]);

    const plainTextComposer = useMemo(() => {
        if (!step || step.input_type === 'optional_text' || step.input_type === 'number') return null;
        if (step.options?.length || shouldUseTextPrimary(step)) return null;
        if (step.input_type !== 'text' && step.input_type !== 'required_text') return null;
        return (
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    className={fieldInputClass}
                    value={textAnswer}
                    onChange={e => setTextAnswer(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleTextSubmit();
                    }}
                    placeholder={textPlaceholderForStep(step.step_id)}
                    disabled={submitting}
                    autoFocus
                />
                <button
                    type="button"
                    className={primaryButtonClass}
                    disabled={submitting || !textAnswer.trim()}
                    onClick={handleTextSubmit}>
                    {submitting ? (
                        <LuLoader size={18} className="animate-spin" aria-hidden />
                    ) : (
                        'ถัดไป'
                    )}
                </button>
            </div>
        );
    }, [step, textAnswer, submitting]);

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 text-blackFS-200">
                    <LuLoader size={28} className="animate-spin text-primaryFS-400" aria-hidden />
                    <p className="m-0 text-sm">กำลังโหลด SkillPass...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="assistant-onboarding-wizard flex min-h-0 flex-1 flex-col overflow-hidden">
            {error && (
                <Alert
                    type="error"
                    message={error}
                    showIcon
                    className="mb-3 shrink-0"
                    closable
                    onClose={() => setError(null)}
                />
            )}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <MessageList messages={messages} />
            </div>
            {outcome?.recommended_courses?.length ? (
                <div className="mb-3 shrink-0 rounded-xl border border-blackFS-500 bg-blackFS-700/80 px-3.5 py-3 text-sm text-blackFS-100">
                    <p className="m-0 mb-2 font-semibold text-blackFS-100">คอร์สแนะนำ</p>
                    <ul className="m-0 list-disc space-y-1 pl-5 text-blackFS-200">
                        {outcome.recommended_courses.map(c => (
                            <li key={c.course_id}>{c.course_name}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
            {showComposer && (
                <div className="max-h-[min(55vh,420px)] shrink-0 overflow-y-auto overscroll-contain border-t border-blackFS-600 pt-3">
                    {textPrimaryComposer}
                    {plainTextComposer}
                    {optionButtons}
                    {step?.input_type === 'optional_text' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className={`${fieldInputClass} flex-1`}
                                    value={textAnswer}
                                    onChange={e => setTextAnswer(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleTextSubmit();
                                    }}
                                    placeholder="พิมพ์คำตอบ (ไม่บังคับ)"
                                />
                                <button
                                    type="button"
                                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primaryFS-500 px-4 text-sm font-semibold text-white transition hover:bg-primaryFS-400 disabled:opacity-40"
                                    disabled={submitting || !textAnswer.trim()}
                                    onClick={handleTextSubmit}>
                                    ส่ง
                                </button>
                            </div>
                            <button
                                type="button"
                                className={secondaryButtonClass}
                                disabled={submitting}
                                onClick={() => void submit('', 'ข้าม')}>
                                ข้าม
                            </button>
                        </div>
                    )}
                    {step?.input_type === 'number' && (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className={`${fieldInputClass} flex-1`}
                                min={1990}
                                max={2100}
                                value={numberAnswer ?? ''}
                                onChange={e => {
                                    const v = e.target.value;
                                    setNumberAnswer(v === '' ? null : Number(v));
                                }}
                                placeholder="เช่น 1995"
                                inputMode="numeric"
                            />
                            <button
                                type="button"
                                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primaryFS-500 px-4 text-sm font-semibold text-white transition hover:bg-primaryFS-400 disabled:opacity-40"
                                disabled={submitting || numberAnswer == null}
                                onClick={handleNumberSubmit}>
                                ถัดไป
                            </button>
                        </div>
                    )}
                </div>
            )}
            {session?.is_complete && (
                <div className="mt-auto shrink-0 border-t border-blackFS-600 pt-3">
                    <button type="button" className={primaryButtonClass} onClick={() => onComplete()}>
                        เริ่มสนทนา
                    </button>
                </div>
            )}
        </div>
    );
};
