// src/components/preview/hooks/useToothDiagnosticsFilter.ts

import { DIAGNOSTICO_CATEGORIES } from "../../../../core/config/odontograma";
import type { DiagnosticoCategory } from "../../../../core/types/typeOdontograma";
import type { Diagnostico, DatosDiente } from "../ToothStatusDisplay";

interface FilterResult {
    diagnosticosFiltrados: Diagnostico[];
    esFiltroPorSuperficie: boolean;
    diagnosticosOriginales: Diagnostico[];
}

export const useToothDiagnosticsFilter = (
    datosDiente: DatosDiente,
    superficieSeleccionada?: 'corona' | 'raiz',
    diagnosticoIdEnPreview?: string,
): FilterResult => {

    const diagsOriginales = datosDiente?.diagnósticos || [];
    let diags = [...diagsOriginales]; 
    let esFiltroPorSuperficie: boolean = false;

    if (diags.length === 0) {
        return { diagnosticosFiltrados: [], esFiltroPorSuperficie: false, diagnosticosOriginales: [] };
    }

    const diagnosticoEnPreview = diagnosticoIdEnPreview
        ? DIAGNOSTICO_CATEGORIES.flatMap((c: DiagnosticoCategory) => c.diagnosticos).find(d => d.id === diagnosticoIdEnPreview)
        : null;

    const categoriaEnPreview = diagnosticoEnPreview?.categoria;

    if (categoriaEnPreview) {
        const diagsFiltrados = diags.filter(d =>
            d.categoria === categoriaEnPreview || d.areas_afectadas.includes('general')
        );
        diags = diagsFiltrados;

    } else if (superficieSeleccionada) {
        esFiltroPorSuperficie = true;

        const diagsFiltrados = diags.filter(d => {
            const afectaSuperficie = d.areas_afectadas.includes(superficieSeleccionada);
            const esPuramenteGeneral = d.areas_afectadas.length === 1 && d.areas_afectadas.includes('general');

            return afectaSuperficie || (d.areas_afectadas.includes('general') && !esPuramenteGeneral);
        });

        diags = diagsFiltrados;

    }

    return {
        diagnosticosFiltrados: diags,
        esFiltroPorSuperficie,
        diagnosticosOriginales: diagsOriginales,
    };
};