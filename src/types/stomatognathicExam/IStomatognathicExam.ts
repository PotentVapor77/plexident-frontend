// src/types/stomatognathicExam/IStomatognathicExam.ts

export interface IPacienteBasico {
  id: string;
  cedula_pasaporte: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  sexo: 'M' | 'F';
  edad: number;
  condicion_edad: string;
}

export interface IStomatognathicExam {
  id: string;
  paciente: IPacienteBasico | string;
  fecha_creacion: string;
  examen_sin_patologia: boolean;
  
  // ATM
  atm_cp: boolean;
  atm_sp: boolean;
  atm_absceso: boolean;
  atm_fibroma: boolean;
  atm_herpes: boolean;
  atm_ulcera: boolean;
  atm_otra_patologia: boolean;
  atm_observacion: string;
  
  // Mejillas
  mejillas_cp: boolean;
  mejillas_sp: boolean;
  mejillas_absceso: boolean;
  mejillas_fibroma: boolean;
  mejillas_herpes: boolean;
  mejillas_ulcera: boolean;
  mejillas_otra_patologia: boolean;
  mejillas_descripcion: string;
  
  // Maxilar Inferior
  maxilar_inferior_cp: boolean;
  maxilar_inferior_sp: boolean;
  maxilar_inferior_absceso: boolean;
  maxilar_inferior_fibroma: boolean;
  maxilar_inferior_herpes: boolean;
  maxilar_inferior_ulcera: boolean;
  maxilar_inferior_otra_patologia: boolean;
  maxilar_inferior_descripcion: string;
  
  // Maxilar Superior
  maxilar_superior_cp: boolean;
  maxilar_superior_sp: boolean;
  maxilar_superior_absceso: boolean;
  maxilar_superior_fibroma: boolean;
  maxilar_superior_herpes: boolean;
  maxilar_superior_ulcera: boolean;
  maxilar_superior_otra_patologia: boolean;
  maxilar_superior_descripcion: string;
  
  // Paladar
  paladar_cp: boolean;
  paladar_sp: boolean;
  paladar_absceso: boolean;
  paladar_fibroma: boolean;
  paladar_herpes: boolean;
  paladar_ulcera: boolean;
  paladar_otra_patologia: boolean;
  paladar_descripcion: string;
  
  // Piso de Boca
  piso_boca_cp: boolean;
  piso_boca_sp: boolean;
  piso_boca_absceso: boolean;
  piso_boca_fibroma: boolean;
  piso_boca_herpes: boolean;
  piso_boca_ulcera: boolean;
  piso_boca_otra_patologia: boolean;
  piso_boca_descripcion: string;
  
  // Carrillos
  carrillos_cp: boolean;
  carrillos_sp: boolean;
  carrillos_absceso: boolean;
  carrillos_fibroma: boolean;
  carrillos_herpes: boolean;
  carrillos_ulcera: boolean;
  carrillos_otra_patologia: boolean;
  carrillos_descripcion: string;
  
  // Glándulas Salivales
  glandulas_salivales_cp: boolean;
  glandulas_salivales_sp: boolean;
  glandulas_salivales_absceso: boolean;
  glandulas_salivales_fibroma: boolean;
  glandulas_salivales_herpes: boolean;
  glandulas_salivales_ulcera: boolean;
  glandulas_salivales_otra_patologia: boolean;
  glandulas_salivales_descripcion: string;
  
  // Ganglios
  ganglios_cp: boolean;
  ganglios_sp: boolean;
  ganglios_absceso: boolean;
  ganglios_fibroma: boolean;
  ganglios_herpes: boolean;
  ganglios_ulcera: boolean;
  ganglios_otra_patologia: boolean;
  ganglios_descripcion: string;
  
  // Lengua
  lengua_cp: boolean;
  lengua_sp: boolean;
  lengua_absceso: boolean;
  lengua_fibroma: boolean;
  lengua_herpes: boolean;
  lengua_ulcera: boolean;
  lengua_otra_patologia: boolean;
  lengua_descripcion: string;
  
