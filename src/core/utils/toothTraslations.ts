export const toothTranslations: Record<string, { nombre: string; numero: number }> = {
    // Dientes superiores derechos (1x)
    "Incisor_upper_right-1": { nombre: "Incisivo central superior derecho", numero: 11 },
    "Incisor_upper_right-2": { nombre: "Incisivo lateral superior derecho", numero: 12 },
    "Canine_upper_right": { nombre: "Canino superior derecho", numero: 13 },
    "Premolar_upper_right-1": { nombre: "Primer premolar superior derecho", numero: 14 },
    "Premolar_upper_right-2": { nombre: "Segundo premolar superior derecho", numero: 15 },
    "Molar_upper_right-1": { nombre: "Primer molar superior derecho", numero: 16 },
    "Molar_upper_right-2": { nombre: "Segundo molar superior derecho", numero: 17 },
    "Molar_upper_right-3": { nombre: "Tercer molar superior derecho", numero: 18 },
  
    // Dientes superiores izquierdos (2x)
    "Incisor_upper_left-1": { nombre: "Incisivo central superior izquierdo", numero: 21 },
    "Incisor_upper_left-2": { nombre: "Incisivo lateral superior izquierdo", numero: 22 },
    "Canine_upper_left": { nombre: "Canino superior izquierdo", numero: 23 },
    "Premolar_upper_left-1": { nombre: "Primer premolar superior izquierdo", numero: 24 },
    "Premolar_upper_left-2": { nombre: "Segundo premolar superior izquierdo", numero: 25 },
    "Molar_upper_left-1": { nombre: "Primer molar superior izquierdo", numero: 26 },
    "Molar_upper_left-2": { nombre: "Segundo molar superior izquierdo", numero: 27 },
    "Molar_upper_left-3": { nombre: "Tercer molar superior izquierdo", numero: 28 },
  
    // Dientes inferiores izquierdos (3x)
    "Incisor_lower_left-1": { nombre: "Incisivo central inferior izquierdo", numero: 31 },
    "Incisor_lower_left-2": { nombre: "Incisivo lateral inferior izquierdo", numero: 32 },
    "Canine_lower_left": { nombre: "Canino inferior izquierdo", numero: 33 },
    "Premolar_lower_left-1": { nombre: "Primer premolar inferior izquierdo", numero: 34 },
    "Premolar_lower_left-2": { nombre: "Segundo premolar inferior izquierdo", numero: 35 },
    "Molar_lower_left-1": { nombre: "Primer molar inferior izquierdo", numero: 36 },
    "Molar_lower_left-2": { nombre: "Segundo molar inferior izquierdo", numero: 37 },
    "Molar_lower_left-3": { nombre: "Tercer molar inferior izquierdo", numero: 38 },
  
    // Dientes inferiores derechos (4x)
    "Incisor_lower_right-1": { nombre: "Incisivo central inferior derecho", numero: 41 },
    "Incisor_lower_right-2": { nombre: "Incisivo lateral inferior derecho", numero: 42 },
    "Canine_lower_right": { nombre: "Canino inferior derecho", numero: 43 },
    "Premolar_lower_right-1": { nombre: "Primer premolar inferior derecho", numero: 44 },
    "Premolar_lower_right-2": { nombre: "Segundo premolar inferior derecho", numero: 45 },
    "Molar_lower_right-1": { nombre: "Primer molar inferior derecho", numero: 46 },
    "Molar_lower_right-2": { nombre: "Segundo molar inferior derecho", numero: 47 },
    "Molar_lower_right-3": { nombre: "Tercer molar inferior derecho", numero: 48 },
  
    // Terceros molares (muelas del juicio) - alternativas de nomenclatura
    "Wisdom_upper_right": { nombre: "Muela del juicio superior derecha", numero: 18 },
    "Wisdom_upper_left": { nombre: "Muela del juicio superior izquierda", numero: 28 },
    "Wisdom_lower_right": { nombre: "Muela del juicio inferior derecha", numero: 48 },
    "Wisdom_lower_left": { nombre: "Muela del juicio inferior izquierda", numero: 38 }
  };
  
  // Función auxiliar para obtener la traducción de un diente
  export const getToothTranslation = (toothName: string): { nombre: string; numero: number } => {
    return toothTranslations[toothName] || { nombre: toothName, numero: 0 };
  };
  
  // Función para obtener el número de diente por nombre
  export const getToothNumber = (toothName: string): number => {
    return toothTranslations[toothName]?.numero || 0;
  };
  
  // Función para obtener el nombre en español por nombre en inglés
  export const getToothSpanishName = (toothName: string): string => {
    return toothTranslations[toothName]?.nombre || toothName;
  };