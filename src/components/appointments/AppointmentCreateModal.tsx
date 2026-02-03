// frontend/src/components/appointments/AppointmentCreateModal.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type { ICitaCreate, TipoConsulta } from '../../types/appointments/IAppointment';
import type { IPaciente } from '../../types/patient/IPatient';
import type { IUser } from '../../types/user/IUser';
import { useAppointment } from '../../hooks/appointments/useAppointment';
import { useSchedule } from '../../hooks/appointments/useSchedule';
import { getUsers } from '../../services/user/userService';
import { getPacientesActivos } from '../../services/patient/patientService';
import { useAuth } from '../../hooks/auth/useAuth';
import { Modal } from '../ui/modal';
import { useNotification } from '../../context/notifications/NotificationContext';

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
  { value: 'SESION', label: 'Sesión' },
  { value: 'OTRO', label: 'Otro' },
];

// Funciones helper para roles (directamente en el componente)
const getUserRole = (user: IUser | null): string => {
  if (!user || !user.rol) return '';
  return user.rol.toLowerCase().trim();
};

const isOdontologo = (user: IUser | null): boolean => {
  const role = getUserRole(user);
  return role.includes('odontologo') || 
         role.includes('odontólogo') || 
         role.includes('doctor');
};

const isAsistente = (user: IUser | null): boolean => {
  const role = getUserRole(user);
  return role.includes('asistente') || 
         role.includes('secretaria') || 
         role.includes('administrativo') || 
         role.includes('recepcionista');
};

const isAdmin = (user: IUser | null): boolean => {
  const role = getUserRole(user);
  return role.includes('admin') || 
         role.includes('administrador') || 
         role.includes('superuser');
};

const canViewAllOdontologos = (user: IUser | null): boolean => {
  return isAsistente(user) || isAdmin(user);
};

const getOdontologoDisplayName = (odontologo: IUser): string => {
  return `Dr(a). ${odontologo.nombres} ${odontologo.apellidos}`;
};

const getOdontologoAvatarInitials = (odontologo: IUser): string => {
  return `${odontologo.nombres?.charAt(0)?.toUpperCase() || 'D'}${odontologo.apellidos?.charAt(0)?.toUpperCase() || ''}`;
};

const getPatientFullName = (patient: IPaciente): string => {
  return `${patient.nombres} ${patient.apellidos}`.trim();
};

const getPatientAvatarInitials = (patient: IPaciente): string => {
  return `${patient.nombres?.charAt(0)?.toUpperCase() || 'P'}${patient.apellidos?.charAt(0)?.toUpperCase() || ''}`;
};

const AppointmentCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate = new Date(),
  initialTime = '',
  initialOdontologo = '',
}: AppointmentCreateModalProps) => {
  const { user } = useAuth();
  const { createCita, loading, fetchHorariosDisponibles, horariosDisponibles, fetchingHorarios } = useAppointment();
  const { fetchHorarios } = useSchedule();
  const { notify } = useNotification();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAttemptRef = useRef(false);

  // ✅ NUEVO: Estados para el calendario mejorado
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isDateValid, setIsDateValid] = useState(true);
  const [dateValue, setDateValue] = useState(format(initialDate, 'yyyy-MM-dd'));

  const [pacientes, setPacientes] = useState<IPaciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<IPaciente[]>([]);
  const [odontologos, setOdontologos] = useState<IUser[]>([]);
  const [filteredOdontologos, setFilteredOdontologos] = useState<IUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [hasFetchedHorarios, setHasFetchedHorarios] = useState(false);

  const [tieneHorariosAtencion, setTieneHorariosAtencion] = useState<boolean | null>(null);
  const [checkingHorariosAtencion, setCheckingHorariosAtencion] = useState(false);
  
  const [duracionSugerida, setDuracionSugerida] = useState<number | null>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(null);
  const [selectedOdontologo, setSelectedOdontologo] = useState<IUser | null>(null);

  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  const [odontologoSearchTerm, setOdontologoSearchTerm] = useState('');
  const [isOdontologoDropdownOpen, setIsOdontologoDropdownOpen] = useState(false);

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

  const isUserOdontologo = user ? isOdontologo(user) : false;
  const userCanViewAll = user ? canViewAllOdontologos(user) : false;
  const isOdontologoPreselected = Boolean(initialOdontologo);

  // ✅ NUEVO: Fecha máxima (permite fechas futuras para citas - hasta 1 año)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const maxDateString = format(maxDate, 'yyyy-MM-dd');

  // ✅ NUEVO: Sincronizar el valor de fecha cuando cambia formData
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
    if (initialOdontologo && initialOdontologo !== formData.odontologo) {
      setFormData(prev => ({
        ...prev,
        odontologo: initialOdontologo
      }));
    }
  }, [initialOdontologo, formData.odontologo]);

  useEffect(() => {
    if (formData.paciente) {
      const paciente = pacientes.find(p => p.id === formData.paciente);
      setSelectedPaciente(paciente || null);
    } else {
      setSelectedPaciente(null);
    }
  }, [formData.paciente, pacientes]);

  useEffect(() => {
    if (formData.odontologo) {
      const odontologo = odontologos.find(o => o.id === formData.odontologo);
      setSelectedOdontologo(odontologo || null);
    } else {
      setSelectedOdontologo(null);
    }
  }, [formData.odontologo, odontologos]);

  useEffect(() => {
    if (patientSearchTerm.trim() === '') {
      setFilteredPacientes(pacientes.slice(0, 20));
    } else {
      const term = patientSearchTerm.toLowerCase();
      const filtered = pacientes.filter(paciente => {
        const fullName = getPatientFullName(paciente).toLowerCase();
        const cedula = paciente.cedula_pasaporte?.toLowerCase() || '';
        return fullName.includes(term) || cedula.includes(term);
      });
      setFilteredPacientes(filtered.slice(0, 20));
    }
  }, [patientSearchTerm, pacientes]);

  useEffect(() => {
    if (odontologoSearchTerm.trim() === '') {
      setFilteredOdontologos(odontologos.slice(0, 20));
    } else {
      const term = odontologoSearchTerm.toLowerCase();
      const filtered = odontologos.filter(odontologo => {
        const fullName = getOdontologoDisplayName(odontologo).toLowerCase();
        const email = odontologo.correo?.toLowerCase() || '';
        return fullName.includes(term) || email.includes(term);
      });
      setFilteredOdontologos(filtered.slice(0, 20));
    }
  }, [odontologoSearchTerm, odontologos]);

  const loadData = useCallback(async () => {
    if (!isOpen || !user) return;

    setLoadingData(true);
    try {
      const pacientesData = await getPacientesActivos({ page_size: 1000 });
      const pacientesList = Array.isArray(pacientesData) ? pacientesData : [];
      setPacientes(pacientesList);
      setFilteredPacientes(pacientesList.slice(0, 20));

      const isUserOdontologo = isOdontologo(user);
      const userCanViewAll = canViewAllOdontologos(user);

      let odontologosList: IUser[] = [];

      if (isUserOdontologo && !userCanViewAll) {
        odontologosList = [user];
        
        if (!initialOdontologo && !formData.odontologo) {
          setFormData(prev => ({
            ...prev,
            odontologo: user.id
          }));
        }
      } else if (userCanViewAll) {
        const usersResponse = await getUsers({ 
          is_active: true, 
          page_size: 1000 
        });
        
        let usersList: IUser[] = [];
        
        if (usersResponse && typeof usersResponse === 'object') {
          if ('results' in usersResponse) {
            usersList = Array.isArray(usersResponse.results) ? usersResponse.results : [];
          } else if ('data' in usersResponse && usersResponse.data && typeof usersResponse.data === 'object') {
            const data = usersResponse.data as { results?: IUser[] };
            usersList = Array.isArray(data.results) ? data.results : [];
          }
        }
        
        odontologosList = usersList.filter((userItem: IUser) => {
          const rol = userItem.rol?.toLowerCase() || '';
          return rol.includes('odontologo') || rol.includes('odontólogo') || rol.includes('doctor');
        });
        
        if (odontologosList.length === 0) {
          notify({
            type: 'error',
            title: 'Odontólogos no encontrados',
            message: 'No se encontraron odontólogos activos en el sistema'
          });
        }
      } else {
        notify({
          type: 'error',
          title: 'Permisos insuficientes',
          message: 'No tiene permisos para crear citas'
        });
        setOdontologos([]);
        return;
      }

      setOdontologos(odontologosList);
      setFilteredOdontologos(odontologosList.slice(0, 20));

      if (initialOdontologo && !odontologosList.some(od => od.id === initialOdontologo)) {
        notify({
          type: 'warning',
          title: 'Odontólogo no disponible',
          message: 'El odontólogo pre-seleccionado no está disponible'
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      notify({
        type: 'error',
        title: 'Error al cargar datos',
        message: 'Error al cargar datos necesarios'
      });
    } finally {
      setLoadingData(false);
    }
  }, [isOpen, initialOdontologo, user, formData.odontologo, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (isPatientDropdownOpen && !target.closest('[data-patient-dropdown-container]')) {
        setIsPatientDropdownOpen(false);
      }
      
      if (isOdontologoDropdownOpen && !target.closest('[data-odontologo-dropdown-container]')) {
        setIsOdontologoDropdownOpen(false);
      }
    };

    if (isPatientDropdownOpen || isOdontologoDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPatientDropdownOpen, isOdontologoDropdownOpen]);

  const checkHorariosAtencion = useCallback(async () => {
    if (!formData.odontologo || !isOpen || !formData.fecha) {
      setTieneHorariosAtencion(null);
      setDuracionSugerida(null);
      return;
    }

    setCheckingHorariosAtencion(true);
    try {
      const horariosAtencion = await fetchHorarios({ 
        odontologo: formData.odontologo,
        activo: true 
      });
      
      const tieneHorarios = Array.isArray(horariosAtencion) && horariosAtencion.length > 0;
      setTieneHorariosAtencion(tieneHorarios);

      if (tieneHorarios) {
        const fechaSeleccionada = new Date(formData.fecha);
        const diaSemanaSeleccionado = fechaSeleccionada.getDay();
        
        console.log(`📅 Fecha seleccionada: ${formData.fecha}, Día: ${diaSemanaSeleccionado}`);
        
        const horarioDelDia = horariosAtencion.find(horario => 
          horario.dia_semana === diaSemanaSeleccionado
        );
        
        console.log(`🔍 Horario encontrado para el día:`, horarioDelDia);
        
        let duracion = null;
        
        if (horarioDelDia) {
          duracion = horarioDelDia.duracion_cita;
          console.log(`✅ Usando duración del día específico: ${duracion} minutos`);
        } else {
          duracion = horariosAtencion[0]?.duracion_cita;
          console.log(`⚠️ No hay horario para este día, usando duración general: ${duracion} minutos`);
        }
        
        if (duracion && duracion >= 15 && duracion <= 120) {
          setDuracionSugerida(duracion);
          
          setFormData(prev => ({
            ...prev,
            duracion: duracion
          }));
        } else {
          setDuracionSugerida(null);
        }
      } else {
        setDuracionSugerida(null);
      }
    } catch (error) {
      console.error('Error al verificar horarios de atención:', error);
      setTieneHorariosAtencion(false);
      setDuracionSugerida(null);
    } finally {
      setCheckingHorariosAtencion(false);
    }
  }, [formData.odontologo, formData.fecha, isOpen, fetchHorarios]);

  useEffect(() => {
    checkHorariosAtencion();
  }, [checkHorariosAtencion]);

  const fetchHorariosDisponiblesDebounced = useCallback(async () => {
    if (formData.odontologo && formData.fecha && formData.duracion &&
        formData.duracion >= 15 && formData.duracion <= 120) {
      
      try {
        await fetchHorariosDisponibles(formData.odontologo, formData.fecha, formData.duracion);
        setHasFetchedHorarios(true);
      } catch (error) {
        console.error('Error fetching horarios disponibles:', error);
        setHasFetchedHorarios(true);
        
        if (error instanceof Error && error.message.includes('mayor o igual a 15')) {
          notify({
            type: 'error',
            title: 'Duración inválida',
            message: 'La duración mínima es de 15 minutos'
          });
        }
      }
    } else {
      setHasFetchedHorarios(false);
    }
  }, [formData.odontologo, formData.fecha, formData.duracion, fetchHorariosDisponibles, notify]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      fetchHorariosDisponiblesDebounced();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchHorariosDisponiblesDebounced, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ NUEVO: Manejo personalizado del cambio de fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    setDateValue(value);
    
    if (value > maxDateString) {
      setIsDateValid(false);
      return;
    }
    
    setIsDateValid(true);
    setFormData(prev => ({ ...prev, fecha: value }));
    
    if (errors.fecha) {
      setErrors(prev => ({ ...prev, fecha: '' }));
    }
  };

  // ✅ NUEVO: Abrir calendario al hacer clic en el ícono
  const handleCalendarIconClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  // ✅ NUEVO: Limpiar fecha
  const handleClearDate = () => {
    setDateValue('');
    setIsDateValid(true);
    setFormData(prev => ({ ...prev, fecha: '' }));
    
    if (errors.fecha) {
      setErrors(prev => ({ ...prev, fecha: '' }));
    }
  };

  const handlePatientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearchTerm(e.target.value);
    if (!isPatientDropdownOpen) {
      setIsPatientDropdownOpen(true);
    }
  };

  const clearPatientSearch = () => {
    setPatientSearchTerm('');
  };

  const handlePatientSelect = (patientId: string) => {
    setFormData(prev => ({ ...prev, paciente: patientId }));
    const patient = pacientes.find(p => p.id === patientId);
    setSelectedPaciente(patient || null);
    setIsPatientDropdownOpen(false);
  };

  const togglePatientDropdown = () => {
    if (!loadingData) {
      setIsPatientDropdownOpen(!isPatientDropdownOpen);
    }
  };

  const handleOdontologoSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOdontologoSearchTerm(e.target.value);
    if (!isOdontologoDropdownOpen) {
      setIsOdontologoDropdownOpen(true);
    }
  };

  const clearOdontologoSearch = () => {
    setOdontologoSearchTerm('');
  };

  const handleOdontologoSelect = (odontologoId: string) => {
    setFormData(prev => ({ ...prev, odontologo: odontologoId }));
    const odontologo = odontologos.find(o => o.id === odontologoId);
    setSelectedOdontologo(odontologo || null);
    setIsOdontologoDropdownOpen(false);
  };

  const toggleOdontologoDropdown = () => {
    if (!loadingData && userCanViewAll && !isOdontologoPreselected && !isUserOdontologo) {
      setIsOdontologoDropdownOpen(!isOdontologoDropdownOpen);
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
      notify({
        type: 'error',
        title: 'Horarios no configurados',
        message: 'El odontólogo seleccionado no tiene horarios de atención configurados'
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || submitAttemptRef.current) {
      return;
    }

    if (!validateForm()) {
      notify({
        type: 'error',
        title: 'Formulario incompleto',
        message: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    setIsSubmitting(true);
    submitAttemptRef.current = true;

    try {
      await createCita(formData);
      notify({
        type: 'success',
        title: 'Cita creada',
        message: 'Cita creada exitosamente'
      });
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error al crear cita:', error);
      setIsSubmitting(false);
      submitAttemptRef.current = false;
      notify({
        type: 'error',
        title: 'Error al crear cita',
        message: 'No se pudo crear la cita. Por favor, intente nuevamente.'
      });
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
    setSelectedPaciente(null);
    setSelectedOdontologo(null);
    setPatientSearchTerm('');
    setOdontologoSearchTerm('');
    setIsPatientDropdownOpen(false);
    setIsOdontologoDropdownOpen(false);
    // ✅ NUEVO: Resetear estados del calendario
    setDateValue(format(initialDate, 'yyyy-MM-dd'));
    setIsDateValid(true);
    
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

  const isSubmitDisabled = 
    isSubmitting || 
    loading || 
    formData.duracion > 120 || 
    tieneHorariosAtencion === false ||
    checkingHorariosAtencion;

  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No autenticado
          </h3>
          <p className="text-gray-600">
            Debe iniciar sesión para crear citas
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-5xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  Crear Nueva Cita
                </h2>
                <p className="text-sm text-gray-500 mt-2 ml-13">
                  Complete todos los campos para agendar la cita
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cerrar"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Indicador de permiso */}
            <div className="mt-4 ml-13">
              {isUserOdontologo && !userCanViewAll && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  👤 Modo odontólogo: Solo puede crear citas para usted mismo
                </span>
              )}
              {userCanViewAll && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  👥 Modo asistente/administrador: Puede crear citas para cualquier odontólogo
                </span>
              )}
            </div>
          </div>

          {/* Información del formulario */}
          <div className="space-y-6">
            {/* ✅ Sección: Información del Paciente - AZUL */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Información del Paciente
                </h3>
              </div>

              <div className="space-y-4">
                {/* Input de búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar paciente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={patientSearchTerm}
                      onChange={handlePatientSearch}
                      placeholder="Buscar por nombre, cédula o documento..."
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
                      onFocus={() => setIsPatientDropdownOpen(true)}
                    />
                    {patientSearchTerm && (
                      <button
                        type="button"
                        onClick={clearPatientSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Dropdown Container */}
                <div className="relative" data-patient-dropdown-container>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Paciente <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={togglePatientDropdown}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${
                      errors.paciente
                        ? "border-red-300"
                        : "border-gray-300"
                    } ${
                      loadingData
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white hover:bg-gray-50"
                    } text-gray-900`}
                    disabled={loadingData}
                  >
                    <span className={!formData.paciente ? "text-gray-500" : ""}>
                      {formData.paciente && selectedPaciente
                        ? `${getPatientFullName(selectedPaciente)} - CI: ${selectedPaciente.cedula_pasaporte}`
                        : loadingData
                        ? "Cargando pacientes..."
                        : "Seleccionar paciente..."}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${isPatientDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown con scroll */}
                  {isPatientDropdownOpen && !loadingData && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {filteredPacientes.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            {patientSearchTerm ? "No se encontraron pacientes con esa búsqueda" : "No hay pacientes disponibles"}
                          </p>
                        </div>
                      ) : (
                        filteredPacientes.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient.id)}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                              formData.paciente === patient.id
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-900"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md">
                                <span className="text-xs font-bold text-white">
                                  {getPatientAvatarInitials(patient)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${
                                  formData.paciente === patient.id ? 'text-blue-700' : ''
                                }`}>
                                  {getPatientFullName(patient)}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  CI: {patient.cedula_pasaporte} • {patient.sexo === 'M' ? '👨 Masculino' : '👩 Femenino'} • Edad: {patient.edad} {patient.condicion_edad}
                                </p>
                              </div>
                              {formData.paciente === patient.id && (
                                <svg
                                  className="h-5 w-5 text-blue-600 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {errors.paciente && (
                  <p className="mt-1 text-sm text-red-600">{errors.paciente}</p>
                )}

                {/* Mostrar información del paciente seleccionado */}
                {selectedPaciente && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium shadow-md">
                        {getPatientAvatarInitials(selectedPaciente)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getPatientFullName(selectedPaciente)}
                        </div>
                        <div className="text-sm text-gray-600">
                          CI: {selectedPaciente.cedula_pasaporte} • {selectedPaciente.sexo === 'M' ? '👨 Masculino' : '👩 Femenino'} • Edad: {selectedPaciente.edad} {selectedPaciente.condicion_edad}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Sección: Odontólogo Asignado - VERDE */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Odontólogo Asignado
                </h3>
              </div>

              <div className="space-y-4">
                {/* Input de búsqueda (solo para admin/asistente) */}
                {userCanViewAll && !isUserOdontologo && !isOdontologoPreselected && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar odontólogo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={odontologoSearchTerm}
                        onChange={handleOdontologoSearch}
                        placeholder="Buscar por nombre o correo..."
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-colors"
                        onFocus={() => setIsOdontologoDropdownOpen(true)}
                        disabled={loadingData || isOdontologoPreselected || isUserOdontologo}
                      />
                      {odontologoSearchTerm && (
                        <button
                          type="button"
                          onClick={clearOdontologoSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Dropdown Container para odontólogos */}
                <div className="relative" data-odontologo-dropdown-container>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Odontólogo <span className="text-red-500">*</span>
                    {isUserOdontologo && !userCanViewAll && (
                      <span className="ml-2 text-xs text-green-600">
                        (Asignado automáticamente)
                      </span>
                    )}
                  </label>
                  
                  {userCanViewAll && !isUserOdontologo && !isOdontologoPreselected ? (
                    // Admin/Asistente: Dropdown custom
                    <>
                      <button
                        type="button"
                        onClick={toggleOdontologoDropdown}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${
                          errors.odontologo
                            ? "border-red-300"
                            : "border-gray-300"
                        } ${
                          loadingData
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white hover:bg-gray-50"
                        } text-gray-900`}
                        disabled={loadingData || isOdontologoPreselected}
                      >
                        <span className={!formData.odontologo ? "text-gray-500" : ""}>
                          {formData.odontologo && selectedOdontologo
                            ? getOdontologoDisplayName(selectedOdontologo)
                            : loadingData
                            ? "Cargando odontólogos..."
                            : "Seleccionar odontólogo..."}
                        </span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-200 ${isOdontologoDropdownOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown con scroll */}
                      {isOdontologoDropdownOpen && !loadingData && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          {filteredOdontologos.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">
                                {odontologoSearchTerm ? "No se encontraron odontólogos con esa búsqueda" : "No hay odontólogos disponibles"}
                              </p>
                            </div>
                          ) : (
                            filteredOdontologos.map((odontologo) => (
                              <button
                                key={odontologo.id}
                                type="button"
                                onClick={() => handleOdontologoSelect(odontologo.id)}
                                className={`w-full px-4 py-3 text-left text-sm hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                  formData.odontologo === odontologo.id
                                    ? "bg-green-100 text-green-700"
                                    : "text-gray-900"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center flex-shrink-0 shadow-md">
                                    <span className="text-xs font-bold text-white">
                                      {getOdontologoAvatarInitials(odontologo)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${
                                      formData.odontologo === odontologo.id ? 'text-green-700' : ''
                                    }`}>
                                      {getOdontologoDisplayName(odontologo)}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {odontologo.correo || 'Sin correo'} • {odontologo.rol || 'Odontólogo'}
                                    </p>
                                  </div>
                                  {formData.odontologo === odontologo.id && (
                                    <svg
                                      className="h-5 w-5 text-green-600 flex-shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    // Odontólogo o modo pre-seleccionado: Select normal
                    <select
                      name="odontologo"
                      value={formData.odontologo}
                      onChange={handleChange}
                      disabled={loadingData || isOdontologoPreselected || (isUserOdontologo && !userCanViewAll)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        errors.odontologo ? 'border-red-300' : 'border-gray-300'
                      } ${loadingData ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900'}`}
                    >
                      <option value="">
                        {loadingData ? 'Cargando odontólogos...' : 
                         isUserOdontologo && !userCanViewAll ? 'Odontólogo asignado (usted)' :
                         isOdontologoPreselected ? 'Odontólogo pre-seleccionado' :
                         'Seleccione un odontólogo'}
                      </option>
                      {odontologos.map((odontologo) => (
                        <option key={odontologo.id} value={odontologo.id}>
                          {getOdontologoDisplayName(odontologo)}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {errors.odontologo && (
                    <p className="mt-1 text-sm text-red-600">{errors.odontologo}</p>
                  )}
                </div>

                {/* Información del odontólogo seleccionado */}
                {(formData.odontologo && selectedOdontologo) && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <UserIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-600 uppercase">Odontólogo seleccionado</p>
                        <p className="text-base font-semibold text-gray-900">
                          {getOdontologoDisplayName(selectedOdontologo)}
                        </p>
                        {isOdontologoPreselected && (
                          <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                            ✅ Odontólogo pre-seleccionado desde el calendario
                          </p>
                        )}
                        {isUserOdontologo && !userCanViewAll && (
                          <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                            👤 Usted está asignado como odontólogo para esta cita
                          </p>
                        )}
                        {selectedOdontologo.correo && (
                          <p className="text-xs text-gray-600 mt-1">
                            📧 {selectedOdontologo.correo}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Estado de horarios de atención */}
                    {checkingHorariosAtencion && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verificando horarios de atención...</span>
                      </div>
                    )}

                    {shouldShowNoHorariosAtencion && (
                      <div className="mt-3 flex items-start gap-3 text-sm text-red-800 bg-red-50 p-4 rounded-lg border border-red-300">
                        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">⚠️ Sin horarios de atención configurados</p>
                          <p className="text-xs">
                            Este odontólogo no tiene horarios de atención configurados en el sistema. 
                            Debe configurar los horarios de atención antes de poder crear citas.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Sección: Fecha y Hora - PÚRPURA CON CALENDARIO MEJORADO */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Fecha y Horario
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ✅ FECHA CON CALENDARIO MEJORADO */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <CalendarIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 relative">
                      <input
                        ref={dateInputRef}
                        type="date"
                        name="fecha"
                        value={dateValue}
                        onChange={handleDateChange}
                        required
                        max={maxDateString}
                        className={`w-full bg-transparent border-none focus:outline-none focus:ring-0 pr-16 appearance-none ${
                          !isDateValid || errors.fecha
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}
                        style={{
                          colorScheme: 'light',
                          cursor: 'pointer',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleCalendarIconClick}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700 focus:outline-none"
                        aria-label="Abrir selector de fecha"
                      >
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                      </button>
                      
                      {dateValue && (
                        <button
                          type="button"
                          onClick={handleClearDate}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 focus:outline-none"
                          aria-label="Limpiar fecha"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {!isDateValid && (
                    <p className="mt-1 text-xs text-red-600">
                      La fecha no puede ser superior a 1 año en el futuro
                    </p>
                  )}
                  {errors.fecha && (
                    <p className="text-sm text-red-600">{errors.fecha}</p>
                  )}
                </div>

                {/* Duración */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Duración <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <ClockIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">
                            {formData.duracion} minutos
                          </span>
                        </div>
                        <span className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-lg">
                          {formData.duracion} min
                        </span>
                      </div>
                      {duracionSugerida ? (
                        <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Duración automática según odontólogo
                        </p>
                      ) : (
                        <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Seleccione odontólogo para establecer duración
                        </p>
                      )}
                    </div>
                  </div>
                  {errors.duracion && (
                    <p className="text-sm text-red-600">{errors.duracion}</p>
                  )}
                </div>

                {/* Hora de inicio */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hora de inicio <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <ClockIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
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
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
                    >
                      {fetchingHorarios ? (
                        <option value="">Buscando horarios...</option>
                      ) : formData.duracion < 15 ? (
                        <option value="">⚠️ Duración mínima: 15 min</option>
                      ) : formData.duracion > 120 ? (
                        <option value="">⚠️ Duración máxima: 120 min</option>
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
                        <option value="">Seleccione fecha y odontólogo</option>
                      )}
                    </select>
                  </div>
                  {errors.hora_inicio && (
                    <p className="text-sm text-red-600">{errors.hora_inicio}</p>
                  )}

                  {/* Mensaje de disponibilidad */}
                  {formData.hora_inicio && horarios.length > 0 && (
                    <div className="mt-1">
                      {horarios.some(h => h.hora_inicio === formData.hora_inicio) ? (
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Hora disponible para agendar
                        </p>
                      ) : null}
                    </div>
                  )}

                  {shouldShowNoHorariosMessage && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800 mb-1">
                        ⚠️ No hay horarios disponibles para esta fecha y duración
                      </p>
                      <p className="text-xs text-amber-700">
                        Pruebe con otra fecha o cambie la duración
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Sección: Detalles de la Consulta - AMARILLO */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles de la Consulta
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de consulta <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <DocumentTextIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <select
                      name="tipo_consulta"
                      value={formData.tipo_consulta}
                      onChange={handleChange}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
                    >
                      {TIPOS_CONSULTA.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.tipo_consulta && (
                    <p className="text-sm text-red-600">{errors.tipo_consulta}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Motivo de consulta <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <DocumentTextIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <textarea
                      name="motivo_consulta"
                      value={formData.motivo_consulta}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 resize-none"
                      placeholder="Describa el motivo de la consulta..."
                    />
                  </div>
                  {errors.motivo_consulta && (
                    <p className="text-sm text-red-600">{errors.motivo_consulta}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Observaciones adicionales
                  </label>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <DocumentTextIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 resize-none"
                      placeholder="Observaciones adicionales (opcional)..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Nota informativa */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                📋 Información importante
              </h4>
              <div className="space-y-2">
                <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                  <li>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</li>
                  <li>La duración se establece automáticamente según la configuración del odontólogo</li>
                  <li>Verifique la disponibilidad antes de confirmar la cita</li>
                  <li>Las citas pueden ser canceladas hasta 24 horas antes</li>
                  <li>Haga clic en el ícono 📅 para abrir el selector de fecha</li>
                </ul>
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-300">
                  <p className="text-sm font-medium text-blue-900 mb-1">⚡ Permisos actuales:</p>
                  {isUserOdontologo && !userCanViewAll && (
                    <p className="text-sm text-green-700">
                      Como <span className="font-semibold">odontólogo</span>, solo puede crear citas para usted mismo
                    </p>
                  )}
                  {userCanViewAll && (
                    <p className="text-sm text-green-700">
                      Como <span className="font-semibold">asistente/administrador</span>, puede crear citas para cualquier odontólogo
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Botones de acción */}
          <div className="pt-6 border-t-2 border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {isSubmitting || loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  'Crear Cita'
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};


export default AppointmentCreateModal;
