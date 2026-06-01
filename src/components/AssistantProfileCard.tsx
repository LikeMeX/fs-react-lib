import React from 'react';
import { LuPencil as LuPencilRaw } from 'react-icons/lu';
import { AssistantUserProfile } from '../helpers/assistantUserProfile';
import { assistantProfileDisplayRows } from '../helpers/assistantProfileDisplay';

type IconFC = React.FC<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
const LuPencil = LuPencilRaw as unknown as IconFC;

export interface AssistantProfileCardProps {
    profile: AssistantUserProfile;
    summary?: string | null;
    onEdit: () => void;
}

export const AssistantProfileCard: React.FC<AssistantProfileCardProps> = ({
    profile,
    summary,
    onEdit,
}) => {
    const rows = assistantProfileDisplayRows(profile);

    return (
        <section
            aria-labelledby="assistant-profile-heading"
            className="mb-3 shrink-0 rounded-xl border border-blackFS-500 bg-blackFS-700/90 px-3.5 py-3">
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3
                        id="assistant-profile-heading"
                        className="m-0 text-sm font-semibold text-blackFS-100">
                        โปรไฟล์ SkillPass
                    </h3>
                    <p className="m-0 mt-0.5 text-xs text-blackFS-300">
                        บันทึกแล้ว — ผู้ช่วยจะปรับคำตอบให้เหมาะกับคุณ
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-blackFS-500 bg-blackFS-800 px-2.5 py-1.5 text-xs font-medium text-blackFS-100 transition hover:border-primaryFS-400 hover:bg-blackFS-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryFS-400">
                    <LuPencil size={14} aria-hidden />
                    แก้ไข
                </button>
            </div>
            {summary ? (
                <p className="m-0 mb-2 text-sm leading-relaxed text-blackFS-200">{summary}</p>
            ) : null}
            {rows.length > 0 ? (
                <dl className="m-0 grid gap-1.5 text-sm">
                    {rows.map(row => (
                        <div key={row.label} className="grid grid-cols-[minmax(0,38%)_1fr] gap-x-2 gap-y-0.5">
                            <dt className="m-0 text-blackFS-300">{row.label}</dt>
                            <dd className="m-0 font-medium text-blackFS-100">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            ) : null}
        </section>
    );
};
