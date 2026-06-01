import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { LuArrowUp as LuArrowUpRaw, LuLoader as LuLoaderRaw, LuPaperclip as LuPaperclipRaw } from 'react-icons/lu';

type IconFC = React.FC<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
const LuArrowUp = LuArrowUpRaw as unknown as IconFC;
const LuLoader = LuLoaderRaw as unknown as IconFC;
const LuPaperclip = LuPaperclipRaw as unknown as IconFC;

/** Touch-friendly minimum; ~3 lines before internal scroll. */
const COMPOSER_MIN_HEIGHT_PX = 52;
const COMPOSER_MAX_HEIGHT_PX = 160;

export interface ComposerProps {
    disabled?: boolean;
    loading?: boolean;
    onSend: (text: string) => void;
    onAttach?: () => void;
    placeholder?: string;
}

export const Composer: React.FC<ComposerProps> = ({
    disabled,
    loading,
    onSend,
    onAttach,
    placeholder = 'Type your message here...',
}) => {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const syncTextareaHeight = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = 'auto';
        const scrollHeight = el.scrollHeight;
        const nextHeight = Math.min(Math.max(scrollHeight, COMPOSER_MIN_HEIGHT_PX), COMPOSER_MAX_HEIGHT_PX);
        el.style.height = `${nextHeight}px`;
        el.style.overflowY = scrollHeight > COMPOSER_MAX_HEIGHT_PX ? 'auto' : 'hidden';
    }, []);

    useLayoutEffect(() => {
        syncTextareaHeight();
    }, [value, syncTextareaHeight]);

    const submit = () => {
        const t = value.trim();
        if (!t || disabled || loading) return;
        onSend(t);
        setValue('');
    };

    const canSend = value.trim().length > 0 && !disabled && !loading;

    return (
        <div className="shrink-0 rounded-2xl border border-blackFS-500 bg-blackFS-700 px-3 py-2.5">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                rows={1}
                disabled={disabled || loading}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                    }
                }}
                className="block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-base leading-relaxed text-blackFS-100 placeholder-blackFS-300 focus:outline-none focus:ring-0 disabled:opacity-60"
                style={{ minHeight: COMPOSER_MIN_HEIGHT_PX, maxHeight: COMPOSER_MAX_HEIGHT_PX }}
            />
            <div
                className={`mt-2 flex items-center ${onAttach ? 'justify-between' : 'justify-end'}`}>
                {onAttach ? (
                    <button
                        type="button"
                        aria-label="แนบไฟล์"
                        disabled={disabled || loading}
                        onClick={onAttach}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-blackFS-300 transition hover:text-blackFS-100 disabled:cursor-not-allowed disabled:opacity-50">
                        <LuPaperclip size={18} />
                    </button>
                ) : null}
                <button
                    type="button"
                    aria-label="ส่ง"
                    disabled={!canSend}
                    onClick={submit}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primaryFS-500 text-white transition hover:bg-primaryFS-400 disabled:cursor-not-allowed disabled:opacity-40">
                    {loading ? <LuLoader size={18} className="animate-spin" /> : <LuArrowUp size={18} />}
                </button>
            </div>
        </div>
    );
};
