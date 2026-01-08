// frontend/src/components/appointments/AppointmentCreateModal.tsx

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { ICitaCreate, TipoConsulta } from '../../types/appointments/IAppointment';
import type { IPaciente } from '../../types/patient/IPatient';
import type { IUser } from '../../types/user/IUser';
import { useAppointment } from '../../hooks/appointments/useAppointment';
import { useSchedule } from '../../hooks/appointments/useSchedule';
import { getUsers } from '../../services/user/userService';
import { getPacientesActivos } from '../../services/patient/patientService';
import { Modal } from '../ui/modal';

interface AppointmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: Date;
  initialTime?: string;
  initialOdontologo?: string;
}

const TIPOS_CONSULTA: { value: TipoConsulta; label: string }[] = [
  { value: 'PRIMERA_VEZ', label: 'Primera Vez' },
  { value: 'CONTROL', label: 'Control' },
  { value: 'URGENCIA', label: 'Urgencia' },
  { value: 'LIMPIEZA', label: 'Limpieza' },
  { value: 'ORTODONCIA', label: 'Ortodoncia' },
  { value: 'ENDODONCIA', label: 'Endodoncia' },
  { value: 'CIRUGIA', label: 'Cirugía' },
  { value: 'PROTESIS', label: 'Prótesis' },
  { value: 'OTRO', label: 'Otro' },
];

const AppointmentCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate = new Date(),
  initialTime = '',
  initialOdontologo = '',
}: AppointmentCreateModalProps) => {
  const { createCita, loading, fetchHorariosDisponibles, horariosDisponibles, fetchingHorarios } = useAppointment();
  const { fetchHorarios } = useSchedule();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAttemptRef = useRef(false);

  const [pacientes, setPacientes] = useState<IPaciente[]>([]);
  const [odontologos, setOdontologos] = useState<IUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [hasFetchedHorarios, setHasFetchedHorarios] = useState(false);

  const [tieneHorariosAtencion, setTieneHorariosAtencion] = useState<boolean | null>(null);
  const [checkingHorariosAtencion, setCheckingHorariosAtencion] = useState(false);
  
  const [duracionSugerida, setDuracionSugerida] = useState<number | null>(null);

  const [formData, setFormData] = useState<ICitaCreate>({
    paciente: '',
    odontologo: initialOdontologo,
    fecha: format(initialDate, 'yyyy-MM-dd'),
    hora_inicio: initialTime,
    duracion: 30,
    tipo_consulta: 'PRIMERA_VEZ' as TipoConsulta,
    motivo_consulta: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialOdontologo && initialOdontologo !== formData.odontologo) {
      setFormData(prev => ({
        ...prev,
        odontologo: initialOdontologo
      }));
    }
  }, [initialOdontologo, formData.odontologo]);

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      setLoadingData(true);
      try {
        const pacientesData = await getPacientesActivos({ page_size: 1000 });
        setPacientes(Array.isArray(pacientesData) ? pacientesData : []);

        const usersResponse = await getUsers({ is_active: true, page_size: 1000 });
        let usersList: IUser[] = [];

        if (usersResponse && typeof usersResponse === 'object' && 'results' in usersResponse) {
          const response = usersResponse as { results: IUser[] };
          usersList = Array.isArray(response.results) ? response.results : [];
        } else if (usersResponse && typeof usersResponse === 'object' && 'data' in usersResponse) {
          const response = usersResponse as { data: { results: IUser[] } };
          if (response.data && typeof response.data === 'object' && 'results' in response.data) {
            usersList = Array.isArray(response.data.results) ? response.data.results : [];
          }
        }

        const odontologosList = usersList.filter((user: IUser) => {
          const rol = user.rol?.toLowerCase() || '';
          return rol.includes('odontologo') || rol.includes('odontólogo') || rol.includes('doctor');
        });

        if (odontologosList.length === 0) {
          toast.error('No se encontraron odontólogos activos en el sistema');
        }

        setOdontologos(odontologosList);

        if (initialOdontologo && !odontologosList.some(od => od.id === initialOdontologo)) {
          toast.error('El odontólogo pre-seleccionado no está disponible');
        }
      } catch {
        toast.error('Error al cargar pacientes u odontólogos');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isOpen, initialOdontologo]);

  useEffect(() => {
    const checkHorariosAtencion = async () => {
      if (!formData.odontologo || !isOpen) {
        setTieneHorariosAtencion(null);
        setDuracionSugerida(null);
        return;
      }

      setCheckingHorariosAtencion(true);
      try {
        console.log('🔍 Verificando horarios de atención para:', formData.odontologo);
        const horariosAtencion = await fetchHorarios({ 
          odontologo: formData.odontologo,
          activo: true 
        });
        
        const tieneHorarios = Array.isArray(horariosAtencion) && horariosAtencion.length > 0;
        console.log('✅ Horarios de atención encontrados:', tieneHorarios, horariosAtencion);
        setTieneHorariosAtencion(tieneHorarios);

        if (tieneHorarios) {
          const duracion = horariosAtencion[0]?.duracion_cita;
          if (duracion && duracion >= 15 && duracion <= 120) {
            console.log('✅ Duración sugerida encontrada:', duracion, 'minutos');
            setDuracionSugerida(duracion);
            
            setFormData(prev => ({
              ...prev,
              duracion: duracion
            }));
            
            toast.success(
              `Duración automática: ${duracion} minutos (configuración del odontólogo)`,
              { duration: 3000 }
            );
          } else {
            console.warn('⚠️ Duración inválida en horarios:', duracion);
            setDuracionSugerida(null);
          }
        } else {
          console.warn('⚠️ El odontólogo no tiene horarios de atención configurados');
          setDuracionSugerida(null);
        }
      } catch (error) {
        console.error('❌ Error al verificar horarios de atención:', error);
        setTieneHorariosAtencion(false);
        setDuracionSugerida(null);
      } finally {
        setCheckingHorariosAtencion(false);
      }
    };

    checkHorariosAtencion();
  }, [formData.odontologo, isOpen, fetchHorarios]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchHorariosDisponiblesDebounced = async () => {
      if (formData.odontologo && formData.fecha && formData.duracion &&
          formData.duracion >= 15 && formData.duracion <= 120) {
        
        try {
          console.log('🔍 Buscando horarios disponibles con:', {
            odontologo: formData.odontologo,
            fecha: formData.fecha,
            duracion: formData.duracion
          });

          await fetchHorariosDisponibles(formData.odontologo, formData.fecha, formData.duracion);
          setHasFetchedHorarios(true);
          
          console.log('✅ Búsqueda de horarios completada');
        } catch (error) {
          console.error('❌ Error fetching horarios disponibles:', error);
          setHasFetchedHorarios(true);
          
          if (error instanceof Error && error.message.includes('mayor o igual a 15')) {
            toast.error('La duración mínima es de 15 minutos');
          }
        }
      } else {
        setHasFetchedHorarios(false);
      }
    };

    const timer = setTimeout(() => {
      fetchHorariosDisponiblesDebounced();
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.odontologo, formData.fecha, formData.duracion, isOpen, fetchHorariosDisponibles]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente) newErrors.paciente = 'Seleccione un paciente';
    if (!formData.odontologo) newErrors.odontologo = 'Seleccione un odontólogo';
    if (!formData.fecha) newErrors.fecha = 'Seleccione una fecha';
    if (!formData.hora_inicio) newErrors.hora_inicio = 'Seleccione una hora';
    if (!formData.tipo_consulta) newErrors.tipo_consulta = 'Seleccione el tipo de consulta';
    if (!formData.motivo_consulta.trim()) {
      newErrors.motivo_consulta = 'Ingrese el motivo de la consulta';
    }

    if (!formData.duracion || formData.duracion < 15) {
      newErrors.duracion = 'La duración mínima es de 15 minutos';
    } else if (formData.duracion > 120) {
      newErrors.duracion = 'La duración no puede ser mayor a 120 minutos (2 horas)';
    }

    if (tieneHorariosAtencion === false) {
      newErrors.odontologo = 'El odontólogo no tiene horarios de atención configurados';
      toast.error('El odontólogo seleccionado no tiene horarios de atención configurados');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || submitAttemptRef.current) {
      console.warn('⚠️ Intento de envío duplicado bloqueado');
      return;
    }

    if (!validateForm()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    submitAttemptRef.current = true;

    try {
      console.log('📝 Enviando cita:', formData);
      await createCita(formData);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error('❌ Error al crear cita:', error);
      setIsSubmitting(false);
      submitAttemptRef.current = false;
    }
  };

  const handleClose = () => {
    setFormData({
      paciente: '',
      odontologo: initialOdontologo,
      fecha: format(initialDate, 'yyyy-MM-dd'),
      hora_inicio: initialTime,
      duracion: 30,
      tipo_consulta: 'PRIMERA_VEZ' as TipoConsulta,
      motivo_consulta: '',
      observaciones: '',
    });
    setErrors({});
    setHasFetchedHorarios(false);
    setTieneHorariosAtencion(null);
    setDuracionSugerida(null);
    
    setIsSubmitting(false);
    submitAttemptRef.current = false;
    
    onClose();
  };

  const horarios = horariosDisponibles || [];

  const shouldShowNoHorariosAtencion = 
    !checkingHorariosAtencion && 
    tieneHorariosAtencion === false && 
    formData.odontologo;

  const shouldShowNoHorariosMessage =
    !fetchingHorarios &&
    hasFetchedHorarios &&
    horarios.length === 0 &&
    formData.odontologo &&
    formData.fecha &&
    formData.duracion >= 15 &&
    formData.duracion <= 120 &&
    tieneHorariosAtencion !== false;

  const isOdontologoPreselected = Boolean(initialOdontologo);

  const isSubmitDisabled = 
    isSubmitting || 
    loading || 
    formData.duracion > 120 || 
    tieneHorariosAtencion === false ||
    checkingHorariosAtencion;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-5xl h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-blue-600" />
            Crear Nueva Cita
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complete todos los campos para agendar la cita
          </p>
        </div>

        {/* Sección: Información del Paciente */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-4">
            <UserIcon className="h-5 w-5" />
            Información del Paciente
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paciente <span className="text-red-500">*</span>
            </label>
            <select
              name="paciente"
              value={formData.paciente}
              onChange={handleChange}
              disabled={loadingData}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="">
                {loadingData ? 'Cargando pacientes...' : 'Seleccione un paciente'}
              </option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nombres} {paciente.apellidos} - {paciente.cedula_pasaporte}
                </option>
              ))}
            </select>
            {errors.paciente && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paciente}</p>
            )}
          </div>
        </div>

        {/* Sección: Información del Odontólogo */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 flex items-center gap-2 mb-4">
            <UserIcon className="h-5 w-5" />
            Odontólogo Asignado
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Odontólogo <span className="text-red-500">*</span>
            </label>
            <select
              name="odontologo"
              value={formData.odontologo}
              onChange={handleChange}
              disabled={loadingData || isOdontologoPreselected}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">
                {isOdontologoPreselected
                  ? 'Odontólogo pre-seleccionado'
                  : loadingData
                  ? 'Cargando odontólogos...'
                  : 'Seleccione un odontólogo'}
              </option>
              {odontologos.map((odontologo) => (
                <option key={odontologo.id} value={odontologo.id}>
                  Dr. {odontologo.nombres} {odontologo.apellidos}
                </option>
              ))}
            </select>
            {errors.odontologo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.odontologo}</p>
            )}
            {isOdontologoPreselected && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                ✅ Odontólogo pre-seleccionado desde el calendario
              </p>
            )}

            {checkingHorariosAtencion && formData.odontologo && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verificando horarios de atención...</span>
              </div>
            )}

            {shouldShowNoHorariosAtencion && (
              <div className="mt-3 flex items-start gap-3 text-sm text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-300 dark:border-red-700">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">⚠️ Sin horarios de atención configurados</p>
                  <p className="text-xs">
                    Este odontólogo no tiene horarios de atención configurados en el sistema. 
                    Debe configurar los horarios de atención antes de poder crear citas. 
                    Contacte al administrador o seleccione otro odontólogo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Fecha y Hora */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2 mb-4">
            <CalendarIcon className="h-5 w-5" />
            Fecha y Horario
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
              {errors.fecha && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fecha}</p>
              )}
            </div>

            {/* Duración - BLOQUEADA Y AUTOMÁTICA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duración <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(en minutos)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                  disabled={true}
                  className={`flex-1 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors cursor-not-allowed opacity-75 ${
                    duracionSugerida && formData.duracion === duracionSugerida 
                      ? 'border-green-400 dark:border-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Automático"
                />
                <span className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap ${
                  duracionSugerida && formData.duracion === duracionSugerida
                    ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200'
                    : 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200'
                }`}>
                  {formData.duracion} min
                </span>
              </div>
              {errors.duracion && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duracion}</p>
              )}
              {duracionSugerida ? (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Duración establecida automáticamente según la configuración del odontólogo
                </p>
              ) : (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Seleccione un odontólogo para establecer la duración automáticamente
                </p>
              )}
            </div>

            {/* Hora de inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora de inicio <span className="text-red-500">*</span>
              </label>
              <select
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                disabled={
                  fetchingHorarios ||
                  formData.duracion < 15 ||
                  formData.duracion > 120 ||
                  (horarios.length === 0 && hasFetchedHorarios)
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {fetchingHorarios ? (
                  <option value="">Buscando horarios disponibles...</option>
                ) : formData.duracion < 15 ? (
                  <option value="">⚠️ Duración insuficiente (mínimo 15 min)</option>
                ) : formData.duracion > 120 ? (
                  <option value="">⚠️ Duración excedida (máximo 120 min)</option>
                ) : horarios.length > 0 ? (
                  <>
                    <option value="">Seleccione una hora</option>
                    {horarios.map((horario: {hora_inicio: string, hora_fin: string}, index: number) => (
                      <option key={index} value={horario.hora_inicio}>
                        {horario.hora_inicio} - {horario.hora_fin}
                      </option>
                    ))}
                  </>
                ) : hasFetchedHorarios ? (
                  <option value="">⚠️ Sin horarios disponibles</option>
                ) : (
                  <option value="">Seleccione fecha, odontólogo y duración</option>
                )}
              </select>
              {errors.hora_inicio && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.hora_inicio}</p>
              )}
              
              {shouldShowNoHorariosMessage && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  ⚠️ El odontólogo no tiene horarios libres para esta fecha y duración. Pruebe con otra fecha, cambie la duración o seleccione otro odontólogo.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Detalles de la Consulta */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 flex items-center gap-2 mb-4">
            <DocumentTextIcon className="h-5 w-5" />
            Detalles de la Consulta
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de consulta <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo_consulta"
                value={formData.tipo_consulta}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                {TIPOS_CONSULTA.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {errors.tipo_consulta && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tipo_consulta}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo de consulta <span className="text-red-500">*</span>
              </label>
              <textarea
                name="motivo_consulta"
                value={formData.motivo_consulta}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="Describa el motivo de la consulta..."
              />
              {errors.motivo_consulta && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.motivo_consulta}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={2}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="Observaciones adicionales (opcional)..."
              />
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            📋 Información importante:
          </p>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</li>
            <li>El odontólogo debe tener horarios de atención configurados</li>
            <li>La duración se establece automáticamente según la configuración del odontólogo</li>
            <li>Verifique la disponibilidad del odontólogo antes de confirmar</li>
            <li>Las citas pueden ser canceladas hasta 24 horas antes</li>
          </ul>
        </div>

        {/* Footer con botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center gap-2"
          >
            {isSubmitting || loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creando...</span>
              </>
            ) : (
              'Crear Cita'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentCreateModal;
