import { AssistantUserProfile } from './assistantUserProfile';

export interface ProfileDisplayRow {
    label: string;
    value: string;
}

const PROFILE_ROW_LABELS: Record<keyof AssistantUserProfile, string> = {
    current_job: 'ตำแหน่งปัจจุบัน',
    target_job: 'เป้าหมาย',
    industry: 'อุตสาหกรรม / สายงาน',
    timeframe: 'กรอบเวลา',
    skill_level: 'ระดับทักษะ',
};

export function hasDisplayableAssistantProfile(
    profile: AssistantUserProfile | null | undefined
): boolean {
    if (!profile) return false;
    return Boolean(
        profile.current_job?.trim() ||
            profile.target_job?.trim() ||
            profile.industry?.trim() ||
            profile.timeframe?.trim() ||
            profile.skill_level?.trim()
    );
}

export function assistantProfileDisplayRows(
    profile: AssistantUserProfile
): ProfileDisplayRow[] {
    const rows: ProfileDisplayRow[] = [];
    (Object.keys(PROFILE_ROW_LABELS) as (keyof AssistantUserProfile)[]).forEach(key => {
        const value = profile[key]?.trim();
        if (value) {
            rows.push({ label: PROFILE_ROW_LABELS[key], value });
        }
    });
    return rows;
}
