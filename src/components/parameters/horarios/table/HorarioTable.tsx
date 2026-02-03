// src/components/parameters/horarios/table/HorarioTable.tsx

import { RefreshCw } from 'lucide-react';
import type { IHorario } from '../../../../types/parameters/IParameters';

interface HorarioTableProps {
  horarios: IHorario[] | { horarios: IHorario[]; total: number };
  loading: boolean;
  onRefresh: () => void;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const HorarioTable = ({ horarios, loading, onRefresh }: HorarioTableProps) => {
  // Normalizar los horarios (manejar tanto array como objeto de respuesta)
  const getHorariosArray = (): IHorario[] => {
    if (Array.isArray(horarios)) {
      return horarios;
    }
    // Si es objeto, extraer la propiedad 'horarios'
    return horarios?.horarios || [];
  };

  const horariosArray = getHorariosArray();

  const getHorarioByDia = (diaSemana: number) => {
    return horariosArray.find((h) => h.dia_semana === diaSemana);
  };

  const calcularDuracion = (apertura: string, cierre: string): string => {
    if (apertura === '--:--' || cierre === '--:--') return '--';
    
    const [aperturaH, aperturaM] = apertura.split(':').map(Number);
    const [cierreH, cierreM] = cierre.split(':').map(Number);
    const totalMinutos = (cierreH * 60 + cierreM) - (aperturaH * 60 + aperturaM);
    
    if (totalMinutos < 0) return '--';
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    if (horas > 0 && minutos > 0) {
      return `${horas}h ${minutos}m`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${minutos}m`;
    }
  };

  // Función para obtener información de horarios
  const getInfoHorarios = () => {
    const horariosActivos = horariosArray.filter(h => h.activo);
    
    if (horariosActivos.length === 0) {
      return null;
    }

    // Obtener días con horarios activos
    const diasActivos = horariosActivos.map(h => DIAS_SEMANA[h.dia_semana]);
    
    // Verificar si todos tienen el mismo horario
    const primerHorario = horariosActivos[0];
    const todosMismoHorario = horariosActivos.every(h => 
      h.apertura === primerHorario.apertura && h.cierre === primerHorario.cierre
    );

    // Crear mensaje
    let mensaje = '🕒 ';
    
    if (todosMismoHorario) {
      if (diasActivos.length === 7) {
        mensaje += `Todos los días de ${primerHorario.apertura} a ${primerHorario.cierre}`;
      } else if (diasActivos.length === 1) {
        mensaje += `${diasActivos[0]} de ${primerHorario.apertura} a ${primerHorario.cierre}`;
      } else {
        const indicesDias = horariosActivos.map(h => h.dia_semana).sort((a, b) => a - b);
        const esConsecutivo = indicesDias.every((dia, idx) => 
          idx === 0 || dia === indicesDias[idx - 1] + 1
        );
        
        if (esConsecutivo) {
          const primerDia = DIAS_SEMANA[indicesDias[0]];
          const ultimoDia = DIAS_SEMANA[indicesDias[indicesDias.length - 1]];
          mensaje += `de ${primerDia} a ${ultimoDia} de ${primerHorario.apertura} a ${primerHorario.cierre}`;
        } else {
          mensaje += `${diasActivos.join(', ')} de ${primerHorario.apertura} a ${primerHorario.cierre}`;
        }
      }
    } else {
      // Horarios variables
      mensaje += `${diasActivos.length} días a la semana con horarios variables`;
    }
    
    return mensaje;
  };

  const infoHorarios = getInfoHorarios();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Verificar si hay datos
  if (horariosArray.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          No hay horarios configurados
        </div>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Cargar horarios predeterminados
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuración Semanal
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({horariosArray.filter(h => h.activo).length} de {horariosArray.length} activos)
            </span>
          </h2>
          
          {/* ✅ Mensaje informativo */}
          {infoHorarios && (
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400 font-medium">
              {infoHorarios}
            </p>
          )}
        </div>
        
        <button
          onClick={onRefresh}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                   dark:hover:bg-gray-700 rounded-lg transition-colors self-start"
          title="Actualizar"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Día
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Apertura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cierre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duración
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {DIAS_SEMANA.map((dia, index) => {
              const horario = getHorarioByDia(index);
              const activo = horario?.activo ?? false;
              const apertura = horario?.apertura ?? '--:--';
              const cierre = horario?.cierre ?? '--:--';
              const duracion = (horario && activo) ? calcularDuracion(apertura, cierre) : '--';

              return (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    !activo ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {dia}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activo ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {apertura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {cierre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {duracion}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HorarioTable;