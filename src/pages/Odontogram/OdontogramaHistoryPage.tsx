// src/pages/odontogram/OdontogramaHistoryPage.tsx
import { useState, useEffect, useMemo } from "react";
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

const OdontogramaHistoryPageInner = () => {
  const { pacienteActivo } = usePacienteActivo();
  const { user } = useAuth();

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
  // Ajuste de layout (full screen)
  useEffect(() => {
    const el = document.getElementById("layout-content");
    if (!el) return;

    const prev = {
      padding: el.style.padding,
      maxWidth: el.style.maxWidth,
      height: el.style.height,
      overflow: el.style.overflow,
    };

    el.style.padding = "0";
    el.style.maxWidth = "100%";
    el.style.height = "calc(100vh - 80px)";
    el.style.overflow = "hidden";

    return () => {
      el.style.padding = prev.padding;
      el.style.maxWidth = prev.maxWidth;
      el.style.height = prev.height;
      el.style.overflow = prev.overflow;
    };
  }, []);

  // Loading / error global
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

  // Sin paciente y sin historial
  if (!pacienteActivo && !effectiveSnapshots.length) {
    return <HistoryEmptyState variant="sinPaciente" />;
  }

  // Paciente seleccionado pero sin historial
  if (pacienteActivo && !effectiveSnapshots.length) {
    return (
      <HistoryEmptyState
        variant="sinHistorialPaciente"
        pacienteNombre={pacienteActivo.nombres}
      />
    );
  }
  const handleSelectSnapshot = (id: string) => {
    console.log('[HISTORY_PAGE] Snapshot seleccionado:', id);
    
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
        // Al entrar en modo comparación:
        // - Si hay selección actual, mantenerla como "antes"
        // - Seleccionar el más reciente como "después"
        const currentId = selectedSnapshotId ?? effectiveSnapshots[0].id;
        const mostRecentId = effectiveSnapshots[0].id;
        
        selectSnapshot(currentId);
        selectCompareSnapshot(mostRecentId !== currentId ? mostRecentId : effectiveSnapshots[1]?.id ?? currentId);
      } else if (!next) {
        // Al salir de modo comparación: alinear ambos al snapshot actual
        const baseId = selectedSnapshotId ?? effectiveSnapshots[0].id;
        selectSnapshot(baseId);
        selectCompareSnapshot(baseId);
      }

      return next;
    });
  };



  return (
    <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar timeline */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark flex flex-col h-full overflow-hidden">
        <HistoryHeader
          totalSnapshots={effectiveSnapshots.length}
          comparisonMode={comparisonMode}
          onToggleComparisonMode={toggleComparisonMode}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <OdontogramaTimeline
            snapshots={effectiveSnapshots}
            onSelectSnapshot={handleSelectSnapshot}
            selectedSnapshotId={
              selectedSnapshotId ?? effectiveSnapshots[0]?.id
            }
            // OPCIONAL: Si tu timeline soporta mostrar el compare seleccionado
            //compareSnapshotId={comparisonMode ? activeCompareSnapshot?.id : undefined}
          />
        </div>
      </div>

      {/* Área de visualización */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {comparisonMode && activeCompareSnapshot && baseSnapshot.id !== activeCompareSnapshot.id ? (
          <HistoryCompareView
            beforeSnapshot={baseSnapshot}
            afterSnapshot={activeCompareSnapshot}
          />
        ) : (
          <HistorySingleView snapshot={baseSnapshot} />
        )}
      </div>
    </div>
  );
};

const OdontogramaHistoryPage = () => (
  <PacienteProvider>
    <OdontogramaHistoryPageInner />
  </PacienteProvider>
);

export default OdontogramaHistoryPage;