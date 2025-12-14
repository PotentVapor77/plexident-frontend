// src/config/atributos_clinicos.ts
export type OpcionAtributoClinico = {
    key: string;
    nombre: string;
  };
  
  // ---------------------------------------------
  // 1. Restauración
  // ---------------------------------------------
  export const ESTADO_RESTAURACION: OpcionAtributoClinico[] = [
    { key: 'excelente', nombre: 'Excelente' },
    { key: 'buena', nombre: 'Buena' },
    { key: 'defectuosa', nombre: 'Defectuosa' },
    { key: 'con_filtracion', nombre: 'Con Filtración' },
  ];
  
  export const MATERIAL_RESTAURACION: OpcionAtributoClinico[] = [
    { key: 'amalgama', nombre: 'Amalgama' },
    { key: 'resina', nombre: 'Resina' },
    { key: 'ionomero', nombre: 'Ionómero' },
    { key: 'porcelana', nombre: 'Porcelana' },
    { key: 'oro', nombre: 'Oro' },
    { key: 'cera', nombre: 'Cera' },
    { key: 'otro', nombre: 'Otro' },
  ];
  
  // ---------------------------------------------
  // 2. Procedimiento
  // ---------------------------------------------
  export const ESTADO_PROCEDIMIENTO: OpcionAtributoClinico[] = [
    { key: 'planificado', nombre: 'Planificado' },
    { key: 'en_proceso', nombre: 'En Proceso' },
    { key: 'finalizado', nombre: 'Finalizado' },
  ];
  
  // ---------------------------------------------
  // 3. Erupción
  // ---------------------------------------------
  export const ERUPCION: OpcionAtributoClinico[] = [
    { key: 'erupcionado', nombre: 'Erupcionado' },
    { key: 'no_erupcionado', nombre: 'No Erupcionado' },
    { key: 'semi_erupcionado', nombre: 'Semi-erupcionado' },
    { key: 'deciduo', nombre: 'Deciduo' },
  ];
  
  // ---------------------------------------------
  // 4. Periodontal
  // ---------------------------------------------
  export const ESTADO_PERIODONTAL: OpcionAtributoClinico[] = [
    { key: 'normal', nombre: 'Normal' },
    { key: 'gingivitis', nombre: 'Gingivitis' },
    { key: 'periodontitis', nombre: 'Periodontitis' },
    { key: 'recesion', nombre: 'Recesión' },
    { key: 'movilidad', nombre: 'Movilidad' },
    { key: 'furcacion', nombre: 'Furcación' },
    { key: 'perdida', nombre: 'Pérdida' },
    { key: 'otro', nombre: 'Otro' },
  ];
  
  // ---------------------------------------------
  // 5. Sensibilidad / Dolor
  // ---------------------------------------------
  export const SENSIBILIDAD: OpcionAtributoClinico[] = [
    { key: 'ninguna', nombre: 'Ninguna' },
    { key: 'frio', nombre: 'Frío' },
    { key: 'calor', nombre: 'Calor' },
    { key: 'dulce', nombre: 'Dulce' },
    { key: 'salado', nombre: 'Salado' },
    { key: 'tacto', nombre: 'Tacto' },
    { key: 'otro', nombre: 'Otro' },
  ];
  
  export const DOLOR: OpcionAtributoClinico[] = [
    { key: 'ninguno', nombre: 'Ninguno' },
    { key: 'leve', nombre: 'Leve' },
    { key: 'moderado', nombre: 'Moderado' },
    { key: 'severo', nombre: 'Severo' },
    { key: 'punzante', nombre: 'Punzante' },
    { key: 'sordo', nombre: 'Sordo' },
    { key: 'intermitente', nombre: 'Intermitente' },
    { key: 'constante', nombre: 'Constante' },
    { key: 'otro', nombre: 'Otro' },
  ];
  
  // ---------------------------------------------
  // 6. Movilidad / Inflamación
  // ---------------------------------------------
  export const MOVILIDAD: OpcionAtributoClinico[] = [
    { key: 'grado_0', nombre: 'Grado 0' },
    { key: 'grado_1', nombre: 'Grado 1' },
    { key: 'grado_2', nombre: 'Grado 2' },
    { key: 'grado_3', nombre: 'Grado 3' },
    { key: 'otro', nombre: 'Otro' },
  ];
  
  export const INFLAMACION: OpcionAtributoClinico[] = [
    { key: 'ninguna', nombre: 'Ninguna' },
    { key: 'leve', nombre: 'Leve' },
    { key: 'moderada', nombre: 'Moderada' },
    { key: 'severa', nombre: 'Severa' },
    { key: 'otro', nombre: 'Otro' },
  ]; 