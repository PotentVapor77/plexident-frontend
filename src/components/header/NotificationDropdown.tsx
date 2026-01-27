// frontend/src/components/layout/NotificationDropdown.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import appointmentService from '../../services/appointments/appointmentService';
import type { IAlertaCita } from '../../types/appointments/IAppointment';

interface CitasProximasResponse {
  total_alertas: number;
  hora_actual: string;
  fecha_actual: string;
  ventana_minutos: number;
  citas_proximas: IAlertaCita[];
  tiene_alertas_criticas: boolean;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [citasProximas, setCitasProximas] = useState<IAlertaCita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar citas al montar el componente
  useEffect(() => {
    cargarCitasProximas();
    
    // Actualizar cada 2 minutos en segundo plano
    const interval = setInterval(() => {
      cargarCitasProximas();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const cargarCitasProximas = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await appointmentService.getCitasProximas();
    //console.log('📦 Respuesta citas próximas:', response);
    
    if (Array.isArray(response)) {
      setCitasProximas(response);
    } else if (response && typeof response === 'object') {
      const data = response as ApiResponse;
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getCitasProximas();
      console.log('📦 Respuesta citas próximas:', response);
      
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          const data = response.data as CitasProximasResponse;
          
          if (data.citas_proximas && Array.isArray(data.citas_proximas)) {
            setCitasProximas(data.citas_proximas);
            console.log(`✅ ${data.citas_proximas.length} citas próximas cargadas`);
          } else {
            console.warn('⚠️ No se encontró citas_proximas en data:', data);
            setCitasProximas([]);
          }
        } 
        else if ('citas_proximas' in response && Array.isArray(response.citas_proximas)) {
          setCitasProximas(response.citas_proximas);
        }
        else if (Array.isArray(response)) {
          setCitasProximas(response);
        } else {
          console.error('❌ Estructura de respuesta no reconocida:', response);
          setCitasProximas([]);
          setError('Formato de respuesta inválido');
        }
      } else {
        console.error('❌ Respuesta no válida:', response);
        setCitasProximas([]);
        setError('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('❌ Error cargando citas próximas:', err);
      setError('Error al cargar las citas');
      setCitasProximas([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const formatearMinutosFaltantes = (minutos: number): string => {
    if (minutos < 0) return 'En progreso';
    if (minutos < 60) return `En ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas >= 12) {
      const dias = Math.floor(horas / 24);
      const horasRestantes = horas % 24;
      if (dias > 0) {
        return `En ${dias}d ${horasRestantes}h`;
      }
    }
    
    return `En ${horas}h ${mins}min`;
  };

  const getUrgenciaColor = (minutos: number): string => {
    if (minutos < 0) return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    if (minutos <= 15) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
    if (minutos <= 30) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
    return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de notificaciones */}
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
                              border-blue-600 dark:border-blue-400 mx-auto"></div>
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
                {citasProximas.map((cita) => (
                  <div
                    key={cita.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                              transition-colors duration-150 border-l-4 ${getUrgenciaColor(cita.minutos_faltantes)}`}
                  >
                    {/* ✅ CORREGIDO: estado en lugar de EstadoCita */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        cita.minutos_faltantes <= 15
                          ? 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                          : cita.minutos_faltantes <= 30
                          ? 'bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
                          : 'bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                      }`}>
                        {formatearMinutosFaltantes(cita.minutos_faltantes)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        cita.estado === 'CONFIRMADA'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {cita.estado_display}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 mb-2">
                      <User size={16} className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {cita.paciente.nombre_completo}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {cita.paciente.telefono}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {format(parseISO(cita.fecha), "EEEE d 'de' MMMM", { locale: es })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Clock size={14} />
                      <span>⏰ {cita.hora_inicio} - {cita.hora_fin}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Odontólogo:</span>{' '}
                        Dr. {cita.odontologo.nombre_completo.split(' ')[0]}
                      </p>
                    </div>

                    {cita.motivo_consulta && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {cita.motivo_consulta}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
