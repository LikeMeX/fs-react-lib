import React from 'react';
import { LuBot as LuBotRaw, LuX as LuXRaw } from 'react-icons/lu';
import { useAssistant } from '../contexts/assistantContext';

type IconFC = React.FC<{ size?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean }>;
const LuBot = LuBotRaw as unknown as IconFC;
const LuX = LuXRaw as unknown as IconFC;
import {
    canUseLearningAssistant,
    isFsAiApiConfigured,
} from '../helpers/canUseLearningAssistant';
import { AssistantUserMember } from '../types/learningAssistant';

export interface AssistantNavButtonProps {
    userMember?: AssistantUserMember;
    /** Optional override for entitlement check (e.g. when host app already gates). */
    canUse?: boolean;
    /** Render as a fixed floating button (bottom-right). Default: false (inline button). */
    floating?: boolean;
}

export const AssistantNavButton: React.FC<AssistantNavButtonProps> = ({ userMember, canUse, floating }) => {
    const { open, toggle } = useAssistant();
    const allowed = canUse ?? canUseLearningAssistant(userMember);

    if (!allowed || !isFsAiApiConfigured()) return null;

    const wrapperClass = floating
        ? 'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primaryFS-400 via-primaryFS-500 to-pinkFS-500 text-white shadow-[0_12px_30px_rgba(132,44,221,0.45)] ring-[3px] ring-black/20 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(132,44,221,0.5)] active:translate-y-0 active:scale-95'
        : 'group relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primaryFS-400 via-primaryFS-500 to-pinkFS-500 text-white shadow-[0_8px_20px_rgba(132,44,221,0.3)] ring-[3px] ring-blackFS-900 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(132,44,221,0.36)] active:translate-y-0 active:scale-95';

    return (
        <button
            type="button"
            aria-label={open ? 'ปิดผู้ช่วยการเรียน' : 'เปิดผู้ช่วยการเรียน'}
            aria-pressed={open ? 'true' : 'false'}
            onClick={toggle}
            className={wrapperClass}>
            <span
                aria-hidden
                className="absolute right-0 top-0 h-2 w-2 rounded-full border border-white bg-successFS-500 shadow-[0_0_8px_rgba(13,193,128,0.85)]"
            />
            <span key={open ? 'close' : 'chat'} aria-hidden className="relative z-10">
                {open ? <LuX size={floating ? 22 : 18} strokeWidth={2.4} /> : <LuBot size={floating ? 22 : 18} strokeWidth={2.4} />}
            </span>
        </button>
    );
};
