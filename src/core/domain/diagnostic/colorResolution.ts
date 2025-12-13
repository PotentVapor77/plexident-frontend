import { type OdontoColorKey, ODONTO_COLORS, type MaterialColorKey, MATERIAL_COLORS, type DiagnosticoEntry } from "../../types/typeOdontograma";


/**
 * Obtiene el color hexadecimal basado en la clave de color y opciones secundarias
 */
export const getColorFromEntry = (
    colorKey: OdontoColorKey,
    secondaryOptions: Record<string, any>
): string => {
    const baseColorData = ODONTO_COLORS[colorKey];

    if (colorKey === 'REALIZADO' && secondaryOptions.material_restauracion) {
        const materialKeyLower = secondaryOptions.material_restauracion;
        const materialKey = (materialKeyLower.charAt(0).toUpperCase() + materialKeyLower.slice(1)) as MaterialColorKey;

        if (MATERIAL_COLORS[materialKey]) {
            return MATERIAL_COLORS[materialKey].fill;
        }
    }

    return baseColorData.fill;
};

/**
 * Obtiene el color permanente para una superficie específica
 * Selecciona el diagnóstico con mayor prioridad (menor número)
 */
export const getPermanentColorForSurface = (
    diagnosticos: DiagnosticoEntry[]
): string | null => {
    if (diagnosticos.length === 0) return null;

    let highestPriority = Infinity;
    let permanentColor: string | null = null;

    for (const entry of diagnosticos) {
        if (entry.priority < highestPriority) {
            highestPriority = entry.priority;
            permanentColor = entry.colorHex;
        }
    }

    return permanentColor;
};

/**
 * Obtiene el color dominante para un diente completo
 * Basado en el diagnóstico de mayor prioridad
 */
export const getDominantColorForTooth = (
    diagnoses: DiagnosticoEntry[]
): string | null => {
    if (diagnoses.length === 0) return null;

    let highestPriority = Infinity;
    let dominantColor: string | null = null;

    for (const entry of diagnoses) {
        if (entry.priority < highestPriority) {
            highestPriority = entry.priority;
            dominantColor = entry.colorHex;
        }
    }

    return dominantColor;
};