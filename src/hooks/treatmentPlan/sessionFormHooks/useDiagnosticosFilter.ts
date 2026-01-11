// src/hooks/treatmentPlan/useDiagnosticosFilter.ts

import { useState, useMemo } from "react";
import { groupTreatmentDiagnostics, type GroupedTreatmentDiagnostic } from "../../../core/utils/groupTreatmentDiagnostics";
import type { DiagnosticoSnapshot } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";

export type FiltroDiagnostico =
  | "todos"
  | "nuevos"
  | "preventivo"
  | "ausencia"
  | "patologia-activa"
  | "tratamiento-realizado";

interface DiagnosticosDisponibles {
  diagnosticos: DiagnosticoSnapshot[];
  total_diagnosticos: number;
}

export const MAP_FILTRO_A_MATCHER: Record<
  Exclude<FiltroDiagnostico, "todos" | "nuevos">,
  (value: string) => boolean
> = {
  preventivo: (v) => v.toLowerCase().includes("preventivo"),
  ausencia: (v) => v.toLowerCase().includes("ausen"),
  "patologia-activa": (v) =>
    v.toLowerCase().includes("patolog") && v.toLowerCase().includes("activa"),
  "tratamiento-realizado": (v) =>
    v.toLowerCase().includes("tratamiento") || v.toLowerCase().includes("realizado"),
};

export const FILTER_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "nuevos", label: "Nuevos diagnósticos" },
  { value: "preventivo", label: "Preventivo" },
  { value: "ausencia", label: "Ausencias" },
  { value: "patologia-activa", label: "Patología activa" },
  { value: "tratamiento-realizado", label: "Tratamiento realizado" },
] as const;

export function useDiagnosticosFilter(
  diagnosticosDisponibles: DiagnosticosDisponibles | undefined
) {
  const [selectedDiagnosticos, setSelectedDiagnosticos] = useState<DiagnosticoSnapshot[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtroDiagnostico, setFiltroDiagnostico] = useState<FiltroDiagnostico>("nuevos");

  const gruposDisponiblesTotal = useMemo(() => {
    const todosLosDiagnosticos = diagnosticosDisponibles?.diagnosticos ?? [];
    return groupTreatmentDiagnostics(todosLosDiagnosticos).length;
  }, [diagnosticosDisponibles]);

  const diagnosticosFiltrados = useMemo(() => {
    const todos = diagnosticosDisponibles?.diagnosticos ?? [];
    
    if (filtroDiagnostico === "todos") {
      return todos;
    }

    if (filtroDiagnostico === "nuevos") {
      return todos.filter((d) => d.es_nuevo === true);
    }

    const matcher = MAP_FILTRO_A_MATCHER[filtroDiagnostico];
    return todos.filter((d) => d.categoria && matcher(d.categoria));
  }, [diagnosticosDisponibles, filtroDiagnostico]);

  const diagnosticosAgrupados = useMemo(() => {
    return groupTreatmentDiagnostics(diagnosticosFiltrados);
  }, [diagnosticosFiltrados]);

  const gruposSeleccionados = useMemo(() => {
    return groupTreatmentDiagnostics(selectedDiagnosticos);
  }, [selectedDiagnosticos]);

  const gruposPorFiltro = useMemo(() => {
    const todos = diagnosticosDisponibles?.diagnosticos ?? [];
    
    return {
      todos: groupTreatmentDiagnostics(todos).length,
      nuevos: groupTreatmentDiagnostics(
        todos.filter((d) => d.es_nuevo === true)
      ).length,
      preventivo: groupTreatmentDiagnostics(
        todos.filter((d) => d.categoria?.toLowerCase().includes("preventivo"))
      ).length,
      ausencia: groupTreatmentDiagnostics(
        todos.filter((d) => d.categoria?.toLowerCase().includes("ausen"))
      ).length,
      "patologia-activa": groupTreatmentDiagnostics(
        todos.filter((d) => {
          const cat = d.categoria?.toLowerCase() || "";
          return cat.includes("patolog") && cat.includes("activa");
        })
      ).length,
      "tratamiento-realizado": groupTreatmentDiagnostics(
        todos.filter((d) => {
          const cat = d.categoria?.toLowerCase() || "";
          return cat.includes("tratamiento") || cat.includes("realizado");
        })
      ).length,
    };
  }, [diagnosticosDisponibles]);

  const getCurrentFilterLabel = () => {
    return FILTER_OPTIONS.find((f) => f.value === filtroDiagnostico)?.label || "Filtro";
  };

  const handleToggleDiagnostico = (group: GroupedTreatmentDiagnostic) => {
    setSelectedDiagnosticos((prev) => {
      const isGroupSelected = group.diagnostico_ids.some((id) =>
        prev.some((d) => d.id === id)
      );

      if (isGroupSelected) {
        return prev.filter((d) => !group.diagnostico_ids.includes(d.id));
      } else {
        const diagnosticosOriginales = diagnosticosFiltrados.filter((d) =>
          group.diagnostico_ids.includes(d.id)
        );
        return [...prev, ...diagnosticosOriginales];
      }
    });
  };

  return {
    selectedDiagnosticos,
    setSelectedDiagnosticos,
    isFilterOpen,
    setIsFilterOpen,
    filtroDiagnostico,
    setFiltroDiagnostico,
    gruposDisponiblesTotal,
    diagnosticosFiltrados,
    diagnosticosAgrupados,
    gruposSeleccionados,
    gruposPorFiltro,
    getCurrentFilterLabel,
    handleToggleDiagnostico,
  };
}
