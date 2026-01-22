// src/core/types/historyView.types.ts

import type { DiagnosticoEntry } from "./odontograma.types";

export type HistoryViewMode = 'compact' | 'detailed' | 'hidden' | 'files' | 'models' ;
export interface DiagnosticoEntryWithContext extends DiagnosticoEntry {
  dienteId: string;
  superficieIdContext: string;
}
export interface HistoryViewConfig {
    mode: HistoryViewMode;
    showModel3D: boolean;
    showSurfacesSVG: boolean;
    showDiagnosticsList: boolean;
}

export const VIEW_CONFIGS: Record<HistoryViewMode, HistoryViewConfig> = {
    compact: {
        mode: 'compact',
        showModel3D: true,
        showSurfacesSVG: false,
        showDiagnosticsList: true, 
    },
    detailed: {
        mode: 'detailed',
        showModel3D: true,
        showSurfacesSVG: true,
        showDiagnosticsList: true,
    },
    hidden: {
    mode: 'hidden',
    showModel3D: false,
    showSurfacesSVG: false,
    showDiagnosticsList: false,
  },
    files: {
        mode: 'files',
        showModel3D: false,
        showSurfacesSVG: false,
        showDiagnosticsList: false,
    },
    models: {
        mode: 'models',
        showModel3D: true,
        showSurfacesSVG: false,
        showDiagnosticsList: false,
    },

};
