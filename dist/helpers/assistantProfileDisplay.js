"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasDisplayableAssistantProfile = hasDisplayableAssistantProfile;
exports.assistantProfileDisplayRows = assistantProfileDisplayRows;
const PROFILE_ROW_LABELS = {
    current_job: 'ตำแหน่งปัจจุบัน',
    target_job: 'เป้าหมาย',
    industry: 'อุตสาหกรรม / สายงาน',
    timeframe: 'กรอบเวลา',
    skill_level: 'ระดับทักษะ',
};
function hasDisplayableAssistantProfile(profile) {
    if (!profile)
        return false;
    return Boolean(profile.current_job?.trim() ||
        profile.target_job?.trim() ||
        profile.industry?.trim() ||
        profile.timeframe?.trim() ||
        profile.skill_level?.trim());
}
function assistantProfileDisplayRows(profile) {
    const rows = [];
    Object.keys(PROFILE_ROW_LABELS).forEach(key => {
        const value = profile[key]?.trim();
        if (value) {
            rows.push({ label: PROFILE_ROW_LABELS[key], value });
        }
    });
    return rows;
}
