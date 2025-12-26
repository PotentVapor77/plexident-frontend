import { 
    type OdontoColorKey, 
    ODONTO_COLORS, 
    type DiagnosticoEntry 
} from "../../types/typeOdontograma";

/**
 * Obtiene el color hexadecimal basado en la clave de color y opciones secundarias
 */
export const getColorFromEntry = (colorKey: string, secondaryOptions: any): string => {
    // 1. Si ya es un Hexadecimal (comienza con #), lo devolvemos directamente
    if (colorKey.startsWith('#')) return colorKey;

    // 2. Buscamos la configuración en el diccionario
    const config = ODONTO_COLORS[colorKey as OdontoColorKey];
    
    // 3. Si no existe la clave, devolvemos un gris neutro
    if (!config) return '#808080';

    // 4. Verificación de variaciones (usando casting temporal para evitar el error de TS 
    // si aún no has actualizado la interfaz en typeOdontograma.ts)
    const configWithVariations = config as any;
    if (secondaryOptions?.material === 'AMALGAMA' && configWithVariations.variations?.AMALGAMA) {
        return configWithVariations.variations.AMALGAMA;
    }

    // 5. IMPORTANTE: Usamos .fill que es la propiedad que existe en tu objeto según el error
    return config.fill;
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

/**
 * Obtiene la prioridad de forma segura manejando claves o colores hex directos
 */
export const getPriorityFromKey = (colorKey: string): number => {
    if (colorKey.startsWith('#')) {
        // Prioridad por defecto para colores directos
        return 5; 
    }
    
    const config = ODONTO_COLORS[colorKey as OdontoColorKey];
    return config ? config.priority : 5;
};