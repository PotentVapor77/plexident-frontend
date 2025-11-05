// agenda/AgendaMain.tsx
import React from 'react';
import { useCitas } from "../../../hooks/useCitas";
import PageMeta from "../../common/PageMeta";
import AgendaCalendar from "./AgendaCalendar";

const AgendaMain: React.FC = () => {
  
  const {
    citas,
    loading,
    error
  } = useCitas();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Cargando citas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Agenda de Citas - Sistema Odontológico"
        description="Gestión de citas y agenda del consultorio odontológico"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              Agenda de Citas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Calendario de citas programadas
            </p>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {citas.length} cita(s) programada(s)
          </div>
        </div>

        {/* Calendario */}
        <AgendaCalendar />
      </div>
    </>
  );
};

export default AgendaMain;