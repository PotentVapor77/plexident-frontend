// src/types/personalBackground/IPersonalBackground.ts

// ============================================================================
// TIPOS ENUMERADOS - Antecedentes Personales (Sincronizado con Backend)
// ============================================================================

// ✅ ALERGIAS - Sin desconocido, con OTRO
export const ALERGIA_ANTIBIOTICO_CHOICES = [
  ['NO', 'No'],
  ['PENICILINA', 'Penicilina'],
  ['SULFA', 'Sulfa'],
  ['OTRO', 'Otro'],
] as const;
export type AlergiaAntibiotico = typeof ALERGIA_ANTIBIOTICO_CHOICES[number][0];

export const ALERGIA_ANESTESIA_CHOICES = [
  ['NO', 'No'],
  ['LOCAL', 'Anestesia local'],
  ['GENERAL', 'Anestesia general'],
  ['AMBAS', 'Ambas'],
  ['OTRO', 'Otro'],
] as const;
export type AlergiaAnestesia = typeof ALERGIA_ANESTESIA_CHOICES[number][0];

// ✅ HEMORRAGIAS - Solo SI/NO
export const HEMORRAGIAS_CHOICES = [
  ['NO', 'No'],
  ['SI', 'Sí'],
] as const;
export type Hemorragias = typeof HEMORRAGIAS_CHOICES[number][0];

// ✅ VIH/SIDA - Con desconocido (no se ha hecho prueba)
export const VIH_SIDA_CHOICES = [
  ['NEGATIVO', 'Negativo'],
  ['POSITIVO', 'Positivo'],
  ['DESCONOCIDO', 'No se ha realizado prueba'],
] as const;
export type VIHSida = typeof VIH_SIDA_CHOICES[number][0];

// ✅ TUBERCULOSIS - Con desconocido (puede no recordar)
export const TUBERCULOSIS_CHOICES = [
  ['NUNCA', 'Nunca'],
  ['TRATADA', 'Tratada anteriormente'],
  ['ACTIVA', 'Activa'],
  ['DESCONOCIDO', 'No está seguro'],
] as const;
export type Tuberculosis = typeof TUBERCULOSIS_CHOICES[number][0];

// ✅ ASMA - Sin desconocido
export const ASMA_CHOICES = [
  ['NO', 'No'],
  ['LEVE', 'Leve'],
  ['MODERADA', 'Moderada'],
  ['SEVERA', 'Severa'],
] as const;
export type Asma = typeof ASMA_CHOICES[number][0];

// ✅ DIABETES - Sin desconocido
export const DIABETES_CHOICES = [
  ['NO', 'No'],
  ['PREDIABETICO', 'Prediabético'],
  ['TIPO_1', 'Tipo 1'],
  ['TIPO_2', 'Tipo 2'],
  ['GESTACIONAL', 'Gestacional'],
  ['OTRO', 'Otro (especificar)'],
] as const;
export type Diabetes = typeof DIABETES_CHOICES[number][0];

// ✅ HIPERTENSIÓN - Sin desconocido
export const HIPERTENSION_CHOICES = [
  ['NO', 'No'],
  ['CONTROLADA', 'Controlada'],
  ['NO_CONTROLADA', 'No controlada'],
  ['SIN_TRATAMIENTO', 'Sin tratamiento'],
] as const;
export type Hipertension = typeof HIPERTENSION_CHOICES[number][0];

// ✅ ENFERMEDAD CARDÍACA - Sin desconocido, con OTRA
export const ENFERMEDAD_CARDIACA_CHOICES = [
  ['NO', 'No'],
  ['ARRITMIA', 'Arritmia'],
  ['INSUFICIENCIA', 'Insuficiencia cardíaca'],
  ['CONGENITA', 'Congénita'],
  ['OTRA', 'Otra'],
] as const;
export type EnfermedadCardiaca = typeof ENFERMEDAD_CARDIACA_CHOICES[number][0];

// ============================================================================
// MODELO PRINCIPAL - Antecedentes Personales
// ============================================================================

export interface IPacienteBasico {
  id: string;
  nombres: string;
  apellidos: string;
  cedula_pasaporte: string;
}

