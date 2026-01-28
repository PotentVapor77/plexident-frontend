// src/components/dashboard/RecentActivities.tsx

import React, { useState } from 'react';
import Badge from '../ui/badge/Badge';
import { formatDate, formatTime } from '../../lib/dashboardUtils';
import type { 
  DashboardResponse,
} from '../../types/dashboard/IDashboard';

interface RecentActivitiesProps {
  tablas?: DashboardResponse['tablas'];
  listas?: DashboardResponse['listas'];
  rol?: string;
  loading?: boolean;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  tablas, 
  listas, 
  rol,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState<'citas' | 'pacientes'>('citas');

  const getStatusColor = (estado: string): "success" | "warning" | "error" | "primary" => {
    const estadoLower = estado?.toLowerCase();
    
    if (estadoLower?.includes('asistida') || estadoLower?.includes('confirmada') || estadoLower?.includes('programada')) {
      return 'success';
    }
    if (estadoLower?.includes('atención') || estadoLower?.includes('pendiente')) {
      return 'warning';
    }
    if (estadoLower?.includes('cancelada') || estadoLower?.includes('no asistida')) {
      return 'error';
    }
    return 'primary';
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const citas = tablas?.ultimas_citas || listas?.mis_citas || listas?.citas_del_dia || [];
  const pacientes = tablas?.pacientes_recientes || listas?.pacientes_condiciones || listas?.pacientes_sin_anamnesis || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {rol === 'Odontologo' ? 'Mis Citas Recientes' : 'Actividades Recientes'}
        </h3>

        {(citas.length > 0 && pacientes.length > 0) && (
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'citas' 
                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('citas')}
            >
              Citas ({citas.length})
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'pacientes' 
                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('pacientes')}
            >
              Pacientes ({pacientes.length})
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {citas.length === 0 && pacientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay actividades recientes
          </div>
        ) : activeTab === 'citas' && citas.length > 0 ? (
          <div className="min-w-full">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {citas.slice(0, 5).map((cita, index) => (
                  <tr key={cita.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {cita.paciente || 'N/A'}
                        </div>
                        {cita.motivo && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {cita.motivo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {cita.fecha ? formatDate(cita.fecha) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {cita.hora ? formatTime(cita.hora) : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        size="sm" 
                        color={getStatusColor(cita.estado)} 
                        variant="light"
                      >
                        {cita.estado || 'N/A'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : pacientes.length > 0 ? (
          <div className="min-w-full">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pacientes.slice(0, 5).map((paciente, index) => (
                  <tr key={paciente.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {paciente.nombre || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {paciente.cedula || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {paciente.telefono || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {paciente.fecha_registro ? formatDate(paciente.fecha_registro) : 
                       paciente.ultima_visita ? formatDate(paciente.ultima_visita) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay datos disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
