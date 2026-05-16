import React from 'react';
import { LearningModeApi } from '../types/learningAssistant';

export interface ModePickerProps {
    onSelect: (mode: LearningModeApi) => void;
    disabled?: boolean;
    /** Modes to show. Default: all 5. */
    modes?: LearningModeApi[];
}

interface ModeOption {
    mode: LearningModeApi;
    icon: string;
    label: string;
    description: string;
}

const ALL_MODES: ModeOption[] = [
    { mode: 'general', icon: '🌐', label: 'ทั่วไป', description: 'วางแผนและสำรวจทั่วไป' },
    { mode: 'before_class', icon: '🎯', label: 'ก่อนเรียน', description: 'เตรียมตัวก่อนเรียนคอร์ส' },
    { mode: 'during_class', icon: '📚', label: 'ระหว่างเรียน', description: 'ช่วยตอบคำถามขณะเรียน' },
    { mode: 'after_class', icon: '📝', label: 'หลังเรียน', description: 'ทบทวนและฝึกฝน' },
    { mode: 'apply', icon: '🚀', label: 'นำไปใช้', description: 'ลงมือทำโปรเจกต์จริง' },
];

export const ModePicker: React.FC<ModePickerProps> = ({ onSelect, disabled, modes }) => {
    const allowed = modes && modes.length ? ALL_MODES.filter(m => modes.includes(m.mode)) : ALL_MODES;
    return (
        <div className="flex flex-col gap-4 text-blackFS-100">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primaryFS-400 to-pinkFS-500 text-base">
                    🤖
                </div>
                <h3 className="m-0 text-base font-semibold leading-9">เลือกโหมด AI สำหรับการสนทนานี้</h3>
            </div>
            <p className="m-0 text-sm text-blackFS-200">เลือกโหมดที่ตรงกับสิ่งที่คุณต้องการตอนนี้:</p>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-sm text-blackFS-200">
                {allowed.map(m => (
                    <li key={m.mode}>
                        <span className="font-semibold text-blackFS-100">{m.label}</span>
                        <span className="text-blackFS-200"> – {m.description}</span>
                    </li>
                ))}
            </ul>
            <div className="flex flex-wrap gap-2">
                {allowed.map(m => (
                    <button
                        key={m.mode}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(m.mode)}
                        aria-label={m.label}
                        className="flex items-center gap-1.5 rounded-full border border-blackFS-500 bg-blackFS-700 px-3.5 py-2 text-sm text-blackFS-100 transition hover:border-primaryFS-400 hover:bg-blackFS-600 disabled:cursor-not-allowed disabled:opacity-50">
                        <span aria-hidden>{m.icon}</span>
                        <span>{m.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
