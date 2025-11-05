// types/ICita.ts - VERSIÓN CORREGIDA
import type { EventInput } from "@fullcalendar/core/index.js";

export type CitaEstado = 'programada' | 'confirmada' | 'realizada' | 'cancelada';

export interface ICita {
  id?: string;           // ✅ CORREGIDO: Hacer opcional y usar id
  id_cita?: string;      // Mantener compatibilidad
  paciente: string;
  odontologo: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  procedimiento: string;
  estado: CitaEstado;
  notas: string;
}

export interface ICreateCitaData {
  paciente: string;
  odontologo: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  procedimiento: string;
  estado: CitaEstado;
  notas: string;
}

export interface IUpdateCitaData {
  paciente?: string;
  odontologo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  motivo?: string;
  procedimiento?: string;
  estado?: CitaEstado;
  notas?: string;
}

export interface CalendarEvent extends EventInput {
  extendedProps: {
    citaData: ICita;
    pacienteNombre: string;
    odontologoNombre: string;
    horaFormateada: string;
  };
}