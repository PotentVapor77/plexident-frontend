// hooks/useCitas.ts - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback } from 'react';
import type { ICita, ICreateCitaData, IUpdateCitaData } from '../types/ICita';
import type { IUser } from '../types/IUser';
import { getAllUsers } from '../services/userService';
import type { IPatient } from '../types/IPatient';
import { getAllPatients } from '../services/patientService';
import { getAllCitas, createCita, updateCita, deleteCita } from '../services/citaService';

export interface CitaFormData {
  paciente: string;
  odontologo: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  procedimiento: string;
  estado: 'programada' | 'confirmada' | 'realizada' | 'cancelada';
  notas: string;
}

interface Odontologo {
  id: string;
  nombre: string;
}

interface PacienteOption {
  id: string;
  nombre: string;
  cedula: string;
}

export function useCitas() {
  const [citas, setCitas] = useState<ICita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCita, setSelectedCita] = useState<ICita | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
  const [pacientes, setPacientes] = useState<PacienteOption[]>([]);

  const [citaForm, setCitaForm] = useState<CitaFormData>({
    paciente: '',
    odontologo: '',
    fecha_inicio: '',
    fecha_fin: '',
    motivo: '',
    procedimiento: '',
    estado: 'programada',
    notas: ''
  });

  // Función para formatear fecha para input
  const formatDateForInput = useCallback((dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timezoneOffset);
    return adjustedDate.toISOString().slice(0, 16);
  }, []);

  // Cargar todos los datos iniciales
  const fetchInitialData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [citasData, usersData, patientsData] = await Promise.all([
        getAllCitas().catch(err => { throw new Error(`Error cargando citas: ${err.message}`); }),
        getAllUsers().catch(err => { console.error('Error cargando usuarios:', err); return []; }),
        getAllPatients().catch(err => { console.error('Error cargando pacientes:', err); return []; })
      ]);

      // Procesar odontólogos
      const odontologosData = usersData
        .filter((user: IUser) => user.rol === 'odontologo' && user.status !== false)
        .map((user: IUser) => ({
          id: user.id,
          nombre: `Doctor:${user.nombres} ${user.apellidos}`
        }));

      // Procesar pacientes
      const pacientesData = patientsData
        .filter((patient: IPatient) => patient.status !== false)
        .map((patient: IPatient) => ({
          id: patient.id,
          nombre: `Paciente:${patient.nombres} ${patient.apellidos}`,
          cedula: patient.cedula_pasaporte
        }));

      setCitas(citasData);
      setOdontologos(odontologosData);
      setPacientes(pacientesData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
      setError(errorMessage);
      console.error('Error loading data:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateCita = useCallback(async (citaData: ICreateCitaData): Promise<boolean> => {
    try {
      setSubmitLoading(true);
      setError(null);
      
      if (!citaData.paciente || !citaData.odontologo || !citaData.fecha_inicio || !citaData.fecha_fin || !citaData.motivo) {
        throw new Error('Todos los campos requeridos deben estar completos');
      }

      console.log('🆕 Creando nueva cita:', citaData);
      const newCita = await createCita(citaData);
      
      setCitas(prev => [...prev, newCita]);
      console.log('✅ Cita creada exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cita';
      setError(errorMessage);
      console.error('❌ Error creating cita:', err);
      return false;
    } finally {
      setSubmitLoading(false);
    }
  }, []);

  const handleUpdateCita = useCallback(async (id: string, citaData: IUpdateCitaData): Promise<boolean> => {
    try {
      setSubmitLoading(true);
      setError(null);

      if (!id) {
        throw new Error('ID de cita no válido para actualización');
      }

      console.log('📝 Actualizando cita ID:', id, 'con datos:', citaData);

      const updatedCita = await updateCita(id, citaData);
      
      // ✅ CORREGIDO: Actualizar correctamente la cita existente
      setCitas(prev => prev.map(cita => 
        cita.id === id ? { ...updatedCita } : cita
      ));
      
      console.log('✅ Cita actualizada exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la cita';
      setError(errorMessage);
      console.error('❌ Error updating cita:', err);
      return false;
    } finally {
      setSubmitLoading(false);
    }
  }, []);

  const handleDeleteCita = useCallback(async (id: string): Promise<boolean> => {
    try {
      setSubmitLoading(true);
      setError(null);
      
      if (!id) {
        throw new Error('ID de cita no válido');
      }

      console.log('🗑️ Eliminando cita ID:', id);
      await deleteCita(id);
      
      setCitas(prev => prev.filter(cita => cita.id !== id));
      console.log('✅ Cita eliminada exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la cita';
      setError(errorMessage);
      console.error('❌ Error deleting cita:', err);
      return false;
    } finally {
      setSubmitLoading(false);
    }
  }, []);

  const resetCitaForm = useCallback((): void => {
    console.log('🔄 Reseteando formulario');
    setCitaForm({
      paciente: '',
      odontologo: '',
      fecha_inicio: '',
      fecha_fin: '',
      motivo: '',
      procedimiento: '',
      estado: 'programada',
      notas: ''
    });
    setSelectedCita(null);
    setError(null);
  }, []);

  // ✅ FUNCIÓN CORREGIDA - Cargar datos de cita para edición
  const loadCitaData = useCallback((cita: ICita): void => {
    console.log('📥 Cargando datos de cita para edición:', cita);
    
    // Primero establecer la cita seleccionada
    setSelectedCita(cita);
    
    // Luego actualizar el formulario con los datos formateados
    setCitaForm({
      paciente: cita.paciente,
      odontologo: cita.odontologo,
      fecha_inicio: formatDateForInput(cita.fecha_inicio),
      fecha_fin: formatDateForInput(cita.fecha_fin),
      motivo: cita.motivo,
      procedimiento: cita.procedimiento || '',
      estado: cita.estado,
      notas: cita.notas || ''
    });
    
    setError(null);
  }, [formatDateForInput]);

  const updateCitaForm = useCallback((field: keyof CitaFormData, value: string): void => {
    setCitaForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Recargar citas desde el servidor
  const refetchCitas = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const citasData = await getAllCitas();
      setCitas(citasData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al recargar las citas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    // Datos
    citas,
    odontologos,
    pacientes,
    
    // Estados
    loading,
    error,
    selectedCita,
    citaForm,
    submitLoading,
    
    // Funciones
    handleCreateCita,
    handleUpdateCita,
    handleDeleteCita,
    resetCitaForm,
    loadCitaData,
    updateCitaForm,
    refetchCitas,
    setSelectedCita,
    setError
  };
}