  // Labios
  labios_cp: boolean;
  labios_sp: boolean;
  labios_absceso: boolean;
  labios_fibroma: boolean;
  labios_herpes: boolean;
  labios_ulcera: boolean;
  labios_otra_patologia: boolean;
  labios_descripcion: string;
  
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface IStomatognathicExamCreate {
  paciente: string;
  examen_sin_patologia: boolean;
  
  // ATM
  atm_cp: boolean;
  atm_sp: boolean;
  atm_absceso: boolean;
  atm_fibroma: boolean;
  atm_herpes: boolean;
  atm_ulcera: boolean;
  atm_otra_patologia: boolean;
  atm_observacion: string;
  
  // Mejillas
  mejillas_cp: boolean;
  mejillas_sp: boolean;
  mejillas_absceso: boolean;
  mejillas_fibroma: boolean;
  mejillas_herpes: boolean;
  mejillas_ulcera: boolean;
  mejillas_otra_patologia: boolean;
  mejillas_descripcion: string;
  
  // Maxilar Inferior
  maxilar_inferior_cp: boolean;
  maxilar_inferior_sp: boolean;
  maxilar_inferior_absceso: boolean;
  maxilar_inferior_fibroma: boolean;
  maxilar_inferior_herpes: boolean;
  maxilar_inferior_ulcera: boolean;
  maxilar_inferior_otra_patologia: boolean;
  maxilar_inferior_descripcion: string;
  
  // Maxilar Superior
  maxilar_superior_cp: boolean;
  maxilar_superior_sp: boolean;
  maxilar_superior_absceso: boolean;
  maxilar_superior_fibroma: boolean;
  maxilar_superior_herpes: boolean;
  maxilar_superior_ulcera: boolean;
  maxilar_superior_otra_patologia: boolean;
  maxilar_superior_descripcion: string;
  
  // Paladar
  paladar_cp: boolean;
  paladar_sp: boolean;
  paladar_absceso: boolean;
  paladar_fibroma: boolean;
  paladar_herpes: boolean;
  paladar_ulcera: boolean;
  paladar_otra_patologia: boolean;
  paladar_descripcion: string;
  
  // Piso de Boca
  piso_boca_cp: boolean;
  piso_boca_sp: boolean;
  piso_boca_absceso: boolean;
  piso_boca_fibroma: boolean;
  piso_boca_herpes: boolean;
  piso_boca_ulcera: boolean;
  piso_boca_otra_patologia: boolean;
  piso_boca_descripcion: string;
  
  // Carrillos
  carrillos_cp: boolean;
  carrillos_sp: boolean;
  carrillos_absceso: boolean;
  carrillos_fibroma: boolean;
  carrillos_herpes: boolean;
  carrillos_ulcera: boolean;
  carrillos_otra_patologia: boolean;
  carrillos_descripcion: string;
  
  // Glándulas Salivales
  glandulas_salivales_cp: boolean;
  glandulas_salivales_sp: boolean;
  glandulas_salivales_absceso: boolean;
  glandulas_salivales_fibroma: boolean;
  glandulas_salivales_herpes: boolean;
  glandulas_salivales_ulcera: boolean;
  glandulas_salivales_otra_patologia: boolean;
  glandulas_salivales_descripcion: string;
  
  // Ganglios
  ganglios_cp: boolean;
  ganglios_sp: boolean;
  ganglios_absceso: boolean;
  ganglios_fibroma: boolean;
  ganglios_herpes: boolean;
  ganglios_ulcera: boolean;
  ganglios_otra_patologia: boolean;
  ganglios_descripcion: string;
  
  // Lengua
  lengua_cp: boolean;
  lengua_sp: boolean;
  lengua_absceso: boolean;
  lengua_fibroma: boolean;
  lengua_herpes: boolean;
  lengua_ulcera: boolean;
  lengua_otra_patologia: boolean;
  lengua_descripcion: string;
  
  // Labios
  labios_cp: boolean;
  labios_sp: boolean;
  labios_absceso: boolean;
  labios_fibroma: boolean;
  labios_herpes: boolean;
  labios_ulcera: boolean;
  labios_otra_patologia: boolean;
  labios_descripcion: string;
}

export interface IStomatognathicExamUpdate extends Partial<IStomatognathicExamCreate> {
  activo?: boolean;
}
export interface IStomatognathicExamListResponse {
  success: boolean;
  message?: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: IStomatognathicExam[];
  };
}

export interface IStomatognathicExamSingleResponse {
  success: boolean;
  message?: string;
  data: IStomatognathicExam;
}