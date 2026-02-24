// src/pages/odontogram/OdontogramaHistoryPage.tsx
//
// CAMBIO: Eliminado el useEffect que manipulaba #layout-content, header y ResizeObserver.
// Eso lo maneja FullScreenLayout via fullscreenLock para evitar condiciones de carrera.
// El height del contenedor usa CSS estático en lugar de cálculo dinámico por JS.

import { useState, useMemo, useRef } from "react";
import { OdontogramaTimeline } from "../../components/odontogram/history/OdontogramaTimeline";
import type { OdontogramaSnapshot } from "../../core/types/odontogramaHistory.types";
import {
  PacienteProvider,
  usePacienteActivo,
} from "../../context/PacienteContext";
import { useOdontogramaSnapshots } from "../../hooks/odontogram/historialHooks/useOdontogramaSnapshots";
import { useAuth } from "../../hooks/auth/useAuth";

import { HistoryEmptyState } from "../../components/odontogram/history/historyView/HistoryEmptyState";
import { HistoryHeader } from "../../components/odontogram/history/historyView/HistoryHeader";
import { HistorySingleView } from "../../components/odontogram/history/historyView/HistorySingleView";
import { HistoryCompareView } from "../../components/odontogram/history/historyView/HistoryCompareView";
import { FullScreenLayout } from "../../layout/FullScreenLayout";

const OdontogramaHistoryPageInner = () => {
  const { pacienteActivo } = usePacienteActivo();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    snapshots,
    selectedSnapshot,
    compareSnapshot,
    selectedSnapshotId,
    selectSnapshot,
    selectCompareSnapshot,
    isLoading,
    error,
  } = useOdontogramaSnapshots({
    pacienteId: pacienteActivo?.id,
    odontologoId: pacienteActivo ? undefined : user?.id,
    enabled: true,
  });

  const effectiveSnapshots: OdontogramaSnapshot[] = useMemo(
    () => snapshots ?? [],
    [snapshots],
  );

  const [comparisonMode, setComparisonMode] = useState(false);

  const baseSnapshot = useMemo(() => {
    if (selectedSnapshot) return selectedSnapshot;
    return effectiveSnapshots[0];
  }, [selectedSnapshot, effectiveSnapshots]);

  const activeCompareSnapshot = useMemo(() => {
    if (!comparisonMode) return null;
    if (compareSnapshot) return compareSnapshot;
    return effectiveSnapshots[1] ?? effectiveSnapshots[0];
  }, [comparisonMode, compareSnapshot, effectiveSnapshots]);

  if (isLoading) {
    return <div className="p-4">Cargando historial de odontograma...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        Error al cargar historial: {String(error)}
      </div>
    );
  }

  if (!pacienteActivo && !effectiveSnapshots.length) {
    return <HistoryEmptyState variant="sinPaciente" />;
  }

  if (pacienteActivo && !effectiveSnapshots.length) {
    return (
      <HistoryEmptyState
        variant="sinHistorialPaciente"
        pacienteNombre={pacienteActivo.nombres}
      />
    );
  }

  const handleSelectSnapshot = (id: string) => {
    if (comparisonMode) {
      if (selectedSnapshotId !== id) {
        selectCompareSnapshot(id);
      }
    } else {
      selectSnapshot(id);
      selectCompareSnapshot(id);
    }
  };

  const toggleComparisonMode = () => {
    setComparisonMode((prev) => {
      const next = !prev;

      if (next && effectiveSnapshots.length > 1) {
        const currentId = selectedSnapshotId ?? effectiveSnapshots[0].id;
        const mostRecentId = effectiveSnapshots[0].id;
        selectSnapshot(currentId);
        selectCompareSnapshot(
          mostRecentId !== currentId
            ? mostRecentId
            : effectiveSnapshots[1]?.id ?? currentId,
        );
      } else if (!next) {
        const baseId = selectedSnapshotId ?? effectiveSnapshots[0].id;
        selectSnapshot(baseId);
        selectCompareSnapshot(baseId);
      }

      return next;
    });
  };

  return (
    <FullScreenLayout className="relative bg-white rounded-xl shadow-sm">
      {/* h-full hereda el calc(100vh - 5.3rem) que aplica FullScreenLayout al #layout-content */}
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900"
      >
        {/* Sidebar timeline */}
        <div className="w-full md:w-85 flex-shrink-0 bg-white dark:bg-gray-800 border-b md:border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <HistoryHeader
            totalSnapshots={effectiveSnapshots.length}
            comparisonMode={comparisonMode}
            onToggleComparisonMode={toggleComparisonMode}
            patient={pacienteActivo}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <OdontogramaTimeline
              snapshots={effectiveSnapshots}
              onSelectSnapshot={handleSelectSnapshot}
              selectedSnapshotId={
                selectedSnapshotId ?? effectiveSnapshots[0]?.id
              }
            />
          </div>
        </div>

        {/* Área de visualización */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {comparisonMode &&
          activeCompareSnapshot &&
          baseSnapshot.id !== activeCompareSnapshot.id ? (
            <HistoryCompareView
              beforeSnapshot={baseSnapshot}
              afterSnapshot={activeCompareSnapshot}
            />
          ) : (
            <HistorySingleView snapshot={baseSnapshot} />
          )}
        </div>
      </div>
    </FullScreenLayout>
  );
};

const OdontogramaHistoryPage = () => (
  <PacienteProvider>
    <OdontogramaHistoryPageInner />
  </PacienteProvider>
);

export default OdontogramaHistoryPage;