export interface IPersonalBackground {
  id: string;
  paciente: string | IPacienteBasico;
  alergia_antibiotico: AlergiaAntibiotico;
  alergia_antibiotico_otro?: string; // ✅ NUEVO
  alergia_anestesia: AlergiaAnestesia;
  alergia_anestesia_otro?: string; // ✅ NUEVO
  hemorragias: Hemorragias;
  vih_sida: VIHSida;
  tuberculosis: Tuberculosis;
  asma: Asma;
  diabetes: Diabetes;
  diabetes_otro?: string; // ✅ NUEVO
  hipertension_arterial: Hipertension;
  enfermedad_cardiaca: EnfermedadCardiaca;
  enfermedad_cardiaca_otro?: string; // ✅ NUEVO
  // ❌ ELIMINADO: otros_antecedentes_personales
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
  creado_por?: string;
  actualizado_por?: string;
}

// ============================================================================
// DATOS PARA CREAR ANTECEDENTES PERSONALES
// ============================================================================

export interface IPersonalBackgroundCreate {
  paciente: string;
  alergia_antibiotico?: AlergiaAntibiotico;
  alergia_antibiotico_otro?: string; // ✅ NUEVO
  alergia_anestesia?: AlergiaAnestesia;
  alergia_anestesia_otro?: string; // ✅ NUEVO
  hemorragias?: Hemorragias;
  vih_sida?: VIHSida;
  tuberculosis?: Tuberculosis;
  asma?: Asma;
  diabetes?: Diabetes;
  diabetes_otro?: string; // ✅ NUEVO
  hipertension_arterial?: Hipertension;
  enfermedad_cardiaca?: EnfermedadCardiaca;
  enfermedad_cardiaca_otro?: string; // ✅ NUEVO
  // ❌ ELIMINADO: otros_antecedentes_personales
}

// ============================================================================
// DATOS PARA ACTUALIZAR ANTECEDENTES PERSONALES
// ============================================================================

export interface IPersonalBackgroundUpdate {
  alergia_antibiotico?: AlergiaAntibiotico;
  alergia_antibiotico_otro?: string; // ✅ NUEVO
  alergia_anestesia?: AlergiaAnestesia;
  alergia_anestesia_otro?: string; // ✅ NUEVO
  hemorragias?: Hemorragias;
  vih_sida?: VIHSida;
  tuberculosis?: Tuberculosis;
  asma?: Asma;
  diabetes?: Diabetes;
  diabetes_otro?: string; // ✅ NUEVO
  hipertension_arterial?: Hipertension;
  enfermedad_cardiaca?: EnfermedadCardiaca;
  enfermedad_cardiaca_otro?: string; // ✅ NUEVO
  activo?: boolean;
  // ❌ ELIMINADO: otros_antecedentes_personales
}

// ============================================================================
// RESPUESTAS DE LA API
// ============================================================================

export interface IPersonalBackgroundListResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: IPersonalBackground[];
  };
  errors: null;
}

export interface IPersonalBackgroundSingleResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: IPersonalBackground;
  errors: null;
}

// ============================================================================
// ERROR TIPADO
// ============================================================================

