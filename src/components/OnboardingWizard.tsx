import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Checkbox, Input, InputNumber, Space, Spin } from 'antd';
import {
    AssistantMessage,
} from '../types/learningAssistant';
import {
    OnboardingOutcome,
    OnboardingSession,
    UserProfileOut,
    onboardingApi,
} from '../services/onboardingApi';

export interface OnboardingWizardProps {
    fsAiUserId: string;
    restart?: boolean;
    onComplete: (profile: UserProfileOut | null | undefined) => void;
}

const DONE_MESSAGE =
    'ขอบคุณครับ! บันทึกโปรไฟล์ SkillPass แล้ว ผู้ช่วยจะปรับคำตอบให้เหมาะกับคุณยิ่งขึ้น เริ่มถามอะไรเกี่ยวกับการเรียนได้เลย';

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

    const appendExchange = (userContent: string, next: OnboardingSession) => {
        const nextMsgs: AssistantMessage[] = [
            ...messages,
            { id: `user-${step?.step_id}-${Date.now()}`, role: 'user', content: userContent },
        ];
        if (next.is_complete) {
            nextMsgs.push({
                id: 'onboarding-done',
                role: 'assistant',
                content: DONE_MESSAGE,
            });
        } else if (next.current_step) {
            nextMsgs.push({
                id: `onboarding-${next.current_step.step_id}`,
                role: 'assistant',
                content: next.current_step.prompt_th,
            });
        }
        setMessages(nextMsgs);
    };

    const finishFlow = async () => {
        try {
            const oc = await onboardingApi.getOutcome(fsAiUserId);
            setOutcome(oc);
        } catch {
            /* outcome optional for UI */
        }
        onComplete(null);
    };

    const submit = async (
        answer: string | string[] | number | null,
        display: string
    ) => {
        if (!step || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            const next = await onboardingApi.submitAnswer(
                fsAiUserId,
                step.step_id,
                answer,
                otherText.trim() || undefined
            );
            setSession(next);
            resetInputs();
            appendExchange(display, next);
            if (next.is_complete) {
                await finishFlow();
            }
        } catch (e) {
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
        if (!t) return;
        void submit(t, t);
    };

    const handleNumberSubmit = () => {
        if (numberAnswer == null) return;
        void submit(numberAnswer, String(numberAnswer));
    };

    const optionButtons = useMemo(() => {
        if (!step?.options?.length) return null;
        if (step.input_type === 'multi_select') {
            return (
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Checkbox.Group
                        style={{ width: '100%' }}
                        value={multiSelected}
                        onChange={vals => setMultiSelected(vals as string[])}>
                        {step.options.map(o => (
                            <div key={o.id}>
                                <Checkbox value={o.id}>{o.label}</Checkbox>
                            </div>
                        ))}
                    </Checkbox.Group>
                    {multiSelected.includes('other') && (
                        <Input
                            placeholder="ระบุเพิ่มเติม"
                            value={otherText}
                            onChange={e => setOtherText(e.target.value)}
                        />
                    )}
                    <Button
                        type="primary"
                        block
                        disabled={
                            !multiSelected.length ||
                            (step.max_selections != null &&
                                multiSelected.length > step.max_selections)
                        }
                        loading={submitting}
                        onClick={handleMultiSubmit}>
                        ถัดไป
                    </Button>
                </Space>
            );
        }
        return (
            <Space direction="vertical" style={{ width: '100%' }} size="small">
                {step.options.map(o => (
                    <Button
                        key={o.id}
                        block
                        loading={submitting}
                        onClick={() => handleSingleSelect(o.id, o.label)}>
                        {o.label}
                    </Button>
                ))}
            </Space>
        );
    }, [step, multiSelected, otherText, submitting]);

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin tip="กำลังโหลด SkillPass..." />
            </div>
        );
    }

    return (
        <div className="assistant-onboarding-wizard" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {error && (
                <Alert type="error" message={error} showIcon style={{ margin: 8 }} closable onClose={() => setError(null)} />
            )}
            <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
                {messages.map(m => (
                    <div
                        key={m.id}
                        style={{
                            marginBottom: 8,
                            textAlign: m.role === 'user' ? 'right' : 'left',
                        }}>
                        <div
                            style={{
                                display: 'inline-block',
                                maxWidth: '90%',
                                padding: '8px 12px',
                                borderRadius: 12,
                                background: m.role === 'user' ? '#e6f4ff' : '#f5f5f5',
                            }}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {outcome?.recommended_courses?.length ? (
                    <div style={{ marginTop: 12, fontSize: 13 }}>
                        <strong>คอร์สแนะนำ:</strong>
                        <ul style={{ paddingLeft: 18 }}>
                            {outcome.recommended_courses.map(c => (
                                <li key={c.course_id}>{c.course_name}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
            {showComposer && (
                <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
                    {optionButtons}
                    {step?.input_type === 'optional_text' && (
                        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    value={textAnswer}
                                    onChange={e => setTextAnswer(e.target.value)}
                                    onPressEnter={handleTextSubmit}
                                    placeholder="พิมพ์คำตอบ (ไม่บังคับ)"
                                />
                                <Button type="primary" loading={submitting} onClick={handleTextSubmit}>
                                    ส่ง
                                </Button>
                            </Space.Compact>
                            <Button
                                block
                                loading={submitting}
                                onClick={() => void submit('', 'ข้าม')}>
                                ข้าม
                            </Button>
                        </Space>
                    )}
                    {step?.input_type === 'number' && (
                        <Space style={{ width: '100%', marginTop: 8 }}>
                            <InputNumber
                                style={{ flex: 1 }}
                                min={1990}
                                max={2100}
                                value={numberAnswer ?? undefined}
                                onChange={v => setNumberAnswer(typeof v === 'number' ? v : null)}
                            />
                            <Button type="primary" loading={submitting} onClick={handleNumberSubmit}>
                                ถัดไป
                            </Button>
                        </Space>
                    )}
                </div>
            )}
            {session?.is_complete && (
                <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
                    <Button type="primary" block onClick={() => onComplete(null)}>
                        เริ่มสนทนา
                    </Button>
                </div>
            )}
        </div>
    );
};
