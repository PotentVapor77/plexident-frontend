// frontend/src/components/appointments/AppointmentRescheduleModal.tsx

import { useState, useEffect, useRef } from 'react';
import {
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/modal';
import { format, parseISO, isBefore, startOfDay, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ICita, IHorarioDisponible } from '../../types/appointments/IAppointment';
import { useAppointment } from '../../hooks/appointments/useAppointment';
import { useNotification } from '../../context/notifications/NotificationContext';

interface AppointmentRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cita: ICita;
  onRescheduleSuccess: () => void;
}

const AppointmentRescheduleModal = ({
  isOpen,
  onClose,
  cita,
  onRescheduleSuccess,
}: AppointmentRescheduleModalProps) => {
  const { reprogramarCita, fetchHorariosDisponibles, horariosDisponibles, fetchingHorarios, loading } = useAppointment();
  const { notify } = useNotification();

  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isDateValid, setIsDateValid] = useState(true);
  const [dateValue, setDateValue] = useState(cita.fecha);

  const [formData, setFormData] = useState({
    fecha: cita.fecha,
    hora_inicio: cita.hora_inicio,
  });

  const [selectedHorario, setSelectedHorario] = useState<IHorarioDisponible | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showComparison, setShowComparison] = useState(true);

  const today = new Date();
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const maxDateString = format(maxDate, 'yyyy-MM-dd');
  const minDateString = format(new Date(), 'yyyy-MM-dd');

  // Verificar si la cita ya pasó
  const isCitaPasada = (): boolean => {
    try {
      const citaDateTime = parseISO(`${cita.fecha}T${cita.hora_inicio}`);
      return isPast(citaDateTime);
    } catch (error) {
      console.error('Error verificando si la cita pasó:', error);
      return false;
    }
  };

  const citaYaPaso = isCitaPasada();

  // ✅ ELIMINADO: useEffect que mostraba notificación al abrir
  // Ya no necesitamos notificar automáticamente, el usuario lo verá visualmente

  useEffect(() => {
    if (formData.fecha) {
      if (formData.fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setDateValue(formData.fecha);
      } else {
        try {
          const date = new Date(formData.fecha);
          if (!isNaN(date.getTime())) {
            setDateValue(format(date, 'yyyy-MM-dd'));
          } else {
            setDateValue('');
          }
        } catch {
          setDateValue('');
        }
      }
    } else {
      setDateValue('');
    }
  }, [formData.fecha]);

  useEffect(() => {
    if (formData.fecha && !citaYaPaso) {
      fetchHorariosDisponibles(cita.odontologo, formData.fecha, cita.duracion);
    }
  }, [formData.fecha, cita.odontologo, cita.duracion, fetchHorariosDisponibles, citaYaPaso]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    
    setDateValue(newDate);
    
    if (newDate > maxDateString) {
      setIsDateValid(false);
      notify({
        type: 'warning',
        title: 'Fecha inválida',
        message: 'No puede seleccionar una fecha superior a 1 año en el futuro',
      });
      return;
    }
    
    if (newDate < minDateString) {
      setIsDateValid(false);
      notify({
        type: 'warning',
        title: 'Fecha inválida',
        message: 'No puede seleccionar una fecha pasada',
      });
      return;
    }
    
    setIsDateValid(true);
    setFormData(prev => ({ ...prev, fecha: newDate, hora_inicio: '' }));
    setSelectedHorario(null);
    if (errors.fecha) setErrors(prev => ({ ...prev, fecha: '' }));
    if (errors.hora_inicio) setErrors(prev => ({ ...prev, hora_inicio: '' }));
  };

  const handleCalendarIconClick = () => {
    if (dateInputRef.current && !citaYaPaso) {
      dateInputRef.current.showPicker();
    } else if (citaYaPaso) {
      // ✅ Solo notificar cuando el usuario intente interactuar
      notify({
        type: 'error',
        title: 'Acción bloqueada',
        message: 'Esta cita ya pasó y no puede ser reprogramada',
      });
    }
  };

  const handleClearDate = () => {
    if (citaYaPaso) {
      notify({
        type: 'error',
        title: 'Acción bloqueada',
        message: 'Esta cita ya pasó y no puede ser reprogramada',
      });
      return;
    }
    
    setDateValue('');
    setIsDateValid(true);
    setFormData(prev => ({ ...prev, fecha: '', hora_inicio: '' }));
    setSelectedHorario(null);
    
    if (errors.fecha) setErrors(prev => ({ ...prev, fecha: '' }));
    if (errors.hora_inicio) setErrors(prev => ({ ...prev, hora_inicio: '' }));
  };

  const handleHorarioSelect = (horario: IHorarioDisponible) => {
    if (citaYaPaso) {
      notify({
        type: 'error',
        title: 'Acción bloqueada',
        message: 'No puede seleccionar horarios para una cita que ya pasó',
      });
      return;
    }

    setSelectedHorario(horario);
    setFormData(prev => ({
      ...prev,
      hora_inicio: horario.hora_inicio,
    }));
    if (errors.hora_inicio) setErrors(prev => ({ ...prev, hora_inicio: '' }));
  };

  const isDateTimeInPast = (fecha: string, hora: string): boolean => {
    try {
      const dateTimeString = `${fecha}T${hora}`;
      const selectedDateTime = parseISO(dateTimeString);
      const now = new Date();
      
      return isBefore(selectedDateTime, now);
    } catch (error) {
      console.error('Error validando fecha/hora:', error);
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // ✅ MODIFICADO: Solo agregar al objeto de errores, sin notificación duplicada
    if (citaYaPaso) {
      newErrors.general = 'Esta cita ya pasó y no puede ser reprogramada';
      setErrors(newErrors);
      return false;
    }

    if (!formData.fecha) {
      newErrors.fecha = 'Seleccione una fecha';
    } else {
      const selectedDate = parseISO(formData.fecha);
      const today = startOfDay(new Date());
      if (isBefore(selectedDate, today)) {
        newErrors.fecha = 'No puede seleccionar una fecha pasada';
        notify({
          type: 'warning',
          title: 'Fecha inválida',
          message: 'No puede seleccionar una fecha pasada',
        });
      }
    }

    if (!formData.hora_inicio || !selectedHorario) {
      newErrors.hora_inicio = 'Seleccione un horario disponible';
    } else if (formData.fecha && formData.hora_inicio) {
      if (isDateTimeInPast(formData.fecha, formData.hora_inicio)) {
        newErrors.hora_inicio = 'No puede seleccionar un horario que ya pasó';
        notify({
          type: 'warning',
          title: 'Horario pasado',
          message: 'No puede seleccionar un horario que ya pasó',
        });
      }
    }

    if (
      formData.fecha === cita.fecha &&
      formData.hora_inicio === cita.hora_inicio
    ) {
      newErrors.general = 'Debe modificar al menos la fecha u hora de la cita';
      notify({
        type: 'warning',
        title: 'Sin cambios',
        message: 'Debe modificar al menos la fecha u hora de la cita',
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Notificar solo cuando intente hacer submit
    if (citaYaPaso) {
      notify({
        type: 'error',
        title: 'No se puede reprogramar',
        message: 'Esta cita ya pasó y no puede ser reprogramada',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      console.log('📤 Reprogramando cita:', {
        id: cita.id,
        nueva_fecha: formData.fecha,
        nueva_hora_inicio: formData.hora_inicio,
      });

      await reprogramarCita(
        cita.id,
        formData.fecha,
        formData.hora_inicio
      );

      notify({
        type: 'success',
        title: 'Cita reprogramada',
        message: 'La cita se ha reprogramado exitosamente',
      });

      onRescheduleSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error al reprogramar cita:', error);
      
      let errorMessage = 'Error al reprogramar la cita';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      notify({
        type: 'error',
        title: 'Error al reprogramar',
        message: errorMessage,
      });
    }
  };

  const handleCloseModal = () => {
    setFormData({
      fecha: cita.fecha,
      hora_inicio: cita.hora_inicio,
    });
    setSelectedHorario(null);
    setErrors({});
    setShowComparison(true);
    setDateValue(cita.fecha);
    setIsDateValid(true);
    onClose();
  };

  const isDifferentDate = formData.fecha !== cita.fecha;
  const isDifferentTime = formData.hora_inicio !== cita.hora_inicio;
  const hasChanges = isDifferentDate || isDifferentTime;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className={`h-10 w-10 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-sm ${
                  citaYaPaso 
                    ? 'from-red-500 to-red-700' 
                    : 'from-orange-500 to-orange-700'
                }`}>
                  {citaYaPaso ? (
                    <LockClosedIcon className="h-6 w-6 text-white" />
                  ) : (
                    <ArrowPathIcon className="h-6 w-6 text-white" />
                  )}
                </div>
                {citaYaPaso ? 'Cita No Reprogramable' : 'Reprogramar Cita'}
              </h2>
              <p className="text-sm text-gray-500 mt-2 ml-13">
                ID de cita: #{cita.id}
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Alerta de cita pasada */}
        {citaYaPaso && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <LockClosedIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  ⚠️ Esta cita ya pasó
                </h3>
                <p className="text-sm text-red-800 mb-3">
                  La fecha y hora de esta cita ya transcurrieron. No es posible reprogramar citas pasadas.
                </p>
                <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-900">
                    <strong>Fecha de la cita:</strong> {format(parseISO(cita.fecha), "d 'de' MMMM, yyyy", { locale: es })} a las {cita.hora_inicio}
                  </p>
                </div>
                <div className="mt-4 space-y-2 text-sm text-red-700">
                  <p>• No se pueden realizar cambios a esta cita</p>
                  <p>• Si necesita una nueva cita, debe crear una desde cero</p>
                  <p>• Puede revisar el historial de esta cita en el detalle</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información del paciente y odontólogo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`bg-gradient-to-br to-white border-2 rounded-xl p-4 ${
            citaYaPaso 
              ? 'from-gray-50 border-gray-300 opacity-60' 
              : 'from-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-md ${
                citaYaPaso 
                  ? 'from-gray-400 to-gray-600' 
                  : 'from-blue-500 to-blue-700'
              }`}>
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Paciente</p>
                <p className="font-bold text-gray-900">{cita.paciente_detalle.nombre_completo}</p>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br to-white border-2 rounded-xl p-4 ${
            citaYaPaso 
              ? 'from-gray-50 border-gray-300 opacity-60' 
              : 'from-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-md ${
                citaYaPaso 
                  ? 'from-gray-400 to-gray-600' 
                  : 'from-purple-500 to-purple-700'
              }`}>
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Odontólogo</p>
                <p className="font-bold text-gray-900">Dr(a). {cita.odontologo_detalle.nombre_completo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparación de horarios */}
        {showComparison && (
          <div className={`border-2 rounded-xl p-4 ${
            citaYaPaso 
              ? 'bg-gray-50 border-gray-300' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              {citaYaPaso ? (
                <LockClosedIcon className="h-6 w-6 text-gray-600 flex-shrink-0 mt-0.5" />
              ) : (
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">
                  {citaYaPaso ? 'Información de la cita pasada' : 'Información actual de la cita'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Fecha actual</p>
                    <p className="font-semibold text-gray-900">
                      {format(parseISO(cita.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Hora Inicio</p>
                    <p className="font-semibold text-gray-900">
                      {cita.hora_inicio} - {cita.hora_fin}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duración</p>
                    <p className="font-semibold text-gray-900">{cita.duracion} minutos</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Formulario - Solo visible si la cita NO ha pasado */}
        {!citaYaPaso && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nueva fecha */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="h-4 w-4 text-orange-600" />
                  Nueva fecha <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="date"
                  name="fecha"
                  value={dateValue}
                  onChange={handleDateChange}
                  min={minDateString}
                  max={maxDateString}
                  disabled={citaYaPaso}
                  className={`w-full p-3.5 pr-20 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white shadow-sm appearance-none ${
                    errors.fecha || !isDateValid ? 'border-red-300' : 'border-gray-300'
                  } ${citaYaPaso ? 'cursor-not-allowed opacity-50' : ''}`}
                  style={{
                    colorScheme: 'light',
                    cursor: citaYaPaso ? 'not-allowed' : 'pointer',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCalendarIconClick}
                  disabled={citaYaPaso}
                  className={`absolute right-12 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-700 focus:outline-none ${
                    citaYaPaso ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  aria-label="Abrir selector de fecha"
                >
                  <CalendarDaysIcon className="w-5 h-5" />
                </button>
                
                {dateValue && !citaYaPaso && (
                  <button
                    type="button"
                    onClick={handleClearDate}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600 focus:outline-none"
                    aria-label="Limpiar fecha"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!isDateValid && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  La fecha debe estar entre hoy y máximo 1 año en el futuro
                </p>
              )}
              {errors.fecha && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.fecha}
                </p>
              )}
              {isDifferentDate && !errors.fecha && isDateValid && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckIcon className="h-4 w-4" />
                  Fecha modificada
                </p>
              )}
            </div>

            {/* Información de duración */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Duración de la cita</p>
                  <p className="font-semibold text-gray-900">{cita.duracion} minutos</p>
                  <p className="text-xs text-gray-500 mt-1">
                    La duración se mantendrá igual que la cita original
                  </p>
                </div>
              </div>
            </div>

            {/* Horarios disponibles */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-orange-600" />
                  Seleccione nuevo horario <span className="text-red-500">*</span>
                </span>
              </label>

              {fetchingHorarios ? (
                <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-gray-600">Cargando horarios disponibles...</p>
                  </div>
                </div>
              ) : horariosDisponibles.length === 0 ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">No hay horarios disponibles</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.fecha ? 'Intente con otra fecha diferente' : 'Seleccione primero una fecha'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {horariosDisponibles.map((horario, index) => {
                    const isPast = isDateTimeInPast(formData.fecha, horario.hora_inicio);
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !isPast && handleHorarioSelect(horario)}
                        disabled={isPast}
                        className={`p-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                          isPast
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                            : selectedHorario?.hora_inicio === horario.hora_inicio
                            ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white border-orange-500 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold">{horario.hora_inicio}</div>
                          <div className="text-xs opacity-75 mt-0.5">
                            {horario.hora_fin}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.hora_inicio && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.hora_inicio}
                </p>
              )}
              {isDifferentTime && selectedHorario && !errors.hora_inicio && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckIcon className="h-4 w-4" />
                  Horario modificado: {selectedHorario.hora_inicio} - {selectedHorario.hora_fin}
                </p>
              )}
            </div>

            {/* Información adicional */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                Información que se mantendrá de la cita:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Tipo de consulta</p>
                  <p className="font-medium text-gray-900">{cita.tipo_consulta_display}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Duración</p>
                  <p className="font-medium text-gray-900">{cita.duracion} minutos</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500 text-xs">Motivo de consulta</p>
                  <p className="font-medium text-gray-900">{cita.motivo_consulta}</p>
                </div>
                {cita.observaciones && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500 text-xs">Observaciones</p>
                    <p className="font-medium text-gray-900">{cita.observaciones}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen de cambios */}
            {hasChanges && selectedHorario && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckIcon className="h-5 w-5" />
                  Resumen de cambios
                </h4>
                <div className="space-y-1 text-sm text-green-800">
                  {isDifferentDate && (
                    <p>
                      • Nueva fecha: <strong>{format(parseISO(formData.fecha), "d 'de' MMMM, yyyy", { locale: es })}</strong>
                    </p>
                  )}
                  {isDifferentTime && (
                    <p>
                      • Nuevo horario: <strong>{selectedHorario.hora_inicio} - {selectedHorario.hora_fin}</strong>
                    </p>
                  )}
                  <p className="text-xs text-green-700 mt-2 pt-2 border-t border-green-300">
                    ✅ La cita se actualizará con la nueva fecha y hora. Se mantendrá el mismo ID.
                  </p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !hasChanges || !selectedHorario || citaYaPaso}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl hover:from-orange-600 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Reprogramando...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-5 w-5" />
                    Confirmar Reprogramación
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Botón de cerrar cuando la cita ya pasó */}
        {citaYaPaso && (
          <div className="flex justify-end pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <XMarkIcon className="h-5 w-5" />
              Cerrar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AppointmentRescheduleModal;
