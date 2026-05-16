/**
 * Normalizes assistant markdown before ReactMarkdown so empty list markers
 * from model output do not render as vertical columns of bullets.
 */
export declare function visibleStripped(s: string): string;
/** True when the line is only a list / task marker with no real text (model glitches). */
export declare function isOrphanListMarkerLine(stripped: string): boolean;
export declare function sanitizeAssistantMarkdown(text: string): string;
