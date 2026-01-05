// src/components/odontogram/history/historyView/DetailedToothView.tsx

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { getToothTranslationByFdi } from '../../../../core/utils/toothTraslations';
import { getRootTypeByFDI } from '../../../../hooks/odontogram/diagnosticoHooks/useToothSelection';
import type { DiagnosticoEntry, PrioridadKey } from '../../../../core/types/odontograma.types';
import { ToothSurfacesStaticView } from './ToothSurfacesStaticView';

interface DetailedToothViewProps {
    toothId: string;
    diagnosticos: DiagnosticoEntry[];
    getPermanentColorForSurface: (toothId: string | null, surfaceId: string) => string | null;
}

type DiagnosticoGrouped = DiagnosticoEntry & {
    superficiesUnificadas: string[];
    count: number;
};

// Mapeo de nivel de prioridad a etiqueta visual
const PRIORITY_LABELS: Record<PrioridadKey, { label: string; color: string }> = {
    ALTA: { label: 'Alta', color: 'bg-red-100 text-red-800 border-red-300' },
    MEDIA: { label: 'Media', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    BAJA: { label: 'Baja', color: 'bg-green-100 text-green-800 border-green-300' },
    ESTRUCTURAL: { label: 'Estructural', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    INFORMATIVA: { label: 'Info', color: 'bg-gray-100 text-gray-800 border-gray-300' },
};

export const DetailedToothView: React.FC<DetailedToothViewProps> = ({
    toothId,
    diagnosticos,
    getPermanentColorForSurface,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { nombre, numero } = getToothTranslationByFdi(toothId);

    // Agrupar diagnósticos unificados (mismo diagnóstico en múltiples superficies)
    const groupedDiagnosticos: DiagnosticoGrouped[] = useMemo(() => {
        const map = new Map<string, DiagnosticoGrouped>();

        diagnosticos.forEach((diag) => {
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
    }, [diagnosticos]);

    // Ordenar por prioridad descendente
    const sortedDiagnosticos = useMemo(
        () => [...groupedDiagnosticos].sort((a, b) => b.priority - a.priority),
        [groupedDiagnosticos],
    );

    // Determinar si solo tiene diagnósticos generales
    const onlyGeneral = useMemo(
        () =>
            diagnosticos.length > 0 &&
            diagnosticos.every((d) =>
                (d.areasafectadas || []).every((a) => a === 'general'),
            ),
        [diagnosticos],
    );

    // Superficies únicas para mostrar en el header
    const uniqueSurfaces = useMemo(() => {
        const surfaces = diagnosticos.flatMap((d) => d.areasafectadas || []);
        return Array.from(new Set(surfaces)).filter((s) => s !== 'general');
    }, [diagnosticos]);

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            {/* HEADER COLAPSABLE */}
            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {/* Badge del número de diente */}
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                        {numero}
                    </span>

                    {/* Nombre y número */}
                    <div className="flex flex-col items-start">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {nombre} #{numero}
                        </span>

                        {/* Cantidad de diagnósticos */}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {diagnosticos.length} diagnóstico{diagnosticos.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Indicador de estado */}
                <div className="flex items-center gap-2">
                    {onlyGeneral ? (
                        <span className="px-2 py-1 text-xs rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            Estado general
                        </span>
                    ) : uniqueSurfaces.length > 0 ? (
                        <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {uniqueSurfaces.length} superficie{uniqueSurfaces.length !== 1 ? 's' : ''}
                        </span>
                    ) : null}

                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* CONTENIDO EXPANDIDO */}
            {isExpanded && (
                <div className="px-4 py-4 bg-gray-50 dark:bg-gray-800 space-y-6">

                    {/* SECCIÓN SUPERIOR: SVGs con colores aplicados */}
                    {!onlyGeneral && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Vista de superficies afectadas
                            </h4>
                            <ToothSurfacesStaticView
                                toothId={toothId}
                                diagnosticos={diagnosticos}
                                getPermanentColorForSurface={getPermanentColorForSurface}
                            />
                        </div>
                    )}

                    {/* SECCIÓN INFERIOR: Cards de diagnósticos */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Diagnósticos aplicados
                        </h4>

                        {sortedDiagnosticos.length > 0 ? (
                            <div className="space-y-2">
                                {sortedDiagnosticos.map((diag, index) => (
                                    <DiagnosticoCard
                                        key={`${diag.id}-${index}`}
                                        diagnostico={diag}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <AlertCircle className="w-4 h-4" />
                                <span>Sin diagnósticos para este diente en este evento.</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// COMPONENTE: Card individual de diagnóstico
// ============================================================================

interface DiagnosticoCardProps {
    diagnostico: DiagnosticoGrouped;
}

const DiagnosticoCard: React.FC<DiagnosticoCardProps> = ({ diagnostico }) => {
    const priorityInfo = PRIORITY_LABELS[diagnostico.prioridadKey] || PRIORITY_LABELS.INFORMATIVA;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header con color indicador */}
            <div
                className="h-1.5 w-full"
                style={{ backgroundColor: diagnostico.colorHex }}
            />

            <div className="p-4 space-y-3">
                {/* Título y siglas */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                            {diagnostico.nombre}
                        </h5>
                        {diagnostico.siglas && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                ({diagnostico.siglas})
                            </p>
                        )}
                    </div>

                    {/* Badge de prioridad */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${priorityInfo.color}`}>
                        {priorityInfo.label}
                    </span>
                </div>

                {/* Superficies afectadas */}
                {diagnostico.superficiesUnificadas && diagnostico.superficiesUnificadas.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Superficies afectadas:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {diagnostico.superficiesUnificadas.map((surface, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                >
                                    {surface.replace('cara_', '').replace('raiz_', '').replace('_', ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Descripción/Comentarios */}
                {diagnostico.descripcion && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Comentarios:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                            {diagnostico.descripcion}
                        </p>
                    </div>
                )}

                {/* Opciones secundarias (Atributos clínicos) */}
                {diagnostico.secondaryOptions &&
                    Object.keys(diagnostico.secondaryOptions).length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Atributos clínicos:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(diagnostico.secondaryOptions).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="text-xs bg-gray-50 dark:bg-gray-800 rounded px-2 py-1.5"
                                    >
                                        <span className="font-medium text-gray-600 dark:text-gray-400">
                                            {key}:
                                        </span>{' '}
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                {/* Metadatos adicionales */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: diagnostico.colorHex }} />
                        Color: {diagnostico.colorHex}
                    </span>
                    {diagnostico.count > 1 && (
                        <span>• Aplicado {diagnostico.count} veces</span>
                    )}
                </div>
            </div>
        </div>
    );
};
