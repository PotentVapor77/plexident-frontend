// hooks/usePatients.ts
import { useState, useEffect } from 'react';
import type { Patient } from '../services/patientService';
import { getAllPatients, updatePatient, deletePatient } from '../services/patientService';

// Tipo para datos de actualización (excluye campos que no se pueden actualizar)
type PatientUpdateData = Omit<Partial<Patient>, 'id_paciente' | 'id' | 'created_at' | 'updated_at'>;

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await getAllPatients();
      setPatients(patientsData);
      setError(null);
    } catch (err) {
      setError("Error al cargar los pacientes");
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (id: string | number, patientData: PatientUpdateData) => {
    try {
      const patientId = typeof id === 'number' ? id.toString() : id;
      await updatePatient(patientId, patientData);
      await fetchPatients();
      return true;
    } catch (err: any) {
      console.error('Error al actualizar paciente:', err);
      throw new Error(err.response?.data?.message || 'Error al actualizar paciente');
    }
  };

  const handleDeletePatient = async (id: string | number) => {
    try {
      const patientId = typeof id === 'number' ? id.toString() : id;
      await deletePatient(patientId);
      await fetchPatients();
      return true;
    } catch (err: any) {
      console.error('Error al eliminar paciente:', err);
      throw new Error(err.response?.data?.message || 'Error al eliminar paciente');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    handleUpdatePatient,
    handleDeletePatient
  };
}