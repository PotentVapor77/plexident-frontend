// src/hooks/treatmentPlan/sessionFormHooks/useAutoProcedimientosFromDiagnosticos.ts

import { useEffect } from "react";
import type {
    Procedimiento,
    DiagnosticoSnapshot,
} from "../../../types/treatmentPlan/typeBackendTreatmentPlan";

const SUPERFICIE_TO_SIGLA: Record<string, string> = {
    general: "G",
    oclusal: "O",
    vestibular: "V",
    lingual: "L",
    palatina: "P",
    mesial: "M",
    distal: "D",
    raiz_mesial: "RM",
    raiz_distal: "RD",
    raiz_palatal: "RP",
    raiz_vestibular: "RV",
    raiz_principal: "RP",
};

interface UseAutoProcedimientosParams {
    autocompletar: boolean;
    selectedDiagnosticos: DiagnosticoSnapshot[];
    procedimientos: Procedimiento[];
    setProcedimientos: (procs: Procedimiento[]) => void;
}

/**
 * Genera procedimientos sugeridos en tiempo real, con texto más descriptivo.
 * SOLUCIÓN: Evita duplicados eliminando todos los autogenerados previos.
 */
export function useAutoProcedimientosFromDiagnosticos({
    autocompletar,
    selectedDiagnosticos,
    procedimientos,
    setProcedimientos,
}: UseAutoProcedimientosParams) {
    useEffect(() => {
        if (!autocompletar) {
            return;
        }

        // 1. Separar procedimientos manuales de los autogenerados
        const manuales = procedimientos.filter((p) => !p.autogenerado);
        
        if (selectedDiagnosticos.length === 0) {
            // Cuando no hay diagnósticos seleccionados, solo mostramos manuales
            if (manuales.length !== procedimientos.length) {
                setProcedimientos(manuales);
            }
            return;
        }

        // 2. Generar nuevos procedimientos autogenerados basados en diagnósticos
        type GrupoKey = string;

        const grupos = new Map<
            GrupoKey,
            {
                categoria: string;
                diagnosticoNombre: string;
                diagnosticoKey: string;
                notas: string;
                diente: string;
                superficies: string[];
                atributos: Record<string, any>;
            }
        >();

        for (const d of selectedDiagnosticos) {
            const categoria = d.categoria || "";
            const diagnosticoKey = d.diagnostico_key;
            const diagnosticoNombre =
                d.diagnostico_nombre || d.siglas || d.diagnostico_key;
            const notas = d.descripcion || "";
            const diente = d.diente;
            const superficie = d.superficie;
            const atributos = d.atributos_clinicos || {};

            const key: GrupoKey = [categoria, diagnosticoKey, notas, diente].join(
                "||",
            );

            if (!grupos.has(key)) {
                grupos.set(key, {
                    categoria,
                    diagnosticoNombre,
                    diagnosticoKey,
                    notas,
                    diente,
                    superficies: superficie ? [superficie] : [],
                    atributos,
                });
            } else {
                const grupo = grupos.get(key)!;
                if (superficie && !grupo.superficies.includes(superficie)) {
                    grupo.superficies.push(superficie);
                }
            }
        }

        // 3. Crear nuevos procedimientos autogenerados
        const nuevosAutoProcedimientos: Procedimiento[] = [];

        for (const grupo of grupos.values()) {
            const {
                categoria,
                diagnosticoNombre,
                notas,
                diente,
                superficies,
                atributos,
            } = grupo;

            // Texto de superficies
            const superficiesTexto =
                superficies.length > 0
                    ? ` en las superficies ${superficies.join(", ")}`
                    : "";

            // Texto de motivo / atributos clínicos
            let motivoTexto = "";
            if (atributos.motivo_extraccion) {
                motivoTexto = ` debido a ${atributos.motivo_extraccion.replace(
                    /_/g,
                    " ",
                )}`;
            } else if (atributos.severidad) {
                motivoTexto = ` de severidad ${atributos.severidad}`;
            }

            // Notas libres
            const notasTexto = notas ? ` Observaciones: ${notas}.` : "";

            // Construcción clínica
            const verboBase = categoria.toLowerCase().includes("patología")
                ? "Realizar tratamiento para"
                : "Realizar procedimiento por";

            const descripcion = `${verboBase} ${diagnosticoNombre} en diente ${diente}${superficiesTexto}${motivoTexto}.${notasTexto}`.trim();

            // Siglas para el campo "superficie"
            const superficiesSiglas = superficies
                .map((s) => SUPERFICIE_TO_SIGLA[s] || s)
                .join(",");

            // Generar un ID único basado en el contenido para evitar duplicados
            const uniqueId = `auto-${categoria}-${grupo.diagnosticoKey}-${diente}-${superficies.sort().join(',')}`;

            nuevosAutoProcedimientos.push({
                id: uniqueId,
                descripcion,
                diente,
                superficie: superficiesSiglas,
                autogenerado: true,
            });
        }

        // 4. Combinar manuales con nuevos autogenerados
        // Primero filtramos duplicados por ID
        const idsManuales = new Set(manuales.map(p => p.id || ""));
        const autoSinDuplicados = nuevosAutoProcedimientos.filter(p => 
            !idsManuales.has(p.id || "")
        );
        
        // También filtramos duplicados dentro de los autogenerados
        const idsAuto = new Set<string>();
        const autoUnicos = autoSinDuplicados.filter(p => {
            const id = p.id || "";
            if (idsAuto.has(id)) {
                return false;
            }
            idsAuto.add(id);
            return true;
        });
        
        const nuevosProcedimientos = [...manuales, ...autoUnicos];

        // 5. Solo actualizar si hay cambios reales
        const mismoContenido = 
            nuevosProcedimientos.length === procedimientos.length &&
            nuevosProcedimientos.every((p, i) => {
                const q = procedimientos[i];
                return (
                    p.id === q?.id &&
                    p.descripcion === q?.descripcion &&
                    p.diente === q?.diente &&
                    p.superficie === q?.superficie &&
                    !!p.autogenerado === !!q?.autogenerado
                );
            });

        if (!mismoContenido) {
            setProcedimientos(nuevosProcedimientos);
        }

    }, [autocompletar, selectedDiagnosticos, procedimientos, setProcedimientos]);
}