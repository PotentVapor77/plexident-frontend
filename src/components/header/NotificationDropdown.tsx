// frontend/src/components/layout/NotificationDropdown.tsx

import { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../services/api/axiosInstance';
import { ENDPOINTS } from '../../config/api';
import type { ICita } from '../../types/appointments/IAppointment';

// Shape that matches the actual backend response for /proximas
interface CitaConMinutos extends ICita {
  _minutos_faltantes: number; // computed client-side
}

interface CitasProximasBackendResponse {
  minutos: number;
  total: number;
  citas: ICita[];
  scope: string;
}

// Compute minutes remaining from fecha + hora_inicio
function computeMinutosFaltantes(fecha: string, horaInicio: string): number {
  try {
    const [hh, mm, ss] = horaInicio.split(':').map(Number);
    const citaDate = parseISO(fecha);
    citaDate.setHours(hh, mm, ss ?? 0, 0);
    const diff = (citaDate.getTime() - Date.now()) / 60000;
    return Math.round(diff);
  } catch {
    return NaN;
  }
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [citasProximas, setCitasProximas] = useState<CitaConMinutos[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarCitasProximas();
    const interval = setInterval(cargarCitasProximas, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const cargarCitasProximas = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the API directly to avoid the shape mismatch in appointmentService
      const url = `${ENDPOINTS.appointment.citas.proximas}?minutos=30`;
      const response = await api.get<CitasProximasBackendResponse>(url);
      const data = response.data;

      console.log('📦 Respuesta citas próximas (raw):', data);

      // Backend returns { minutos, total, citas: ICita[], scope }
      let rawCitas: ICita[] = [];

      if (data && Array.isArray(data.citas)) {
        rawCitas = data.citas;
      } else if (data && typeof data === 'object' && 'data' in (data as object)) {
        // Wrapped: { data: { citas: [...] } }
        const inner = ((data as unknown) as { data: CitasProximasBackendResponse }).data;
        if (inner && Array.isArray(inner.citas)) rawCitas = inner.citas;
      }

      // Attach computed minutos_faltantes
      const enriched: CitaConMinutos[] = rawCitas.map((cita) => ({
        ...cita,
        _minutos_faltantes: computeMinutosFaltantes(cita.fecha, cita.hora_inicio),
      }));

      console.log(`✅ ${enriched.length} citas próximas enriquecidas`);
      setCitasProximas(enriched);
    } catch (err) {
      console.error('❌ Error cargando citas próximas:', err);
      setError('Error al cargar las citas');
      setCitasProximas([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const formatearMinutosFaltantes = (minutos: number): string => {
    if (isNaN(minutos)) return 'Hora desconocida';
    if (minutos < 0) return 'En progreso';
    if (minutos < 60) return `En ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas >= 24) {
      const dias = Math.floor(horas / 24);
      const horasRestantes = horas % 24;
      return `En ${dias}d ${horasRestantes}h`;
    }
    return `En ${horas}h ${mins}min`;
  };

  const getUrgenciaColor = (minutos: number): string => {
    if (isNaN(minutos) || minutos < 0)
      return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    if (minutos <= 15)
      return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
    if (minutos <= 30)
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
    return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
  };

  const getBadgeColor = (minutos: number): string => {
    if (isNaN(minutos) || minutos <= 15)
      return 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    if (minutos <= 30)
      return 'bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200';
    return 'bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 
                   dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        aria-label="Notificaciones de citas próximas"
      >
        <Bell size={20} />
        {citasProximas.length > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center 
                           w-5 h-5 text-xs font-bold text-white bg-red-500 
                           rounded-full transform translate-x-1 -translate-y-1">
            {citasProximas.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 
                        rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 
                        z-50 max-h-[500px] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                Citas Próximas
              </h3>
              <button
                onClick={cargarCitasProximas}
                disabled={loading}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline 
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Próximas citas en los siguientes 30 minutos
            </p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading && citasProximas.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 
                                border-blue-600 dark:border-blue-400 mx-auto" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Buscando citas próximas...
                </p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={cargarCitasProximas}
                  className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            ) : citasProximas.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-gray-400 dark:text-gray-600 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  No hay citas próximas
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  No hay citas programadas en los próximos 30 minutos
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {citasProximas.map((cita) => {
                  const minutos = cita._minutos_faltantes;
                  // ✅ Use paciente_detalle (what the serializer actually returns)
                  const pacienteNombre =
                    cita.paciente_detalle?.nombre_completo ?? 'Paciente no identificado';
                  const pacienteTelefono =
                    cita.paciente_detalle?.telefono ?? 'Sin teléfono';
                  const odontologoNombre =
                    cita.odontologo_detalle?.nombre_completo ?? null;

                  return (
                    <div
                      key={cita.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                                  transition-colors duration-150 border-l-4 ${getUrgenciaColor(minutos)}`}
                    >
                      {/* Time badge + status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getBadgeColor(minutos)}`}>
                          {formatearMinutosFaltantes(minutos)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cita.estado === 'CONFIRMADA'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {cita.estado_display || cita.estado}
                        </span>
                      </div>

                      {/* Patient */}
                      <div className="flex items-start gap-2 mb-2">
                        <User size={16} className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {pacienteNombre}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {pacienteTelefono}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {cita.fecha
                              ? format(parseISO(cita.fecha), "EEEE d 'de' MMMM", { locale: es })
                              : 'Fecha no disponible'}
                          </span>
                        </div>
                      </div>

                      {/* Time range */}
                      <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Clock size={14} />
                        <span>⏰ {cita.hora_inicio || '--:--'} - {cita.hora_fin || '--:--'}</span>
                      </div>

                      {/* Dentist */}
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Odontólogo:</span>{' '}
                          {odontologoNombre ? (
                            `Dr. ${odontologoNombre.split(' ')[0]}`
                          ) : (
                            <span className="italic text-gray-400">No asignado</span>
                          )}
                        </p>
                      </div>

                      {/* Reason */}
                      {cita.motivo_consulta && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {cita.motivo_consulta}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;