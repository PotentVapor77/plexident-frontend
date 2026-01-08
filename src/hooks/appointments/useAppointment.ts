// frontend/src/hooks/appointments/useAppointment.ts

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type {
  ICita,
  ICitaCreate,
  IHorarioDisponible,
  EstadoCita,
} from '../../types/appointments/IAppointment';
import appointmentService from '../../services/appointments/appointmentService';

// Helper function para extraer datos de diferentes estructuras de respuesta
const extractDataFromResponse = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    
    if (Array.isArray(obj.data)) {
      return obj.data as T[];
    }

    if (Array.isArray(obj.results)) {
      return obj.results as T[];
    }

    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (Array.isArray(data.results)) {
        return data.results as T[];
      }
    }

    if (Array.isArray(obj.horarios_disponibles)) {
      return obj.horarios_disponibles as T[];
    }

    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      return [obj.data as T];
    }
  }

  return [];
};

export const useAppointment = () => {
  const [citas, setCitas] = useState<ICita[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<IHorarioDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHorarios, setFetchingHorarios] = useState(false);

  const fetchCitas = async (params?: {
    search?: string;
    odontologo?: string;
    paciente?: string;
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    tipo_consulta?: string;
    activo?: boolean;
  }) => {
    try {
      setLoading(true);
      const response = await appointmentService.getAllCitas({
        activo: true,
        ...params
      });
      const citasArray = extractDataFromResponse<ICita>(response);
      setCitas(citasArray);
      return citasArray;
    } catch (error) {
      console.error('❌ useAppointment.fetchCitas - Error:', error);
      toast.error('Error al cargar las citas');
      setCitas([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCitasBySemana = async (fecha_inicio: string, odontologoId?: string) => {
    try {
      setLoading(true);
      const response = await appointmentService.getCitasBySemana(fecha_inicio, odontologoId);
      
      if (response && typeof response === 'object') {
        const obj = response as Record<string, unknown>;
        if (obj.success === false || (obj.status_code && obj.status_code !== 200)) {
          console.warn('⚠️ API devolvió estado no exitoso:', response);
          toast('No se pudieron cargar las citas para esta semana', {
            icon: '⚠️',
            duration: 4000,
          });
          setCitas([]);
          return [];
        }
      }

      const citasArray = extractDataFromResponse<ICita>(response);
      setCitas(citasArray);
      return citasArray;
    } catch (error) {
      console.error('❌ useAppointment.fetchCitasBySemana - Error:', error);
      toast.error('Error al cargar citas de la semana');
      setCitas([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCitasByOdontologo = async (odontologoId: string, fecha: string) => {
    try {
      setLoading(true);
      const response = await appointmentService.getCitasByOdontologo(odontologoId, fecha);
      const citasArray = extractDataFromResponse<ICita>(response);
      setCitas(citasArray);
      return citasArray;
    } catch (error) {
      console.error('❌ useAppointment.fetchCitasByOdontologo - Error:', error);
      toast.error('Error al cargar citas del odontólogo');
      setCitas([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCita = async (data: ICitaCreate) => {
    try {
      setLoading(true);
      const newCita = await appointmentService.createCita(data);
      toast.success('Cita creada exitosamente');
      return newCita;
    } catch (error: unknown) {
      console.error('❌ useAppointment.createCita - Error:', error);
      toast.error('Error al crear la cita');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCita = async (id: string, data: Partial<ICita>) => {
    try {
      setLoading(true);
      const updatedCita = await appointmentService.updateCita(id, data);
      toast.success('Cita actualizada exitosamente');
      return updatedCita;
    } catch (error) {
      console.error('❌ useAppointment.updateCita - Error:', error);
      toast.error('Error al actualizar la cita');
      throw error;
    } finally {
      setLoading(false);
    }
  };

const reprogramarCita = async (
  id: string,
  nueva_fecha: string,
  nueva_hora_inicio: string
) => {
  try {
    setLoading(true);
    console.log('🔄 reprogramarCita - ID:', id, 'Nueva fecha:', nueva_fecha, 'Nueva hora:', nueva_hora_inicio);
    
    const citaReprogramada = await appointmentService.reprogramarCita(
      id,
      nueva_fecha,
      nueva_hora_inicio
    );
    
    // ✅ Asegurar que el estado sea correcto
    if (citaReprogramada.estado !== 'REPROGRAMADA') {
      console.warn('Forzando estado REPROGRAMADA en frontend');
      citaReprogramada.estado = 'REPROGRAMADA';
      citaReprogramada.estado_display = 'Reprogramada';
    }
    
    // Actualizar la lista de citas
    setCitas(prevCitas => {
      // Remover la cita original (se desactiva en backend)
      const nuevasCitas = prevCitas.filter(c => c.id !== id);
      // Agregar la cita reprogramada
      return [...nuevasCitas, citaReprogramada];
    });
    
    toast.success('Cita reprogramada exitosamente');
    return citaReprogramada;
  } catch (error) {
    console.error('❌ useAppointment.reprogramarCita - Error:', error);
    toast.error('Error al reprogramar la cita');
    throw error;
  } finally {
    setLoading(false);
  }
};

  const deleteCita = async (id: string) => {
    try {
      setLoading(true);
      await appointmentService.deleteCita(id);
      setCitas(prevCitas => prevCitas.filter(cita => cita.id !== id));
      toast.success('Cita eliminada exitosamente');
    } catch (error) {
      console.error('❌ useAppointment.deleteCita - Error:', error);
      toast.error('Error al eliminar la cita');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelarCita = async (id: string, motivo: string) => {
    try {
      setLoading(true);
      const citaCancelada = await appointmentService.cancelCita(id, motivo);
      toast.success('Cita cancelada exitosamente');
      return citaCancelada;
    } catch (error) {
      console.error('❌ useAppointment.cancelarCita - Error:', error);
      toast.error('Error al cancelar la cita');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoCita = async (id: string, estado: EstadoCita) => {
    try {
      setLoading(true);
      console.log('🔄 cambiarEstadoCita - ID:', id, 'Estado:', estado);
      const citaActualizada = await appointmentService.cambiarEstadoCita(id, estado);
      toast.success('Estado de la cita actualizado');
      return citaActualizada;
    } catch (error) {
      console.error('❌ useAppointment.cambiarEstadoCita - Error:', error);
      toast.error('Error al cambiar el estado de la cita');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchHorariosDisponibles = useCallback(
    async (odontologo: string, fecha: string, duracion: number) => {
      if (!odontologo || !fecha || !duracion) {
        setHorariosDisponibles([]);
        return [];
      }

      try {
        setFetchingHorarios(true);
        console.log('🔍 fetchHorariosDisponibles - Parámetros:', { odontologo, fecha, duracion });
        
        const response = await appointmentService.getHorariosDisponibles(odontologo, fecha, duracion);
        console.log('📦 fetchHorariosDisponibles - Respuesta completa:', response);

        let horarios: IHorarioDisponible[] = [];

        if (response && typeof response === 'object') {
          const data = response as Record<string, unknown>;
          if (data.data && typeof data.data === 'object') {
            const innerData = data.data as Record<string, unknown>;
            if (Array.isArray(innerData.horarios_disponibles)) {
              horarios = innerData.horarios_disponibles as IHorarioDisponible[];
            }
          } else if (Array.isArray(data.horarios_disponibles)) {
            horarios = data.horarios_disponibles as IHorarioDisponible[];
          } else if (Array.isArray(data)) {
            horarios = data as IHorarioDisponible[];
          }
        }

        console.log('✅ fetchHorariosDisponibles - Horarios extraídos:', horarios);
        setHorariosDisponibles(horarios);
        return horarios;
      } catch (error) {
        console.error('❌ useAppointment.fetchHorariosDisponibles - Error:', error);
        toast.error('Error al cargar horarios disponibles');
        setHorariosDisponibles([]);
        return [];
      } finally {
        setFetchingHorarios(false);
      }
    },
    []
  );

  return {
    citas,
    horariosDisponibles,
    loading,
    fetchingHorarios,
    fetchCitas,
    fetchCitasBySemana,
    fetchCitasByOdontologo,
    createCita,
    updateCita,
    reprogramarCita,
    deleteCita,
    cancelarCita,
    cambiarEstadoCita,
    fetchHorariosDisponibles,
  };
};
