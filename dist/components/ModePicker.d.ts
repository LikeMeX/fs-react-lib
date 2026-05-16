import React from 'react';
import { LearningModeApi } from '../types/learningAssistant';
export interface ModePickerProps {
    onSelect: (mode: LearningModeApi) => void;
    disabled?: boolean;
    /** Modes to show. Default: all 5. */
    modes?: LearningModeApi[];
}
export declare const ModePicker: React.FC<ModePickerProps>;
