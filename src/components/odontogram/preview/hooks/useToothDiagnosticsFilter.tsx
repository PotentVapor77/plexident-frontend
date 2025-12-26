// src/components/preview/hooks/useToothDiagnosticsFilter.ts

import type { DatosDiente, Diagnostico } from "../..";
import type { DiagnosticoCategory } from "../../../../core/types/typeOdontograma";

interface FilterResult {
  diagnosticosFiltrados: Diagnostico[];
  esFiltroPorSuperficie: boolean;
  diagnosticosOriginales: Diagnostico[];
}

export const useToothDiagnosticsFilter = (
  datosDiente: DatosDiente,
  superficieSeleccionada?: 'corona' | 'raiz',
  diagnosticoIdEnPreview?: string,
  categoriasCatalogo?: DiagnosticoCategory[],
): FilterResult => {
  const diagsOriginales = datosDiente?.diagnósticos || [];
  let diags = [...diagsOriginales];
  let esFiltroPorSuperficie = false;

  if (diags.length === 0) {
    return { diagnosticosFiltrados: [], esFiltroPorSuperficie: false, diagnosticosOriginales: [] };
  }

  const diagnosticoEnPreview = diagnosticoIdEnPreview && categoriasCatalogo
    ? categoriasCatalogo
      .flatMap((c: DiagnosticoCategory) => c.diagnosticos)
      .find(d => d.id === diagnosticoIdEnPreview)
    : null;

  const categoriaEnPreview = diagnosticoEnPreview?.categoria;

  if (categoriaEnPreview) {
    const diagsFiltrados = diags.filter(d =>
      d.categoria === categoriaEnPreview || d.areasafectadas.includes('general')
    );
    diags = diagsFiltrados;
  } else if (superficieSeleccionada) {
    esFiltroPorSuperficie = true;
    const diagsFiltrados = diags.filter(d => {
      const afectaSuperficie = d.areasafectadas.includes(superficieSeleccionada);
      const esPuramenteGeneral =
        d.areasafectadas.length === 1 && d.areasafectadas.includes('general');
      return afectaSuperficie || (d.areasafectadas.includes('general') && !esPuramenteGeneral);
    });
    diags = diagsFiltrados;
  }

  return {
    diagnosticosFiltrados: diags,
    esFiltroPorSuperficie,
    diagnosticosOriginales: diagsOriginales,
  };
};