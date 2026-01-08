// src/components/odontogram/history/historyView/DetailedToothView.tsx

import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { getToothTranslationByFdi } from '../../../../core/utils/toothTraslations';
import type { DiagnosticoEntry, PrioridadKey } from '../../../../core/types/odontograma.types';
import { ToothSurfacesStaticView } from './ToothSurfacesStaticView';

interface DetailedToothViewProps {
  selectedTooth: string | null;
  diagnosticosPorDiente: Record<string, DiagnosticoEntry[]>;
  getPermanentColorForSurface: (toothId: string | null, surfaceId: string) => string | null;
  onToothSelect?: (toothId: string | null) => void;
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

export const DetailedToothView: React.FC<DetailedToothViewProps> = ({
  selectedTooth,
  diagnosticosPorDiente,
  getPermanentColorForSurface,
}) => {
  // Obtener diagnósticos del diente seleccionado
  const toothDiagnostics = useMemo(() => {
    if (!selectedTooth) return [];
    return diagnosticosPorDiente[selectedTooth] || [];
  }, [selectedTooth, diagnosticosPorDiente]);

  // Agrupar diagnósticos unificados
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
  // RENDER: Sin diente seleccionado (Estado vacío)
  // ============================================================================
  if (!selectedTooth || !toothInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Selecciona un diente
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
          Haz clic en un diente del odontograma 3D para visualizar sus superficies afectadas y diagnósticos detallados.
        </p>
      </div>
    );
  }

  // ============================================================================
  // RENDER: Con diente seleccionado
  // ============================================================================
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
      {/* HEADER: Info del diente seleccionado */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Badge del número */}
            <div className="w-10 h-10 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center text-sm">
              {toothInfo.numero}
            </div>
            {/* Info */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {toothInfo.nombre}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pieza #{toothInfo.numero} • {toothDiagnostics.length} diagnóstico
                {toothDiagnostics.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Badge de modo lectura */}
          <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Solo lectura
          </div>
        </div>
      </div>

      {/* CONTENT: Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* SECCIÓN SUPERIOR: SVGs con colores aplicados */}
          {!onlyGeneral && toothDiagnostics.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Vista de superficies afectadas
              </h4>
              <ToothSurfacesStaticView
                toothId={selectedTooth}
                diagnosticos={toothDiagnostics}
                getPermanentColorForSurface={getPermanentColorForSurface}
              />
            </div>
          )}

          {/* SECCIÓN INFERIOR: Cards de diagnósticos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
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
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                Sin diagnósticos registrados para este diente en este momento temporal.
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header con color indicador */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex-1">
          {/* Título y siglas */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: diagnostico.colorHex }}
            />
            <h5 className="font-semibold text-gray-900 dark:text-white">
              {diagnostico.nombre}
            </h5>
            {diagnostico.siglas && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Código: {diagnostico.siglas}
              </span>
            )}
          </div>
        </div>
        
        {/* Badge de prioridad */}
        <span
          className={`px-2 py-1 rounded text-xs font-medium border ${priorityInfo.color}`}
        >
          {priorityInfo.label}
        </span>
      </div>

      {/* Body con información detallada */}
      <div className="p-4 space-y-3">
        {/* Superficies afectadas */}
        {diagnostico.superficiesUnificadas && diagnostico.superficiesUnificadas.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Superficies afectadas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {diagnostico.superficiesUnificadas.map((surface, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  {surface.replace('cara_', '').replace('raiz_', '').replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Descripción/Comentarios */}
        {diagnostico.descripcion && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Comentarios clínicos
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {diagnostico.descripcion}
            </p>
          </div>
        )}

        {/* Opciones secundarias (Atributos clínicos) */}
        {diagnostico.secondaryOptions &&
          Object.keys(diagnostico.secondaryOptions).length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Atributos clínicos
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(diagnostico.secondaryOptions).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded text-xs"
                  >
                    <span className="text-gray-600 dark:text-gray-400">{key}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Metadatos adicionales */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span>{diagnostico.colorHex}</span>
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
