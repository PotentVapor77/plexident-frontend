// src/components/parameters/horarios/HorariosMain.tsx

import { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Horarios de Atención
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configura los días y horarios de atención de la clínica
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBulkUpdateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                   rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calendar size={20} />
          Actualizar Horarios
        </button>
      </div>

      {/* Table */}
      <HorarioTable horarios={horarios} loading={isLoading} onRefresh={refetch} />

      {/* Modals */}
      {showBulkUpdateModal && (
        <HorarioBulkUpdateModal
          currentHorarios={horarios}
          onClose={() => setShowBulkUpdateModal(false)}
          onSuccess={handleBulkUpdateSuccess}
        />
      )}

      
    </div>
  );
};

export default HorariosMain;