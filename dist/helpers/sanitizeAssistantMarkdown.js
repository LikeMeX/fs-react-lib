"use strict";
/**
 * Normalizes assistant markdown before ReactMarkdown so empty list markers
 * from model output do not render as vertical columns of bullets.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.visibleStripped = visibleStripped;
exports.isOrphanListMarkerLine = isOrphanListMarkerLine;
exports.sanitizeAssistantMarkdown = sanitizeAssistantMarkdown;
function visibleStripped(s) {
    let out = '';
    for (const ch of s) {
        const c = ch.codePointAt(0) ?? 0;
        if (c <= 0x20)
            continue;
        if (c === 0xa0 || c === 0xad)
            continue;
        if (c >= 0x200b && c <= 0x200f)
            continue;
        if (c >= 0x2028 && c <= 0x202f)
            continue;
        if (c >= 0x2060 && c <= 0x206f)
            continue;
        if (c === 0xfeff)
            continue;
        if (c >= 0xfe00 && c <= 0xfe0f)
            continue;
        if (c === 0x180e)
            continue;
        out += ch;
    }
    return out;
}
/** True when the line is only a list / task marker with no real text (model glitches). */
function isOrphanListMarkerLine(stripped) {
    if (!stripped)
        return false;
    if (/^[-*+•]$/.test(stripped))
        return true;
    if (/^\d{1,9}\.$/.test(stripped))
        return true;
    if (/^\d{1,9}[.)]$/.test(stripped))
        return true;
    if (/^[-*+]\s*\[\s*[xX ]?\s*\]$/.test(stripped))
        return true;
    if (/^\.+$/.test(stripped))
        return true;
    return false;
}
function sanitizeAssistantMarkdown(text) {
    return text
        .split('\n')
        .filter(line => {
        const stripped = visibleStripped(line);
        if (!stripped)
            return true;
        return !isOrphanListMarkerLine(stripped);
    })
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trimEnd();
}
