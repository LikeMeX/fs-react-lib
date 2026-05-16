import React, { useState } from 'react';
import { LuArrowUp as LuArrowUpRaw, LuLoader as LuLoaderRaw, LuPaperclip as LuPaperclipRaw } from 'react-icons/lu';

type IconFC = React.FC<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
const LuArrowUp = LuArrowUpRaw as unknown as IconFC;
const LuLoader = LuLoaderRaw as unknown as IconFC;
const LuPaperclip = LuPaperclipRaw as unknown as IconFC;

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

    const submit = () => {
        const t = value.trim();
        if (!t || disabled || loading) return;
        onSend(t);
        setValue('');
    };

    const canSend = value.trim().length > 0 && !disabled && !loading;

    return (
        <div className="mt-3 rounded-2xl border border-blackFS-500 bg-blackFS-700 px-3 py-2.5">
            <textarea
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                rows={2}
                disabled={disabled || loading}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                    }
                }}
                className="block w-full resize-none border-0 bg-transparent p-0 text-sm text-blackFS-100 placeholder-blackFS-300 focus:outline-none focus:ring-0 disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-between">
                <button
                    type="button"
                    aria-label="แนบไฟล์"
                    disabled={disabled || loading || !onAttach}
                    onClick={onAttach}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-blackFS-300 transition hover:text-blackFS-100 disabled:cursor-not-allowed disabled:opacity-50">
                    <LuPaperclip size={18} />
                </button>
                <button
                    type="button"
                    aria-label="ส่ง"
                    disabled={!canSend}
                    onClick={submit}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryFS-500 text-white transition hover:bg-primaryFS-400 disabled:cursor-not-allowed disabled:opacity-40">
                    {loading ? <LuLoader size={16} className="animate-spin" /> : <LuArrowUp size={16} />}
                </button>
            </div>
        </div>
    );
};
