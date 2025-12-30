// src/components/odontogram/diagnostic/panel/SurfaceLabels.tsx
import React from 'react';
import type { GroupedSurface } from '../../../../core/utils/groupDentalSurfaces';

interface SurfaceLabelsProps {
    selectedSurfaces: string[];
    groupedSurfaces: GroupedSurface[];
    selectedTooth?: string | null;
    onRemoveSurface: (surfaceId: string) => void;
}

export const SurfaceLabels: React.FC<SurfaceLabelsProps> = ({
    selectedSurfaces,
    groupedSurfaces,
    onRemoveSurface
}) => {
    // DEBUG LOG 1: Props recibidas
    console.log('[SurfaceLabels] Props:', {
        selectedSurfaces: selectedSurfaces.length,
        groupedSurfaces: groupedSurfaces.length,
        groupedSurfacesContent: groupedSurfaces,
        selectedSurfacesContent: selectedSurfaces
    });

    if (!selectedSurfaces.length) {
        console.log('[SurfaceLabels] No selectedSurfaces, return null');
        return null;
    }

    // DEBUG LOG 2: groupedSurfaces detallado
    console.log('[SurfaceLabels] Rendering groupedSurfaces:', groupedSurfaces.map((g, i) => ({
        index: i,
        type: g.type,
        label: g.label,
        isRoot: g.isRoot,
        surfaces: (g as any).surfaces?.length || 1
    })));

    const badgeBase = "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium shadow-theme-xs transition hover:shadow-theme-sm";

    const badgeStyles = {
        crownSingle: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400",
        crownGroup: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300",
        rootSingle: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400",
        rootGroup: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300",
        rootComplete: "bg-purple-500 text-white border-purple-600 font-semibold shadow-purple-200/50",
    };

    const getBadgeClass = (isRoot: boolean, type: 'group' | 'single') => {
        if (isRoot && type === 'group') return `${badgeBase} ${badgeStyles.rootGroup}`;
        if (isRoot) return `${badgeBase} ${badgeStyles.rootSingle}`;
        if (type === 'group') return `${badgeBase} ${badgeStyles.crownGroup}`;
        return `${badgeBase} ${badgeStyles.crownSingle}`;
    };

    // DEBUG LOG 3: Antes del return
    console.log('[SurfaceLabels] Rendering JSX con badges');

    return (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap gap-1.5">
                {groupedSurfaces.map((item, index) => {
                    // DEBUG LOG 4: Cada item
                    console.log(`[SurfaceLabels] Badge ${index}:`, {
                        type: item.type,
                        label: item.label,
                        isRoot: item.isRoot
                    });

                    const badgeClass = getBadgeClass(item.isRoot, item.type);

                    if (item.type === 'group') {
                        return (
                            <span key={`group-${index}`} className={badgeClass}>
                                {item.label}
                                <button
                                    type="button"
                                    onClick={() => item.surfaces.forEach(id => onRemoveSurface(id))}
                                    className="ml-1 rounded-full px-1 text-xs font-bold text-current opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    title="Quitar grupo"
                                >
                                    ×
                                </button>
                            </span>
                        );
                    }

                    return (
                        <span key={item.surface ?? `single-${index}`} className={badgeClass}>
                            {item.label}
                            <button
                                type="button"
                                onClick={() => onRemoveSurface(item.surface!)}
                                className="ml-1 rounded-full px-1 text-xs font-bold text-current opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                title="Quitar"
                            >
                                ×
                            </button>
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
