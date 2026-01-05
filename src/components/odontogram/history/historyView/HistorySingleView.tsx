// src/components/odontogram/history/historyView/HistorySingleView.tsx

import { useState, useMemo, useCallback } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { OdontogramaHistoryViewer } from '../..';
import { ViewModeToggle } from './ViewModeToggle';
import { CompactDiagnosticsList } from './CompactDiagnosticsList';
import { DetailedToothView } from './DetailedToothView';
import type { OdontogramaSnapshot } from '../../../../core/types/odontogramaHistory.types';
import type { HistoryViewMode, DiagnosticoEntryWithContext } from '../../../../core/types/historyView.types';
import type { DiagnosticoEntry } from '../../../../core/types/odontograma.types';

interface HistorySingleViewProps {
  snapshot: OdontogramaSnapshot;
  onRequestCompare?: () => void;
}

export const HistorySingleView = ({
  snapshot,
}: HistorySingleViewProps) => {
  const [viewMode, setViewMode] = useState<HistoryViewMode>('compact');
  const [hoveredToothInList, setHoveredToothInList] = useState<string | null>(null);
  const [selectedToothFromList, setSelectedToothFromList] = useState<string | null>(null);

  // Manejar cambio de vista
  const handleViewModeChange = useCallback(
    (mode: HistoryViewMode) => {
      setViewMode(mode);
    },
    [],
  );

  const allDiagnosticos = useMemo((): DiagnosticoEntryWithContext[] => {
    const diags: DiagnosticoEntryWithContext[] = [];

    if (!snapshot.odontogramaData) return diags;

    for (const toothId in snapshot.odontogramaData) {
      const toothData = snapshot.odontogramaData[toothId];

      for (const surfaceId in toothData) {
        const entries = toothData[surfaceId];

        entries.forEach((entry: DiagnosticoEntry) => {
          diags.push({
            ...entry,
            dienteId: toothId,
            superficieIdContext: surfaceId,
          });
        });
      }
    }

    return diags;
  }, [snapshot.odontogramaData]);

  // Agrupar diagnósticos por diente (para vista detallada)
  const diagnosticosPorDiente = useMemo(() => {
    const grouped: Record<string, DiagnosticoEntryWithContext[]> = {};

    allDiagnosticos.forEach(diag => {
      const toothId = diag.dienteId;
      if (!grouped[toothId]) {
        grouped[toothId] = [];
      }
      grouped[toothId].push(diag);
    });

    return grouped;
  }, [allDiagnosticos]);
  const getPermanentColorForSurfaceFromSnapshot = useCallback(
    (toothId: string | null, surfaceId: string): string | null => {
      if (!toothId || !snapshot.odontogramaData) return null;
      const toothData = snapshot.odontogramaData[toothId];
      if (!toothData) return null;
      const entries: DiagnosticoEntry[] = toothData[surfaceId] || [];
      if (!entries.length) return null;
      const sorted = [...entries].sort((a, b) => b.priority - a.priority);
      return sorted[0].colorHex || null;
    },
    [snapshot.odontogramaData]
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header con metadata y toggle de vistas */}
      <div className="flex items-center justify-between gap-4">
        {/* Metadata del snapshot */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>
              {snapshot.fecha.toLocaleDateString('es-EC', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>
              {snapshot.fecha.toLocaleTimeString('es-EC', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {snapshot.profesionalNombre && (
            <div className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Dr. {snapshot.profesionalNombre}</span>
            </div>
          )}
        </div>

        {/* Toggle de vistas */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {allDiagnosticos.length} diagnóstico
            {allDiagnosticos.length !== 1 ? 's' : ''} registrados •{' '}
            {Object.keys(diagnosticosPorDiente).length} dientes afectados
          </span>
          <ViewModeToggle
            currentMode={viewMode}
            onModeChange={handleViewModeChange}
          />
        </div>
      </div>

      <div className="flex h-full gap-4">
        <div
          className={
            viewMode === 'hidden'
              ? 'w-full transition-all duration-300' 
              : 'w-2/3 transition-all duration-300'  
          }
        >
          <OdontogramaHistoryViewer
                odontogramaData={snapshot.odontogramaData}
                selectedTooth={selectedToothFromList}
                onToothSelect={setSelectedToothFromList}
                hoveredToothInList={hoveredToothInList}
              />
        </div>
        <div
          className={
            viewMode === 'hidden'
              ? 'w-0 opacity-0 pointer-events-none overflow-hidden transition-all duration-300' // EDITADO
              : 'w-1/3 opacity-100 transition-all duration-300' // EDITADO
          }
        >
          {/* Compacta */}
          {viewMode === 'compact' && (
            <CompactDiagnosticsList
                diagnosticos={allDiagnosticos}
                onToothHover={setHoveredToothInList}
                onToothClick={setSelectedToothFromList}
              />
          )}

          {/* Detallada */}
          {viewMode === 'detailed' && (
            <div className="space-y-4 h-full overflow-y-auto pr-1">
              {Object.entries(diagnosticosPorDiente).map(([toothId, diags]) => (
                <DetailedToothView
                      key={toothId}
                      toothId={toothId}
                      diagnosticos={diags}
                      getPermanentColorForSurface={getPermanentColorForSurfaceFromSnapshot}
                    />

              ))}
            </div>
          )}

          {/* EDITADO: ya no mostramos texto “Historial oculto”, el modo hidden solo colapsa el panel */}
        </div>
      </div>
    </div>
  );
};