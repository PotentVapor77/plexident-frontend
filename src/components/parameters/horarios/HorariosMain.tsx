// src/components/parameters/horarios/HorariosMain.tsx

import { useState } from 'react';
import { Clock, Calendar, Settings } from 'lucide-react';
import HorarioTable from './table/HorarioTable';
import HorarioBulkUpdateModal from './modals/HorarioBulkUpdateModal';
import { useHorarios } from '../../../hooks/parameters/useParameters';

const HorariosMain = () => {
  const { data: horarios = [], isLoading, refetch } = useHorarios();
  
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);

  const handleBulkUpdateSuccess = () => {
    setShowBulkUpdateModal(false);
    refetch();
  };

  return (
    <section className="space-y-6 p-4 md:p-6">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Horarios de Atención
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configura los días y horarios de atención de la clínica
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBulkUpdateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-theme-sm"
        >
          <Calendar className="h-4 w-4" />
          Actualizar Horarios
        </button>
      </div>

      {/* Tabla de horarios */}
      <HorarioTable horarios={horarios} loading={isLoading} onRefresh={refetch} />

      {/* Modal de actualización masiva */}
      {showBulkUpdateModal && (
        <HorarioBulkUpdateModal
          currentHorarios={horarios}
          onClose={() => setShowBulkUpdateModal(false)}
          onSuccess={handleBulkUpdateSuccess}
        />
      )}

      {/* Footer informativo (opcional) */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Settings className="h-3.5 w-3.5" />
          <span>Los cambios en horarios afectan la disponibilidad de citas</span>
        </div>
      </div>
    </section>
  );
};

export default HorariosMain;