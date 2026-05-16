import React from 'react';
import { LearningModeApi, SuggestedAction } from '../types/learningAssistant';

/** Default chips per FS AI learning mode: stable action_intent + Thai label + user message prompt. */
export const SUGGESTED_ACTIONS_BY_MODE: Record<LearningModeApi, SuggestedAction[]> = {
    general: [
        {
            action_intent: 'road_map_maker',
            label_th: 'วางแผนเส้นทางการเรียน',
            prompt: 'ช่วยวางแผนเส้นทางการเรียนให้หน่อย (เป้าหมาย + ระยะเวลา + ขั้นตอน)',
        },
        {
            action_intent: 'summary_maker',
            label_th: 'สรุปหัวข้อให้เข้าใจเร็ว',
            prompt: 'ช่วยสรุปหัวข้อ/บทเรียนที่ฉันกำลังเรียนให้เข้าใจเร็ว พร้อมตัวอย่าง',
        },
        {
            action_intent: 'quiz_me',
            label_th: 'ทำแบบฝึกหัด/โจทย์',
            prompt: 'ช่วยออกแบบฝึกหัดให้ฉันลองทำ พร้อมเฉลยและอธิบาย',
        },
        {
            action_intent: 'feynman_test',
            label_th: 'เช็คความเข้าใจ',
            prompt: 'ช่วยถามคำถามเช็คความเข้าใจ 5 ข้อ (ไล่ระดับง่าย→ยาก)',
        },
    ],
    before_class: [
        {
            action_intent: 'pre_read_primer',
            label_th: 'สิ่งที่ควรรู้ล่วงหน้า',
            prompt: 'ช่วยสรุปสิ่งที่ควรรู้ล่วงหน้าก่อนเข้าเรียน (พื้นฐาน + คำศัพท์สำคัญ)',
        },
        {
            action_intent: 'question_starter',
            label_th: 'ตั้งคำถามก่อนเข้าเรียน',
            prompt: 'ช่วยตั้งคำถาม 8 ข้อที่ควรถาม/ควรคิดก่อนเข้าเรียน เพื่อเรียนได้คุ้มที่สุด',
        },
        {
            action_intent: 'skill_gap_scan',
            label_th: 'เช็คช่องโหว่ความรู้',
            prompt: 'ช่วยทำ checklist/quiz สั้นๆ เพื่อเช็คว่าพื้นฐานฉันพร้อมแค่ไหน',
        },
        {
            action_intent: 'study_planner',
            label_th: 'วางตารางเรียน',
            prompt: 'ช่วยวางตารางเรียนให้เหมาะกับเวลาที่มี (พร้อม milestone)',
        },
    ],
    during_class: [
        {
            action_intent: 'concept_translator',
            label_th: 'อธิบาย Concept นี้',
            prompt: 'ช่วยอธิบาย concept นี้แบบเข้าใจง่าย พร้อมตัวอย่าง 1-2 ตัวอย่าง',
        },
        {
            action_intent: 'jargon_decoder',
            label_th: 'แปลศัพท์/นิยาม',
            prompt: 'ช่วยอธิบายคำศัพท์/นิยามที่เพิ่งเจอ พร้อมตัวอย่างการใช้งาน',
        },
        {
            action_intent: 'summary_maker',
            label_th: 'สรุปช่วงที่เรียนอยู่',
            prompt: 'ช่วยสรุปประเด็นสำคัญของช่วงนี้แบบ bullet และย้ำสิ่งที่มักสับสน',
        },
        {
            action_intent: 'analogy_builder',
            label_th: 'ทำให้เห็นภาพ',
            prompt: 'ช่วยยก analogy/ภาพเปรียบเทียบเพื่อให้เห็นภาพ concept นี้',
        },
    ],
    after_class: [
        {
            action_intent: 'summary_maker',
            label_th: 'สรุป Key takeaways',
            prompt: 'ช่วยสรุป key takeaways ของบทเรียนนี้ให้หน่อย',
        },
        {
            action_intent: 'flashcard_factory',
            label_th: 'ทำ Flashcards',
            prompt: 'ช่วยทำ flashcards 10 ใบสำหรับทบทวน (Q/A)',
        },
        {
            action_intent: 'quiz_me',
            label_th: 'ออกข้อสอบให้ทำ',
            prompt: 'ช่วยออกข้อสอบ 8 ข้อ (ปรนัย/อัตนัยผสม) พร้อมเฉลยและเหตุผล',
        },
        {
            action_intent: 'spaced_review',
            label_th: 'แผนทบทวน Spaced repetition',
            prompt: 'ช่วยวางแผนทบทวนแบบ spaced repetition สำหรับสัปดาห์นี้',
        },
    ],
    apply: [
        {
            action_intent: 'project_launcher',
            label_th: 'แนะนำ Mini-Project',
            prompt: 'ช่วยแนะนำ mini-project ทำได้ใน 1 สัปดาห์ พร้อม scope และขั้นตอน',
        },
        {
            action_intent: 'case_study_solver',
            label_th: 'แก้ปัญหา Case Study',
            prompt: 'ช่วยฉันวิเคราะห์และแก้ปัญหาแบบ case study (สมมติสถานการณ์จริง)',
        },
        {
            action_intent: 'interview_prep',
            label_th: 'ซ้อมสัมภาษณ์',
            prompt: 'ช่วยซ้อมคำถามสัมภาษณ์งาน พร้อม feedback และแนวตอบที่ดี',
        },
        {
            action_intent: 'portfolio_builder',
            label_th: 'ออกแบบ Portfolio',
            prompt: 'ช่วยวางโครง portfolio ที่น่าเชื่อถือ พร้อมหัวข้อ/ชิ้นงานที่ควรมี',
        },
    ],
};

export interface SuggestedActionsProps {
    mode: LearningModeApi;
    actions: SuggestedAction[];
    disabled?: boolean;
    /** First arg is the message sent to the assistant; second is metadata action_intent. */
    onSelect: (message: string, actionIntent: string) => void;
}

function messageForAction(a: SuggestedAction): string {
    return (a.prompt ?? a.label_th ?? a.label ?? a.action_intent).trim();
}

export const SuggestedActions: React.FC<SuggestedActionsProps> = ({ mode, actions, disabled, onSelect }) => {
    const list = actions.length > 0 ? actions : SUGGESTED_ACTIONS_BY_MODE[mode] ?? [];

    if (!list.length) return null;

    return (
        <div aria-live="polite" className="mt-2">
            <div
                role="list"
                aria-label="ข้อความแนะนำ"
                className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(126,126,130,0.35)_transparent] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-blackFS-500/80">
                {list.map((a, i) => {
                    const label = a.label_th || a.label || a.action_intent;
                    const msg = messageForAction(a);
                    return (
                        <button
                            key={`${a.action_intent}-${i}`}
                            type="button"
                            role="listitem"
                            disabled={disabled}
                            aria-label={label}
                            onClick={() => onSelect(msg, a.action_intent)}
                            className="inline-flex min-h-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-blackFS-500 bg-blackFS-700/90 px-3.5 py-1.5 text-left text-xs font-medium leading-snug text-blackFS-200 shadow-sm transition-[background-color,border-color,transform] duration-150 ease-out hover:border-blackFS-400 hover:bg-blackFS-600 hover:text-blackFS-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryFS-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blackFS-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:scale-100">
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
