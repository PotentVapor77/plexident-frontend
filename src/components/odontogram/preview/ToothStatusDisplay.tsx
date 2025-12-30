// src/components/odontogram/preview/ToothStatusDisplay.tsx
import React from "react";

import { useToothIconDecision } from "./hooks/useToothIconDecision";
import { ToothPreviewOverlay } from "./ToothPreviewOverlay";
import { useToothDiagnosticsFilter } from "./hooks/useToothDiagnosticsFilter";

// --- Tipos ---
export type Diagnostico = {
  id: string;
  key: string;
  procedimientoId?: string;
  siglas: string;
  nombre: string;
  prioridadKey: "ALTA" | "MEDIA" | "BAJA" | "INFORMATIVA" | "ESTRUCTURAL";
  areasafectadas: ("corona" | "raiz" | "general")[];
  categoria?: string;
};

export type DatosDiente = {
  diagnósticos: Diagnostico[];
};

interface ToothStatusDisplayProps {
  datosDiente: DatosDiente;
  nombreDiente: string;
  superficieSeleccionada?: "corona" | "raiz";
  diagnosticoIdEnPreview?: string;
  isToothUpper: boolean;
}

export const ToothStatusDisplay: React.FC<ToothStatusDisplayProps> = ({
  datosDiente,
  superficieSeleccionada,
  diagnosticoIdEnPreview,
  isToothUpper
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

  /* ---------- PASO 2: Icono Lucide dominante ---------- */
  const {
    mainIconKey,
    iconCount,
    tooltip,
    colorGlobal
  } = useToothIconDecision(diagnosticosFiltrados, esFiltroPorSuperficie);

  if (!mainIconKey) return null;

  return (
    <ToothPreviewOverlay
      mainIconKey={mainIconKey}
      iconCount={iconCount}
      tooltip={tooltip}
      color={colorGlobal}
      isToothUpper={isToothUpper}
    />
  );
};
