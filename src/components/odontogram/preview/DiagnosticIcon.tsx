// src/components/odontogram/preview/DiagnosticIcon.tsx
import React from 'react';
import { getDiagnosticIcon } from '../../../core/constants/diagnosticIcons';

interface DiagnosticIconProps {
    diagnosticKey: string;
    size?: number;
    className?: string;
}

export const DiagnosticIconComponent: React.FC<DiagnosticIconProps> = ({
    diagnosticKey,
    size = 32,
    className = ''
}) => {
    const iconData = getDiagnosticIcon(diagnosticKey);

    if (!iconData) {
        return (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                ?
            </div>
        );
    }

    const IconComponent = iconData.Icon;

    return (
        <div className={`flex items-center justify-center ${className}`} title={iconData.tooltip}>
            <IconComponent
                size={size}
                strokeWidth={2.5}
                color={iconData.color}
                className="drop-shadow-md"
            />
            <span className="sr-only">{iconData.tooltip}</span>
        </div>
    );
};
