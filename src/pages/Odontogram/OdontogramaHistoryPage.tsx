// src/pages/odontogram/OdontogramaHistoryPage.tsx
import { useState, useEffect, useMemo, useRef } from "react";
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

  // Ajuste de layout (respetando header y menús)
  useEffect(() => {
    const layoutContent = document.getElementById("layout-content");
    const header = document.querySelector('header');
    if (!layoutContent || !header) return;
    header.style.zIndex = '40';
    const prevStyles = {
      padding: layoutContent.style.padding,
      maxWidth: layoutContent.style.maxWidth,
      overflow: layoutContent.style.overflow,
      height: layoutContent.style.height,
      minHeight: layoutContent.style.minHeight,
    };

    // Configurar el layout-content para pantalla completa
    layoutContent.style.padding = "0";
    layoutContent.style.maxWidth = "100%";
    layoutContent.style.overflow = "hidden";
    layoutContent.style.minHeight = "calc(100vh - var(--header-height, 5.3rem))";
    layoutContent.style.height = "auto";

    // Calcular dinámicamente el espacio disponible
    const updateHeight = () => {
      if (containerRef.current) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 84; // 5.3rem ≈ 84px
        
        // Establecer variable CSS para uso en Tailwind
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        
        const availableHeight = `calc(100vh - ${headerHeight}px)`;
        containerRef.current.style.height = availableHeight;
        containerRef.current.style.maxHeight = availableHeight;
      }
    };

    // Actualizar inicialmente y en resize
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(document.documentElement);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      // Restaurar estilos
      layoutContent.style.padding = prevStyles.padding;
      layoutContent.style.maxWidth = prevStyles.maxWidth;
      layoutContent.style.overflow = prevStyles.overflow;
      layoutContent.style.height = prevStyles.height;
      layoutContent.style.minHeight = prevStyles.minHeight;
      
      // Limpiar
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
      document.documentElement.style.removeProperty('--header-height');
      
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
    <div 
      ref={containerRef}
      className="w-full flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900"
      style={{ height: 'calc(100vh - var(--header-height, 5.3rem))' }}
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