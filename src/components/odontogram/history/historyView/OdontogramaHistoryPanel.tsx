// src/components/odontogram/history/OdontogramaHistoryPanel.tsx

import React, { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { OdontogramaData } from '../..';
import type { DiagnosticoEntry, PrioridadKey } from '../../../../core/types/odontograma.types';
import { getToothTranslationByFdi } from '../../../../core/utils/toothTraslations';
import { ToothSurfacesStaticView } from './ToothSurfacesStaticView';
interface OdontogramaHistoryPanelProps {
    selectedTooth: string | null;
    odontogramaData: OdontogramaData | null;
    onToothSelect: (toothId: string | null) => void; 
    getPermanentColorForSurface: (toothId: string | null, surfaceId: string) => string | null;
}

type DiagnosticoGrouped = DiagnosticoEntry & {
    superficiesUnificadas: string[];
    count: number;
};

const PRIORITY_LABELS: Record<PrioridadKey, { label: string; color: string }> = {
    ALTA: { label: 'Alta', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' },
    MEDIA: { label: 'Media', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' },
    BAJA: { label: 'Baja', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' },
    ESTRUCTURAL: { label: 'Estructural', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' },
    INFORMATIVA: { label: 'Info', color: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' },
};

export const OdontogramaHistoryPanel: React.FC<OdontogramaHistoryPanelProps> = ({
    selectedTooth,
    odontogramaData,
    getPermanentColorForSurface,
}) => {
    // Obtener diagnósticos del diente seleccionado
    const toothDiagnostics = useMemo(() => {
        if (!selectedTooth || !odontogramaData) return [];

        const toothData = odontogramaData[selectedTooth];
        if (!toothData) return [];

        return Object.values(toothData).flat() as DiagnosticoEntry[];
    }, [selectedTooth, odontogramaData]);

    // Agrupar diagnósticos
    const groupedDiagnostics: DiagnosticoGrouped[] = useMemo(() => {
        const map = new Map<string, DiagnosticoGrouped>();

        toothDiagnostics.forEach((diag) => {
            const key = [
                diag.key || diag.id,
                diag.nombre,
                diag.siglas || '',
                diag.descripcion || '',
            ].join('|');

            const current = map.get(key);
            const areas = diag.areasafectadas || [];

            if (!current) {
                map.set(key, {
                    ...diag,
                    superficiesUnificadas: [...areas],
                    count: 1,
                });
            } else {
                const merged = new Set([
                    ...current.superficiesUnificadas,
                    ...areas,
                ]);
                current.superficiesUnificadas = Array.from(merged);
                current.count += 1;
            }
        });

        return Array.from(map.values());
    }, [toothDiagnostics]);

    // Ordenar por prioridad
    const sortedDiagnostics = useMemo(
        () => [...groupedDiagnostics].sort((a, b) => b.priority - a.priority),
        [groupedDiagnostics],
    );

    // Info del diente
    const toothInfo = useMemo(() => {
        if (!selectedTooth) return null;
        return getToothTranslationByFdi(selectedTooth);
    }, [selectedTooth]);

    // Determinar si solo tiene diagnósticos generales
    const onlyGeneral = useMemo(
        () =>
            toothDiagnostics.length > 0 &&
            toothDiagnostics.every((d) =>
                (d.areasafectadas || []).every((a) => a === 'general'),
            ),
        [toothDiagnostics],
    );

    // ============================================================================
    // RENDER: Sin diente seleccionado
    // ============================================================================
    if (!selectedTooth || !toothInfo) {
        return (
            <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Vista de historial
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Solo lectura
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-sm space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-gray-400 dark:text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Selecciona un diente
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Haz clic en un diente del odontograma 3D para visualizar su historial de diagnósticos en este momento temporal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER: Con diente seleccionado
    // ============================================================================
    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header: Info del diente */}
            <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    {/* Badge del número */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-md">
                        {toothInfo.numero}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {toothInfo.nombre}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Pieza #{toothInfo.numero}</span>
                            <span>•</span>
                            <span>
                                {toothDiagnostics.length} diagnóstico{toothDiagnostics.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Badge de modo lectura */}
                    <div className="flex-none">
                        <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Solo lectura
                        </span>
                    </div>
                </div>
            </div>

            {/* Content: Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                <div className="p-6 space-y-6">

                    {/* SECCIÓN: SVGs con colores aplicados */}
                    {!onlyGeneral && toothDiagnostics.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Vista de superficies afectadas
                            </h4>
                            <ToothSurfacesStaticView
                                toothId={selectedTooth}
                                diagnosticos={toothDiagnostics}
                                getPermanentColorForSurface={getPermanentColorForSurface}
                            />
                        </div>
                    )}

                    {/* SECCIÓN: Cards de diagnósticos */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Diagnósticos aplicados
                        </h4>

                        {sortedDiagnostics.length > 0 ? (
                            <div className="space-y-3">
                                {sortedDiagnostics.map((diag, index) => (
                                    <DiagnosticoReadOnlyCard
                                        key={`${diag.id}-${index}`}
                                        diagnostico={diag}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-4 py-6 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>Sin diagnósticos registrados para este diente en este momento temporal.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENTE: Card de diagnóstico en modo solo lectura
// ============================================================================

interface DiagnosticoReadOnlyCardProps {
    diagnostico: DiagnosticoGrouped;
}

const DiagnosticoReadOnlyCard: React.FC<DiagnosticoReadOnlyCardProps> = ({ diagnostico }) => {
    const priorityInfo = PRIORITY_LABELS[diagnostico.prioridadKey] || PRIORITY_LABELS.INFORMATIVA;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header con color indicador */}
            <div
                className="h-2 w-full"
                style={{ backgroundColor: diagnostico.colorHex }}
            />

            <div className="p-5 space-y-4">
                {/* Título y siglas */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                            {diagnostico.nombre}
                        </h5>
                        {diagnostico.siglas && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Código: {diagnostico.siglas}
                            </p>
                        )}
                    </div>

                    {/* Badge de prioridad */}
                    <span className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border ${priorityInfo.color}`}>
                        {priorityInfo.label}
                    </span>
                </div>

                {/* Superficies afectadas */}
                {diagnostico.superficiesUnificadas && diagnostico.superficiesUnificadas.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Superficies afectadas
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {diagnostico.superficiesUnificadas.map((surface, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                >
                                    {surface.replace('cara_', '').replace('raiz_', '').replace('_', ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Descripción/Comentarios */}
                {diagnostico.descripcion && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Comentarios clínicos
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3 leading-relaxed">
                            {diagnostico.descripcion}
                        </p>
                    </div>
                )}

                {/* Opciones secundarias (Atributos clínicos) */}
                {diagnostico.secondaryOptions &&
                    Object.keys(diagnostico.secondaryOptions).length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Atributos clínicos
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(diagnostico.secondaryOptions).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="text-xs bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700"
                                    >
                                        <span className="font-semibold text-gray-600 dark:text-gray-400 block mb-0.5">
                                            {key}
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                {/* Metadatos adicionales */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" style={{ backgroundColor: diagnostico.colorHex }} />
                        <span className="font-mono">{diagnostico.colorHex}</span>
                    </span>
                    {diagnostico.count > 1 && (
                        <>
                            <span>•</span>
                            <span>Aplicado {diagnostico.count} veces</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
