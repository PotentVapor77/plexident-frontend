// frontend/src/components/appointments/DayView.tsx
import { isSameDay, parseISO } from 'date-fns';
import type { ICita } from '../../types/appointments/IAppointment';

interface DayViewProps {
  date: Date;
  citas: ICita[];
  onEventClick: (cita: ICita) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
}

const DayView = ({ date, citas, onEventClick, onTimeSlotClick }: DayViewProps) => {
  const citasDelDia = citas.filter((cita) => {
    try {
      const citaDate = parseISO(cita.fecha);
      return isSameDay(citaDate, date);
    } catch (error) {
      console.error('Error procesando fecha de cita:', cita.fecha, error);
      return false;
    }
  });

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    const time = `${hour.toString().padStart(2, '0')}:00`;

    const citasEnHora = citasDelDia.filter(cita => {
      try {
        // Extraer horas y minutos de inicio y fin
        const [citaStartHourStr, citaStartMinuteStr] = cita.hora_inicio.split(':');
        const [citaEndHourStr, citaEndMinuteStr] = cita.hora_fin.split(':');
        
        const citaStartHour = parseInt(citaStartHourStr, 10);
        const citaStartMinute = parseInt(citaStartMinuteStr, 10);
        const citaEndHour = parseInt(citaEndHourStr, 10);
        const citaEndMinute = parseInt(citaEndMinuteStr, 10);
        
        // Convertir a minutos totales para comparaciones precisas
        const citaStartTotalMinutes = citaStartHour * 60 + citaStartMinute;
        const citaEndTotalMinutes = citaEndHour * 60 + citaEndMinute;
        const hourStartMinutes = hour * 60;
        const hourEndMinutes = (hour + 1) * 60;
        
        // La cita pertenece a esta hora si:
        // 1. Comienza en esta hora (pero no exactamente al final)
        // 2. Termina en esta hora (pero no exactamente al inicio)
        // 3. Cruza esta hora completamente
        const startsInThisHour = citaStartTotalMinutes >= hourStartMinutes && 
                                citaStartTotalMinutes < hourEndMinutes;
        
        const endsInThisHour = citaEndTotalMinutes > hourStartMinutes && 
                              citaEndTotalMinutes <= hourEndMinutes;
        
        const spansThisHour = citaStartTotalMinutes < hourStartMinutes && 
                             citaEndTotalMinutes > hourEndMinutes;
        
        return startsInThisHour || endsInThisHour || spansThisHour;
      } catch (error) {
        console.error('Error procesando horas de cita:', cita.hora_inicio, cita.hora_fin, error);
        return false;
      }
    });

    return { 
      time, 
      label: `${hour}:00`, 
      hour,
      citas: citasEnHora 
    };
  });

  const getStateColor = (estado: string) => {
    const colors = {
      PROGRAMADA: 'border-l-4 border-blue-500 bg-blue-50',
      CONFIRMADA: 'border-l-4 border-green-500 bg-green-50',
      ASISTIDA: 'border-l-4 border-gray-500 bg-gray-50',
      NO_ASISTIDA: 'border-l-4 border-red-500 bg-red-50',
      CANCELADA: 'border-l-4 border-orange-500 bg-orange-50',
      REPROGRAMADA: 'border-l-4 border-purple-500 bg-purple-50',
      EN_ATENCION: 'border-l-4 border-yellow-500 bg-yellow-50',
    };
    return colors[estado as keyof typeof colors] || 'border-l-4 border-gray-400 bg-gray-50';
  };

  const formatDisplayTime = (time: string) => {
    try {
      const normalizedTime = time.split(':').slice(0, 2).join(':');
      const [hours, minutes] = normalizedTime.split(':');
      const hourNum = parseInt(hours);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
    } catch {
      return time;
    }
  };

  // Función para calcular la duración en minutos entre dos horas
  const calculateDurationInMinutes = (startTime: string, endTime: string): number => {
    try {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      return endTotalMinutes - startTotalMinutes;
    } catch (error) {
      console.error('Error calculando duración:', error);
      return 0;
    }
  };

  // Función para ordenar citas por hora de inicio
  const sortCitasByExactTime = (citasArray: ICita[]) => {
    return [...citasArray].sort((a, b) => {
      const [aHour, aMinute] = a.hora_inicio.split(':').map(Number);
      const [bHour, bMinute] = b.hora_inicio.split(':').map(Number);
      
      if (aHour !== bHour) return aHour - bHour;
      return aMinute - bMinute;
    });
  };

  // Función para determinar el tipo de presencia de la cita en esta hora
  const getCitaPresenceType = (cita: ICita, targetHour: number): 'starts' | 'ends' | 'spans' | 'none' => {
    try {
      const [startHourStr, startMinuteStr] = cita.hora_inicio.split(':');
      const [endHourStr, endMinuteStr] = cita.hora_fin.split(':');
      
      const startHour = parseInt(startHourStr, 10);
      const startMinute = parseInt(startMinuteStr, 10);
      const endHour = parseInt(endHourStr, 10);
      const endMinute = parseInt(endMinuteStr, 10);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      const hourStartMinutes = targetHour * 60;
      const hourEndMinutes = (targetHour + 1) * 60;
      
      if (startTotalMinutes >= hourStartMinutes && startTotalMinutes < hourEndMinutes) {
        return 'starts'; // Comienza en esta hora
      } else if (endTotalMinutes > hourStartMinutes && endTotalMinutes <= hourEndMinutes) {
        return 'ends'; // Termina en esta hora
      } else if (startTotalMinutes < hourStartMinutes && endTotalMinutes > hourEndMinutes) {
        return 'spans'; // Cruza esta hora
      }
      
      return 'none';
    } catch {
      return 'none';
    }
  };

  // Calcular si hay espacio disponible en esta hora (solo espacios de al menos 15 minutos)
  const calculateAvailableSlots = (citasEnHora: ICita[], hour: number) => {
    const citasOrdenadas = sortCitasByExactTime(citasEnHora);
    const availableSlots = [];
    
    // Si no hay citas, verificar si la hora completa tiene al menos 15 minutos
    if (citasOrdenadas.length === 0) {
      const hourDuration = 60; // 1 hora = 60 minutos
      if (hourDuration >= 15) {
        availableSlots.push({
          start: `${hour.toString().padStart(2, '0')}:00`,
          end: `${(hour + 1).toString().padStart(2, '0')}:00`,
          label: `${hour}:00 - ${hour + 1}:00`,
          duration: hourDuration,
          hasMinimumDuration: true
        });
      }
      return availableSlots;
    }
    
    // Verificar espacios antes de la primera cita
    const primeraCita = citasOrdenadas[0];
    const [firstStartHour, firstStartMinute] = primeraCita.hora_inicio.split(':').map(Number);
    const firstStartTotalMinutes = firstStartHour * 60 + firstStartMinute;
    const hourStartTotalMinutes = hour * 60;
    
    const beforeFirstDuration = firstStartTotalMinutes - hourStartTotalMinutes;
    if (beforeFirstDuration >= 15) {
      availableSlots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: primeraCita.hora_inicio,
        label: `${hour}:00 - ${formatDisplayTime(primeraCita.hora_inicio)}`,
        duration: beforeFirstDuration,
        hasMinimumDuration: true
      });
    }
    
    // Verificar espacios entre citas
    for (let i = 0; i < citasOrdenadas.length - 1; i++) {
      const currentCita = citasOrdenadas[i];
      const nextCita = citasOrdenadas[i + 1];
      
      if (currentCita.hora_fin !== nextCita.hora_inicio) {
        const betweenDuration = calculateDurationInMinutes(currentCita.hora_fin, nextCita.hora_inicio);
        if (betweenDuration >= 15) {
          availableSlots.push({
            start: currentCita.hora_fin,
            end: nextCita.hora_inicio,
            label: `${formatDisplayTime(currentCita.hora_fin)} - ${formatDisplayTime(nextCita.hora_inicio)}`,
            duration: betweenDuration,
            hasMinimumDuration: true
          });
        }
      }
    }
    
    // Verificar espacios después de la última cita
    const ultimaCita = citasOrdenadas[citasOrdenadas.length - 1];
    const [lastEndHour, lastEndMinute] = ultimaCita.hora_fin.split(':').map(Number);
    const lastEndTotalMinutes = lastEndHour * 60 + lastEndMinute;
    const hourEndTotalMinutes = (hour + 1) * 60;
    
    const afterLastDuration = hourEndTotalMinutes - lastEndTotalMinutes;
    if (afterLastDuration >= 15) {
      availableSlots.push({
        start: ultimaCita.hora_fin,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        label: `${formatDisplayTime(ultimaCita.hora_fin)} - ${hour + 1}:00`,
        duration: afterLastDuration,
        hasMinimumDuration: true
      });
    }
    
    return availableSlots;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Timeline - SIN HEADER (CalendarHeader ya lo muestra) */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {hours.map(({ time, label, hour, citas: citasEnHora }) => {
            const citasOrdenadas = sortCitasByExactTime(citasEnHora);
            const availableSlots = calculateAvailableSlots(citasEnHora, hour);
            const hasAvailableSlots = availableSlots.length > 0;
            
            return (
              <div key={time} className="flex mb-4">
                {/* Hora */}
                <div className="w-20 flex-shrink-0 pr-4 text-right">
                  <span className="text-sm font-medium text-gray-500">{label}</span>
                </div>

                {/* Línea vertical */}
                <div className="relative flex-shrink-0 w-px bg-gray-200">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-300" />
                </div>

                {/* Contenido */}
                <div className="flex-1 pl-4 pb-2">
                  {citasOrdenadas.length > 0 ? (
                    <div className="space-y-2">
                      {citasOrdenadas.map((cita) => {
                        const presenceType = getCitaPresenceType(cita, hour);
                        const isActive = presenceType !== 'none';
                        
                        return (
                          <div
                            key={cita.id}
                            onClick={() => onEventClick(cita)}
                            className={`
                              ${getStateColor(cita.estado)}
                              rounded-lg p-3 cursor-pointer
                              hover:shadow-md transition-all duration-200
                              group
                              ${isActive ? 'opacity-100' : 'opacity-50'}
                            `}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  {cita.tipo_consulta_display}
                                </p>
                                <p className="text-sm font-bold text-gray-900 mt-1">
                                  {cita.paciente_detalle.nombre_completo}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`
                                  px-2 py-1 rounded-full text-xs font-medium
                                  ${cita.estado === 'PROGRAMADA' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${cita.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' : ''}
                                  ${cita.estado === 'ASISTIDA' ? 'bg-gray-100 text-gray-800' : ''}
                                  ${cita.estado === 'NO_ASISTIDA' ? 'bg-red-100 text-red-800' : ''}
                                  ${cita.estado === 'CANCELADA' ? 'bg-orange-100 text-orange-800' : ''}
                                  ${cita.estado === 'REPROGRAMADA' ? 'bg-purple-100 text-purple-800' : ''}
                                  ${cita.estado === 'EN_ATENCION' ? 'bg-yellow-100 text-yellow-800' : ''}
                                `}>
                                  {cita.estado_display}
                                </span>
                                {/* Mostrar hora exacta */}
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatDisplayTime(cita.hora_inicio)} - {formatDisplayTime(cita.hora_fin)}
                                </span>
                              </div>
                            </div>

                            {/* Detalles */}
                            <div className="space-y-1 text-xs text-gray-600">
                              <p>👨‍⚕️ Dr(a). {cita.odontologo_detalle.nombre_completo}</p>
                              {cita.motivo_consulta && (
                                <p className="truncate" title={cita.motivo_consulta}>
                                  📝 {cita.motivo_consulta}
                                </p>
                              )}
                            </div>

                            {/* Indicador de presencia */}
                            {isActive && (
                              <div className="mt-2">
                                <div className="flex items-center text-xs text-gray-400">
                                  {presenceType === 'starts' && (
                                    <span>🟢 Inicia en esta hora</span>
                                  )}
                                  {presenceType === 'ends' && (
                                    <span>🔴 Termina en esta hora</span>
                                  )}
                                  {presenceType === 'spans' && (
                                    <span>🟡 Continúa desde hora anterior</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Hover indicator */}
                            <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click para ver detalles →
                            </p>
                          </div>
                        );
                      })}
                      
                      {/* Mostrar espacios disponibles (solo si hay espacios de al menos 15 minutos) */}
                 {hasAvailableSlots && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">📅 Espacios disponibles:</p>
                        <div className="flex flex-col gap-2">
                          {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => onTimeSlotClick(date, slot.start)}
                              className="w-full text-left p-2 border border-green-200 bg-green-50 rounded-lg
                                      hover:border-green-400 hover:bg-green-100 transition-all duration-200
                                      text-xs text-gray-700 hover:text-green-700"
                            >
                              <div className="font-medium">{slot.label}</div>
                              <div className="text-green-600">+ Crear cita aquí</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>
                  ) : (
                    // Si no hay citas en esta hora, verificar si se puede crear cita
                    hasAvailableSlots ? (
                      // Mostrar el primer slot disponible
                      <button
                        onClick={() => onTimeSlotClick(date, availableSlots[0].start)}
                        className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg
                                 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200
                                 flex items-center justify-center text-gray-400 hover:text-blue-600"
                      >
                        <span className="text-sm">+ Crear cita entre {hour}:00 y {hour + 1}:00</span>
                      </button>
                    ) : (
                      // Si no hay espacio suficiente, mostrar mensaje
                      <div className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg
                               flex items-center justify-center text-gray-300">
                        <span className="text-sm">Sin espacio disponible (mínimo 15 min)</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;