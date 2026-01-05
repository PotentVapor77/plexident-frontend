// src/components/odontogram/history/historyView/CompactDiagnosticsList.tsx

import { useMemo, useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { getToothTranslationByFdi } from '../../../../core/utils/toothTraslations';
import type { DiagnosticoEntryWithContext } from '../../../../core/types/historyView.types';
import type { PrioridadKey } from '../../../../core/types/odontograma.types';

interface CompactDiagnosticsListProps {
  diagnosticos: DiagnosticoEntryWithContext[];
  onToothHover?: (toothId: string | null) => void;
  onToothClick?: (toothId: string) => void;
}

// Tipo para diagnósticos agrupados
interface GroupedDiagnostico {
  nombre: string;
  siglas: string | null;
  descripcion: string | null;
  prioridadKey: PrioridadKey;
  colorHex: string | null;
  superficies: string[]; // Array de superficies unificadas
  originalDiagnosticos: DiagnosticoEntryWithContext[]; // Para mantener referencia
}

export const CompactDiagnosticsList = ({
  diagnosticos,
  onToothHover,
  onToothClick
}: CompactDiagnosticsListProps) => {
  const [expandedTeeth, setExpandedTeeth] = useState<Set<string>>(new Set());
  
  const prioridadOrden: PrioridadKey[] = ['ALTA', 'ESTRUCTURAL', 'MEDIA', 'BAJA', 'INFORMATIVA'];

  const toggleTooth = (toothId: string) => {
    const newExpanded = new Set(expandedTeeth);
    if (newExpanded.has(toothId)) {
      newExpanded.delete(toothId);
    } else {
      newExpanded.add(toothId);
    }
    setExpandedTeeth(newExpanded);
  };

  // ✅ FUNCIÓN CORREGIDA: Agrupar diagnósticos con mismo nombre y descripción similar
  const groupDiagnosticos = (diags: DiagnosticoEntryWithContext[]): GroupedDiagnostico[] => {
    const grouped = new Map<string, GroupedDiagnostico>();

    diags.forEach(diag => {
      // Clave única: nombre + descripción (normalizada)
      const key = `${diag.nombre}|${(diag.descripcion || '').trim().toLowerCase()}`;
      
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        
        // Agregar superficies únicas
        const newSuperficies = diag.areasafectadas || [];
        existing.superficies = [...new Set([...existing.superficies, ...newSuperficies])];
        existing.originalDiagnosticos.push(diag);
        
        // ✅ CORRECCIÓN: Actualizar a la prioridad más alta (índice MENOR es más alta)
        const currentPriorityIndex = prioridadOrden.indexOf(existing.prioridadKey);
        const newPriorityIndex = prioridadOrden.indexOf(diag.prioridadKey);
        
        // Si el nuevo diagnóstico tiene mayor prioridad (índice menor)
        if (newPriorityIndex < currentPriorityIndex) {
          existing.prioridadKey = diag.prioridadKey;
          // ✅ IMPORTANTE: NO cambiar el color, mantener el del diagnóstico original
          // El color ya está establecido desde el primer diagnóstico
        }
      } else {
        grouped.set(key, {
          nombre: diag.nombre,
          siglas: diag.siglas,
          descripcion: diag.descripcion,
          prioridadKey: diag.prioridadKey,
          colorHex: diag.colorHex,
          superficies: [...(diag.areasafectadas || [])],
          originalDiagnosticos: [diag]
        });
      }
    });

    // Ordenar por prioridad (índice menor = mayor prioridad)
    return Array.from(grouped.values()).sort((a, b) => 
      prioridadOrden.indexOf(a.prioridadKey) - prioridadOrden.indexOf(b.prioridadKey)
    );
  };

  const diagnosticosPorDiente = useMemo(() => {
    const grouped: Record<string, DiagnosticoEntryWithContext[]> = {};
    diagnosticos.forEach(diag => {
      const toothId = diag.dienteId;
      if (!grouped[toothId]) {
        grouped[toothId] = [];
      }
      grouped[toothId].push(diag);
    });
    return grouped;
  }, [diagnosticos]);

  const sortedToothIds = useMemo(() => {
    return Object.keys(diagnosticosPorDiente).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });
  }, [diagnosticosPorDiente]);

  const priorityConfig: Record<PrioridadKey, { 
    label: string; 
    dotColor: string; 
    bgColor: string;
    textColor: string;
  }> = {
    ALTA: { 
      label: 'Alta', 
      dotColor: 'bg-error-500',
      bgColor: 'bg-error-50 dark:bg-error-900/20',
      textColor: 'text-error-700 dark:text-error-400'
    },
    ESTRUCTURAL: { 
      label: 'Estructural', 
      dotColor: 'bg-blue-light-500',
      bgColor: 'bg-blue-light-50 dark:bg-blue-light-900/20',
      textColor: 'text-blue-light-700 dark:text-blue-light-400'
    },
    MEDIA: { 
      label: 'Media', 
      dotColor: 'bg-warning-500',
      bgColor: 'bg-warning-50 dark:bg-warning-900/20',
      textColor: 'text-warning-700 dark:text-warning-400'
    },
    BAJA: { 
      label: 'Baja', 
      dotColor: 'bg-success-500',
      bgColor: 'bg-success-50 dark:bg-success-900/20',
      textColor: 'text-success-700 dark:text-success-400'
    },
    INFORMATIVA: { 
      label: 'Info', 
      dotColor: 'bg-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      textColor: 'text-gray-600 dark:text-gray-400'
    }
  };

  const getMostSeverePriority = (diags: DiagnosticoEntryWithContext[]): PrioridadKey => {
  const priorities = diags.map(d => d.prioridadKey);
  for (const priority of prioridadOrden) {
    if (priorities.includes(priority)) {
      return priority;
    }
  }
    return 'INFORMATIVA';
  };

  const formatSurfaceName = (surface: string): string => {
    return surface
      .replace('cara_', '')
      .replace('raiz_', '')
      .replace('_', ' ')
      .toUpperCase();
  };

  if (diagnosticos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <AlertCircle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sin diagnósticos registrados
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Este snapshot no contiene hallazgos clínicos
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header minimalista */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            <span className="text-sm font-bold text-white">{sortedToothIds.length}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Diagnósticos registrados
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {sortedToothIds.length} {sortedToothIds.length === 1 ? 'diente afectado' : 'dientes afectados'}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de dientes */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 py-3 space-y-2">
          {sortedToothIds.map((toothId) => {
            const diags = diagnosticosPorDiente[toothId];
            const groupedDiags = groupDiagnosticos(diags);
            const { nombre, numero } = getToothTranslationByFdi(toothId);
            const mostSeverePriority = getMostSeverePriority(diags);
            const priorityStyle = priorityConfig[mostSeverePriority];
            const isExpanded = expandedTeeth.has(toothId);

            return (
              <div
                key={toothId}
                className="group rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-theme-sm"
              >
                {/* Header compacto del diente */}
                <button
                  onMouseEnter={() => onToothHover?.(toothId)}
                  onMouseLeave={() => onToothHover?.(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTooth(toothId);
                    onToothClick?.(toothId);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* Número del diente con color de prioridad */}
                  <div 
                    className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md shadow-sm ${priorityStyle.bgColor}`}
                  >
                    <span className={`text-sm font-bold ${priorityStyle.textColor}`}>{numero}</span>
                  </div>
                  
                  {/* Info del diente */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {nombre}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {groupedDiags.length} {groupedDiags.length === 1 ? 'diagnóstico' : 'diagnósticos'}
                    </p>
                  </div>

                  {/* Indicador de prioridad + chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`h-2 w-2 rounded-full ${priorityStyle.dotColor}`} />
                    <ChevronDown 
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </button>

                {/* Lista de diagnósticos agrupados */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="px-4 py-3 space-y-3">
                      {groupedDiags.map((grouped, idx) => {
                        const diagPriorityStyle = priorityConfig[grouped.prioridadKey];
                        
                        return (
                          <div
                            key={idx}
                            className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800"
                          >
                            {/* Header del diagnóstico con color */}
                            <div className="flex items-start gap-2 mb-2">
                              {/* Color del diagnóstico */}
                              {grouped.colorHex && (
                                <div 
                                  className="flex-shrink-0 h-5 w-1 rounded-full mt-0.5"
                                  style={{ backgroundColor: grouped.colorHex }}
                                />
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {grouped.nombre}
                                  </h4>
                                  {grouped.siglas && (
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                      ({grouped.siglas})
                                    </span>
                                  )}
                                  {/* Badge de prioridad inline */}
                                  <span className={`text-xs font-medium ${diagPriorityStyle.textColor}`}>
                                    • {diagPriorityStyle.label}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Superficies afectadas */}
                            {grouped.superficies.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                  Superficies ({grouped.superficies.length}):
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {grouped.superficies.map((surface, surfIdx) => (
                                    <span
                                      key={surfIdx}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                                      style={{
                                        backgroundColor: grouped.colorHex ? `${grouped.colorHex}15` : undefined,
                                        borderColor: grouped.colorHex ? `${grouped.colorHex}50` : undefined,
                                        color: grouped.colorHex || undefined,
                                      }}
                                    >
                                      {formatSurfaceName(surface)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Descripción (si existe) */}
                            {grouped.descripcion && (
                              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {grouped.descripcion}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer minimalista */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Haz clic para expandir detalles
        </p>
        <button
          onClick={() => {
            if (expandedTeeth.size === sortedToothIds.length) {
              setExpandedTeeth(new Set());
            } else {
              setExpandedTeeth(new Set(sortedToothIds));
            }
          }}
          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
>
          {expandedTeeth.size === sortedToothIds.length ? 'Colapsar' : 'Expandir'} todos
        </button>
      </div>
    </div>
  );
};
