// src/components/parameters/horarios/table/HorarioTable.tsx

import { RefreshCw, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
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

    const diasActivos = horariosActivos.map(h => DIAS_SEMANA[h.dia_semana]);
    const primerHorario = horariosActivos[0];
    const todosMismoHorario = horariosActivos.every(h => 
      h.apertura === primerHorario.apertura && h.cierre === primerHorario.cierre
    );

    if (todosMismoHorario) {
      if (diasActivos.length === 7) {
        return `Todos los días de ${primerHorario.apertura} a ${primerHorario.cierre}`;
      } else if (diasActivos.length === 1) {
        return `${diasActivos[0]} de ${primerHorario.apertura} a ${primerHorario.cierre}`;
      } else {
        const indicesDias = horariosActivos.map(h => h.dia_semana).sort((a, b) => a - b);
        const esConsecutivo = indicesDias.every((dia, idx) => 
          idx === 0 || dia === indicesDias[idx - 1] + 1
        );
        
        if (esConsecutivo) {
          const primerDia = DIAS_SEMANA[indicesDias[0]];
          const ultimoDia = DIAS_SEMANA[indicesDias[indicesDias.length - 1]];
          return `de ${primerDia} a ${ultimoDia} de ${primerHorario.apertura} a ${primerHorario.cierre}`;
        }
        return `${diasActivos.join(', ')} de ${primerHorario.apertura} a ${primerHorario.cierre}`;
      }
    }
    
    return `${diasActivos.length} días a la semana con horarios variables`;
  };

  const infoHorarios = getInfoHorarios();

  if (loading) {
    return (
      <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
        <div className="border-b border-gray-300 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
              <Clock className="h-4 w-4 text-brand-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Configuración de Horarios
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Cargando horarios de atención...
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-brand-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Cargando horarios...
          </p>
        </div>
      </section>
    );
  }

  if (horariosArray.length === 0) {
    return (
      <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
        <div className="border-b border-gray-300 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
              <Clock className="h-4 w-4 text-brand-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Configuración de Horarios
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Administración de horarios de atención
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-200 mb-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            No hay horarios configurados
          </h4>
          <p className="text-sm text-gray-500 text-center mb-4 max-w-sm">
            No se encontraron horarios de atención configurados en el sistema
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Cargar horarios predeterminados
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <p className="text-xs text-gray-500">
              Sin horarios configurados
            </p>
          </div>
        </div>
      </section>
    );
  }

  const horariosActivos = horariosArray.filter(h => h.activo).length;
  const horariosInactivos = horariosArray.length - horariosActivos;

  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-theme-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
              <Clock className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Configuración Semanal
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Administración de horarios de atención por día
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                {horariosActivos} Activos
              </span>
            </div>
            {horariosInactivos > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                <XCircle className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">
                  {horariosInactivos} Inactivos
                </span>
              </div>
            )}
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Mensaje informativo */}
        {infoHorarios && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {infoHorarios}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Día
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Apertura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Cierre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Duración
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {DIAS_SEMANA.map((dia, index) => {
              const horario = getHorarioByDia(index);
              const activo = horario?.activo ?? false;
              const apertura = horario?.apertura ?? '--:--';
              const cierre = horario?.cierre ?? '--:--';
              const duracion = (horario && activo) ? calcularDuracion(apertura, cierre) : '--';

              return (
                <tr
                  key={index}
                  className={`hover:bg-gray-50/80 transition-colors ${!activo ? 'opacity-60' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {dia}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activo ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 text-gray-700">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-mono font-medium">
                      {apertura}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-mono font-medium">
                      {cierre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {duracion}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500"></div>
            <p className="text-xs text-gray-500">
              {horariosArray.length} días configurados • {horariosActivos} activos
            </p>
          </div>
          <span className="text-xs text-gray-400">
            Última actualización: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </section>
  );
};

export default HorarioTable;