export interface IPersonalBackgroundError {
  success: false;
  error_type: string;
  message: string;
  errors?: Record<string, string>;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

export const validatePersonalBackground = (data: unknown): IPersonalBackground => {
  const background = data as IPersonalBackground;
  
  if (!background.id || !background.paciente) {
    throw new Error('Datos de antecedentes personales inválidos');
  }
  
  return background;
};

// ============================================================================
// PARÁMETROS PARA HOOKS
// ============================================================================

export interface UsePersonalBackgroundsParams {
  page?: number;
  page_size?: number;
  search?: string;
  paciente?: string;
  [key: string]: unknown;
}

export interface UsePersonalBackgroundsReturn {
  backgrounds: IPersonalBackground[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
  removeBackground: (id: string) => Promise<void>;
  isDeleting: boolean;
}

// ============================================================================
// HELPERS DE ETIQUETAS
// ============================================================================

export const getAlergiaAntibioticoLabel = (tipo: AlergiaAntibiotico): string => {
  const found = ALERGIA_ANTIBIOTICO_CHOICES.find(([value]) => value === tipo);
  return found ? found[1] : tipo;
};

export const getAlergiaAnestesiaLabel = (tipo: AlergiaAnestesia): string => {
  const found = ALERGIA_ANESTESIA_CHOICES.find(([value]) => value === tipo);
  return found ? found[1] : tipo;
};

export const getHemorragiasLabel = (valor: Hemorragias): string => {
  const found = HEMORRAGIAS_CHOICES.find(([value]) => value === valor);
  return found ? found[1] : valor;
};

export const getVIHSidaLabel = (valor: VIHSida): string => {
  const found = VIH_SIDA_CHOICES.find(([value]) => value === valor);
  return found ? found[1] : valor;
};

export const getTuberculosisLabel = (valor: Tuberculosis): string => {
  const found = TUBERCULOSIS_CHOICES.find(([value]) => value === valor);
  return found ? found[1] : valor;
};

export const getAsmaLabel = (valor: Asma): string => {
  const found = ASMA_CHOICES.find(([value]) => value === valor);
  return found ? found[1] : valor;
};

export const getDiabetesLabel = (valor: Diabetes): string => {
  const found = DIABETES_CHOICES.find(([value]) => value === valor);
  return found ? found[1] : valor;
};

export const getHipertensionLabel = (valor: Hipertension): string => {
  const found = HIPERTENSION_CHOICES.find(([value]) => value === valor);
  return found ? found[1] : valor;
};

export const getEnfermedadCardiacaLabel = (valor: EnfermedadCardiaca): string => {
  const found = ENFERMEDAD_CARDIACA_CHOICES.find(([value]) => value === valor);
  return found ? found[1] : valor;
};

// ============================================================================
// VALORES POR DEFECTO
// ============================================================================

export const DEFAULT_PERSONAL_BACKGROUND: Partial<IPersonalBackgroundCreate> = {
  alergia_antibiotico: 'NO',
  alergia_anestesia: 'NO',
  hemorragias: 'NO',
  vih_sida: 'NEGATIVO',
  tuberculosis: 'NUNCA',
  asma: 'NO',
  diabetes: 'NO',
  hipertension_arterial: 'NO',
  enfermedad_cardiaca: 'NO',
  // ❌ ELIMINADO: otros_antecedentes_personales
};

// ============================================================================
// HELPER: Lista de antecedentes activos
// ============================================================================

export const getListaAntecedentes = (background: IPersonalBackground): string[] => {
  const antecedentes: string[] = [];

  // Alergias - solo si !== 'NO'
  if (background.alergia_antibiotico !== 'NO') {
    const label = background.alergia_antibiotico === 'OTRO' && background.alergia_antibiotico_otro
      ? `Alergia antibiótico: ${background.alergia_antibiotico_otro}` // ✅ USAR CAMPO OTRO
      : `Alergia antibiótico: ${getAlergiaAntibioticoLabel(background.alergia_antibiotico)}`;
    antecedentes.push(label);
  }

  if (background.alergia_anestesia !== 'NO') {
    const label = background.alergia_anestesia === 'OTRO' && background.alergia_anestesia_otro
      ? `Alergia anestesia: ${background.alergia_anestesia_otro}` // ✅ USAR CAMPO OTRO
      : `Alergia anestesia: ${getAlergiaAnestesiaLabel(background.alergia_anestesia)}`;
    antecedentes.push(label);
  }

  // Hemorragias - solo SI
  if (background.hemorragias === 'SI') {
    antecedentes.push('Hemorragias');
  }

  // VIH/SIDA - solo POSITIVO
  if (background.vih_sida === 'POSITIVO') {
    antecedentes.push('VIH/SIDA: Positivo');
  }

  // Tuberculosis - ACTIVA o TRATADA
  if (background.tuberculosis === 'ACTIVA' || background.tuberculosis === 'TRATADA') {
    antecedentes.push(`Tuberculosis: ${getTuberculosisLabel(background.tuberculosis)}`);
  }

  // Asma - solo si !== 'NO'
  if (background.asma !== 'NO') {
    antecedentes.push(`Asma: ${getAsmaLabel(background.asma)}`);
  }

  // Diabetes - solo si !== 'NO'
  if (background.diabetes !== 'NO') {
    const label = background.diabetes_otro
      ? `Diabetes: ${background.diabetes_otro}` // ✅ USAR CAMPO OTRO
      : `Diabetes: ${getDiabetesLabel(background.diabetes)}`;
    antecedentes.push(label);
  }

  // Hipertensión - solo si !== 'NO'
  if (background.hipertension_arterial !== 'NO') {
    antecedentes.push(`Hipertensión: ${getHipertensionLabel(background.hipertension_arterial)}`);
  }

  // Enfermedad cardíaca - solo si !== 'NO'
  if (background.enfermedad_cardiaca !== 'NO') {
    const label = background.enfermedad_cardiaca === 'OTRA' && background.enfermedad_cardiaca_otro
      ? `Enfermedad cardíaca: ${background.enfermedad_cardiaca_otro}` // ✅ USAR CAMPO OTRO
      : `Enfermedad cardíaca: ${getEnfermedadCardiacaLabel(background.enfermedad_cardiaca)}`;
    antecedentes.push(label);
  }

  // ❌ ELIMINADO: bloque de otros_antecedentes_personales

  return antecedentes;
};

// ============================================================================
// HELPER: Verificar si tiene antecedentes críticos
// ============================================================================

export const tieneAntecedentesCriticos = (background: IPersonalBackground): boolean => {
  return (
    background.hemorragias === 'SI' ||
    background.vih_sida === 'POSITIVO' ||
    background.tuberculosis === 'ACTIVA' ||
    background.asma === 'SEVERA' ||
    background.diabetes === 'TIPO_1' ||
    background.diabetes === 'TIPO_2' ||
    background.hipertension_arterial === 'NO_CONTROLADA' ||
    background.hipertension_arterial === 'SIN_TRATAMIENTO' ||
    background.enfermedad_cardiaca !== 'NO'
  );
};

// ============================================================================
// HELPER: Contar antecedentes activos
// ============================================================================

export const contarAntecedentesActivos = (background: IPersonalBackground): number => {
  return getListaAntecedentes(background).length;
};

// ============================================================================
// HELPER: Obtener nivel de riesgo
// ============================================================================

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export const getNivelRiesgo = (background: IPersonalBackground): NivelRiesgo => {
  // Riesgo crítico
  if (
    background.hemorragias === 'SI' ||
    background.vih_sida === 'POSITIVO' ||
    background.tuberculosis === 'ACTIVA' ||
    background.hipertension_arterial === 'NO_CONTROLADA'
  ) {
    return 'CRITICO';
  }

  // Riesgo alto
  if (
    background.asma === 'SEVERA' ||
    background.diabetes === 'TIPO_1' ||
    background.enfermedad_cardiaca === 'INSUFICIENCIA' ||
    background.enfermedad_cardiaca === 'ARRITMIA' ||
    background.hipertension_arterial === 'SIN_TRATAMIENTO'
  ) {
    return 'ALTO';
  }

  // Riesgo medio
  if (
    background.asma !== 'NO' ||
    background.diabetes !== 'NO' ||
    background.hipertension_arterial === 'CONTROLADA' ||
    background.enfermedad_cardiaca !== 'NO' ||
    background.tuberculosis === 'TRATADA' ||
    background.alergia_antibiotico !== 'NO' ||
    background.alergia_anestesia !== 'NO'
  ) {
    return 'MEDIO';
  }

  // Riesgo bajo
  return 'BAJO';
};

// ============================================================================
// HELPER: Texto descriptivo del nivel de riesgo
// ============================================================================

export const getNivelRiesgoLabel = (nivel: NivelRiesgo): string => {
  const labels: Record<NivelRiesgo, string> = {
    BAJO: 'Bajo',
    MEDIO: 'Medio',
    ALTO: 'Alto',
    CRITICO: 'Crítico',
  };
  return labels[nivel];
};

// ============================================================================
// HELPER: Color asociado al nivel de riesgo
// ============================================================================

export const getNivelRiesgoColor = (nivel: NivelRiesgo): string => {
  const colors: Record<NivelRiesgo, string> = {
    BAJO: '#10b981', // green-500
    MEDIO: '#f59e0b', // amber-500
    ALTO: '#f97316', // orange-500
    CRITICO: '#ef4444', // red-500
  };
  return colors[nivel];
};

// Después de getNivelRiesgoColor(), AGREGAR:

// ============================================================================
// ALIAS DE COMPATIBILIDAD (para archivos existentes)
// ============================================================================

export const getAlergiaTipoLabel = (tipo: string): string => {
  const antibioticoFound = ALERGIA_ANTIBIOTICO_CHOICES.find(([value]) => value === tipo);
  if (antibioticoFound) return antibioticoFound[1];

  const anestesiaFound = ALERGIA_ANESTESIA_CHOICES.find(([value]) => value === tipo);
  if (anestesiaFound) return anestesiaFound[1];

  return tipo;
};
