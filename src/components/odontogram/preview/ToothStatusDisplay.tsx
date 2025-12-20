// src/components/preview/ToothStatusDisplay.tsx
import React, { useMemo } from "react";
import { ToothPreviewOverlay, useToothColorDecision, useToothDiagnosticsFilter } from "..";


// --- Tipos necesarios (Mantenemos la exportación) ---
export type Diagnostico = {
  id: string;
  procedimientoId?: string;
  siglas: string;
  nombre: string;
  prioridadKey: "ALTA" | "MEDIA" | "BAJA" | "INFORMATIVA" | "ESTRUCTURAL";
  areas_afectadas: ("corona" | "raiz" | "general")[];
  categoria?: string;
};

export type DatosDiente = {
  diagnósticos: Diagnostico[];
};

/* ----------------------------------------------------
 * Props
 * -------------------------------------------------- */
interface ToothStatusDisplayProps {
  datosDiente: DatosDiente;
  nombreDiente: string; // solo contexto / debug
  superficieSeleccionada?: "corona" | "raiz";
  diagnosticoIdEnPreview?: string;
  isToothUpper: boolean;
}

/* ----------------------------------------------------
 * Componente
 * -------------------------------------------------- */
export const ToothStatusDisplay: React.FC<ToothStatusDisplayProps> = ({
  datosDiente,
  superficieSeleccionada,
  diagnosticoIdEnPreview,
  isToothUpper,
}) => {
  /* ---------- Guard clause ---------- */
  if (!datosDiente || datosDiente.diagnósticos.length === 0) {
    return null;
  }

  /* ---------- PASO 1: Filtrado ---------- */
  const { diagnosticosFiltrados, esFiltroPorSuperficie } =
    useToothDiagnosticsFilter(
      datosDiente,
      superficieSeleccionada,
      diagnosticoIdEnPreview
    );

  if (diagnosticosFiltrados.length === 0) {
    return null;
  }

  /* ---------- PASO 2: Decisión visual ---------- */
  const decision = useToothColorDecision(
    diagnosticosFiltrados,
    esFiltroPorSuperficie
  );

  const {
    svgsCorona,
    svgsRaiz,
    tooltipCorona,
    tooltipRaiz,
    colorGlobal,
    coberturaTotal,
    coberturaTotalSvg,
    coberturaTotalTooltip,
  } = decision;

  /* ---------- PASO 3: Normalización de datos ---------- */
  const overlayProps = useMemo(() => {
    // Caso: cobertura total del diente
    if (coberturaTotal && coberturaTotalSvg && coberturaTotalTooltip) {
      return {
        svgsCorona: [coberturaTotalSvg],
        svgsRaiz: [coberturaTotalSvg],
        tooltipCorona: coberturaTotalTooltip,
        tooltipRaiz: coberturaTotalTooltip,
        color: colorGlobal,
        coberturaTotal: true,
      };
    }

    // Caso: sin íconos visibles
    if (svgsCorona.length === 0 && svgsRaiz.length === 0) {
      return null;
    }

    // Caso normal
    return {
      svgsCorona,
      svgsRaiz,
      tooltipCorona,
      tooltipRaiz,
      color: colorGlobal,
      coberturaTotal: false,
    };
  }, [
    coberturaTotal,
    coberturaTotalSvg,
    coberturaTotalTooltip,
    svgsCorona,
    svgsRaiz,
    tooltipCorona,
    tooltipRaiz,
    colorGlobal,
  ]);

  if (!overlayProps) {
    return null;
  }

  /* ---------- PASO 4: Render ---------- */
  return (
    <ToothPreviewOverlay
      {...overlayProps}
      isToothUpper={isToothUpper}
    />
  );
};
