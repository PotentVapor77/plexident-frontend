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
 */
export function useAutoProcedimientosFromDiagnosticos({
    autocompletar,
    selectedDiagnosticos,
    procedimientos,
    setProcedimientos,
}: UseAutoProcedimientosParams) {
    useEffect(() => {
        if (!autocompletar) return;

        const manuales = procedimientos.filter((p) => !p.autogenerado);

        if (selectedDiagnosticos.length === 0) {
            const soloManuales = manuales;
            const mismoEstado =
                soloManuales.length === procedimientos.length &&
                soloManuales.every((p, i) => p === procedimientos[i]);

            if (!mismoEstado) {
                setProcedimientos(soloManuales);
            }
            return;
        }

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

        const autoProcedimientos: Procedimiento[] = [];

        for (const grupo of grupos.values()) {
            const {
                categoria,
                diagnosticoNombre,
                notas,
                diente,
                superficies,
                atributos,
            } = grupo;

            // 1) Texto de superficies (nombres completos para la descripción)
            const superficiesTexto =
                superficies.length > 0
                    ? ` en las superficies ${superficies.join(", ")}`
                    : "";

            // 2) Texto de motivo / atributos clínicos relevantes (ejemplo simple)
            let motivoTexto = "";
            if (atributos.motivo_extraccion) {
                motivoTexto = ` debido a ${atributos.motivo_extraccion.replace(
                    /_/g,
                    " ",
                )}`;
            } else if (atributos.severidad) {
                motivoTexto = ` de severidad ${atributos.severidad}`;
            }

            // 3) Notas libres
            const notasTexto = notas ? ` Observaciones: ${notas}.` : "";

            // 4) Construcción más clínica
            // Puedes ajustar verbos por categoría si quieres aún más detalle
            const verboBase = categoria.toLowerCase().includes("patología")
                ? "Realizar tratamiento para"
                : "Realizar procedimiento por";

            const descripcion = `${verboBase} ${diagnosticoNombre} en diente ${diente}${superficiesTexto}${motivoTexto}.${notasTexto}`.trim();

            // 5) Siglas solo para el campo "superficie"
            const superficiesSiglas = superficies
                .map((s) => SUPERFICIE_TO_SIGLA[s] || s)
                .join(",");

            autoProcedimientos.push({
                descripcion,
                diente,
                superficie: superficiesSiglas,
                autogenerado: true,
            });
        }

        const nuevosProcedimientos = [...manuales, ...autoProcedimientos];

        const mismaLongitud =
            nuevosProcedimientos.length === procedimientos.length;
        const mismoContenido =
            mismaLongitud &&
            nuevosProcedimientos.every((p, i) => {
                const q = procedimientos[i];
                return (
                    p.descripcion === q?.descripcion &&
                    p.diente === q?.diente &&
                    p.superficie === q?.superficie &&
                    !!p.autogenerado === !!q?.autogenerado
                );
            });

        if (!mismoContenido) {
            setProcedimientos(nuevosProcedimientos);
        }
    }, [autocompletar, selectedDiagnosticos]);
}
