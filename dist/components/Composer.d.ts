import React from 'react';
export interface ComposerProps {
    disabled?: boolean;
    loading?: boolean;
    onSend: (text: string) => void;
    onAttach?: () => void;
    placeholder?: string;
}
export declare const Composer: React.FC<ComposerProps>;
