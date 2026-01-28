// src/types/odontogram/form033Types.ts
export interface Form033Odontograma {
  
  odontograma_permanente: {
    dientes: Array<Array<Form033Diente | null>>;
    movilidad: Array<Array<Form033Movilidad | null>>;
    recesion: Array<Array<Form033Recesion | null>>;
  };
  odontograma_temporal: {
    dientes: Array<Array<Form033Diente | null>>;
    movilidad: Array<Array<Form033Movilidad | null>>;
    recesion: Array<Array<Form033Recesion | null>>;
  };
  timestamp: string;
}

export interface Form033Diente {
  key: string;
  simbolo: string;
  color: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  prioridad: number;
  codigo_fdi: string;
  superficies_afectadas: string[];
  diagnostico_id?: string;
  fecha_diagnostico?: string;
}

export interface Form033Movilidad {
  grado: number;
  key: string;
  nombre: string;
  prioridad: number;
  diagnostico_id?: string;
  fecha_diagnostico?: string;
}

export interface Form033Recesion {
  nivel: number;
  key: string;
  nombre: string;
  prioridad: number;
  diagnostico_id?: string;
  fecha_diagnostico?: string;
}

export interface Form033Response {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    timestamp: string;
    form033: Form033Odontograma;
  };
  errors: unknown;
}