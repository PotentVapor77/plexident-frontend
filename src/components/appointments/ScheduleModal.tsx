// frontend/src/components/appointments/ScheduleModal.tsx

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ClockIcon,
  UserIcon,
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/modal';
import { getUsers } from '../../services/user/userService';
import type { IUser } from '../../types/user/IUser';
import type { IHorarioAtencion, IHorarioAtencionCreate } from '../../types/appointments/IAppointment';
import { useSchedule } from '../../hooks/appointments/useSchedule';
import { useNotification } from '../../context/notifications/NotificationContext';

interface IUserGroup {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOdontologoId?: string;
  selectedOdontologoName?: string;
}

const DIAS_SEMANA = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miércoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' },
];

const DURACIONES_PREDEFINIDAS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
];

// Tipo para el error de la API
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
      detail?: string;
    };
  };
}

const ScheduleModal = ({ 
  isOpen, 
  onClose, 
  selectedOdontologoId = '', 
  selectedOdontologoName = '' 
}: ScheduleModalProps) => {
  const { horarios, loading, fetchHorarios, createHorario, updateHorario, toggleActive } = useSchedule();
  const { notify } = useNotification();
  const [odontologos, setOdontologos] = useState<IUser[]>([]);
  const [loadingOdontologos, setLoadingOdontologos] = useState(false);
  const [selectedOdontologo, setSelectedOdontologo] = useState(selectedOdontologoId);
  const [showForm, setShowForm] = useState(false);
  const [showInactivos, setShowInactivos] = useState(false);
  const [editingHorario, setEditingHorario] = useState<IHorarioAtencion | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [customDuration, setCustomDuration] = useState(false);
  const [durationInputValue, setDurationInputValue] = useState('30');
  const durationInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<IHorarioAtencionCreate>({
    odontologo: selectedOdontologoId || '',
    dia_semana: 0,
    hora_inicio: '08:00',
    hora_fin: '17:00',
    duracion_cita: 30,
    activo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar odontólogos
  const loadOdontologos = useCallback(async () => {
    if (!isOpen) return;

    setLoadingOdontologos(true);
    try {
      const usersResponse = await getUsers({ is_active: true, page_size: 1000 });

      let usersList: IUser[] = [];

      if (usersResponse && typeof usersResponse === 'object') {
        if ('results' in usersResponse && Array.isArray((usersResponse as { results: IUser[] }).results)) {
          usersList = (usersResponse as { results: IUser[] }).results;
        } else if ('data' in usersResponse) {
          const dataObj = (usersResponse as { data: { results: IUser[] } }).data;
          if (dataObj && typeof dataObj === 'object' && 'results' in dataObj && Array.isArray(dataObj.results)) {
            usersList = dataObj.results;
          }
        }
      }

      const odontologosList = usersList.filter((user: IUser) => {
        if (user.rol && typeof user.rol === 'string') {
          const rol = user.rol.toLowerCase();
          return rol.includes('odontologo') || rol.includes('odontólogo') || rol.includes('doctor');
        }

        if ('es_odontologo' in user && (user as { es_odontologo?: boolean }).es_odontologo === true) {
          return true;
        }

        if ('groups' in user && Array.isArray((user as { groups?: IUserGroup[] }).groups)) {
          return (user as { groups: IUserGroup[] }).groups.some((group: IUserGroup) =>
            group.name?.toLowerCase().includes('odontologo') || group.name?.toLowerCase().includes('doctor')
          );
        }

        return false;
      });

      if (odontologosList.length === 0) {
        console.warn('⚠️ No se encontraron odontólogos activos en la respuesta', usersList);
        notify({
          type: 'error',
          title: 'Sin odontólogos',
          message: 'No se encontraron odontólogos activos'
        });
      }

      setOdontologos(odontologosList);

      if (selectedOdontologoId && !odontologosList.some(doc => doc.id === selectedOdontologoId)) {
        console.warn(`⚠️ Odontólogo con ID ${selectedOdontologoId} no encontrado en la lista cargada`);
      }
    } catch (error) {
      console.error('❌ Error loading odontologos:', error);
      notify({
        type: 'error',
        title: 'Error al cargar',
        message: 'Error al cargar odontólogos'
      });
    } finally {
      setLoadingOdontologos(false);
    }
  }, [isOpen, selectedOdontologoId, notify]);

  useEffect(() => {
    loadOdontologos();
  }, [loadOdontologos]);

  // Cargar horarios cuando se selecciona un odontólogo o se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (selectedOdontologo) {
        fetchHorarios({ odontologo: selectedOdontologo });
      } else {
        fetchHorarios();
      }
    }
  }, [selectedOdontologo, isOpen, fetchHorarios]);

  // Pre-seleccionar odontólogo si viene como prop
  useEffect(() => {
    if (selectedOdontologoId) {
      setSelectedOdontologo(selectedOdontologoId);
      setFormData(prev => ({ ...prev, odontologo: selectedOdontologoId }));
      
      const odontologo = odontologos.find(doc => doc.id === selectedOdontologoId);
      if (odontologo) {
        setSearchQuery(`Dr. ${odontologo.nombres} ${odontologo.apellidos}`);
      }
    }
  }, [selectedOdontologoId, odontologos]);

  // Filtrar odontólogos
  const filteredOdontologos = useMemo(() => {
    if (!searchQuery.trim()) return odontologos;
    
    const cleanQuery = searchQuery
      .toLowerCase()
      .replace(/^(dr\.?|dra\.?)\s*/i, '')
      .trim();
    
    if (!cleanQuery) return odontologos;

    return odontologos.filter(doc => {
      const fullName = `${doc.nombres} ${doc.apellidos}`.toLowerCase();
      const nombres = doc.nombres.toLowerCase();
      const apellidos = doc.apellidos.toLowerCase();
      
      return (
        fullName.includes(cleanQuery) ||
        nombres.includes(cleanQuery) ||
        apellidos.includes(cleanQuery)
      );
    });
  }, [odontologos, searchQuery]);

  const handleDurationChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      duracion_cita: value,
    }));
    setDurationInputValue(value.toString());
    setCustomDuration(false);

    if (errors.duracion_cita) {
      setErrors(prev => ({ ...prev, duracion_cita: '' }));
    }
  };

  const handleCustomDurationClick = () => {
    setCustomDuration(true);
    setTimeout(() => {
      durationInputRef.current?.focus();
      durationInputRef.current?.select();
    }, 10);
  };

  const handleCustomDurationSave = () => {
    const value = parseInt(durationInputValue, 10);
    
    if (isNaN(value) || value <= 0) {
      setErrors(prev => ({ ...prev, duracion_cita: 'La duración debe ser un número mayor a 0' }));
      return;
    }

    if (value > 480) {
      setErrors(prev => ({ ...prev, duracion_cita: 'La duración máxima es 480 minutos (8 horas)' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      duracion_cita: value,
    }));
    setCustomDuration(false);

    if (errors.duracion_cita) {
      setErrors(prev => ({ ...prev, duracion_cita: '' }));
    }
  };

  const handleCustomDurationCancel = () => {
    setCustomDuration(false);
    setDurationInputValue(formData.duracion_cita.toString());
  };

  const handleCustomDurationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomDurationSave();
    } else if (e.key === 'Escape') {
      handleCustomDurationCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'dia_semana' ? parseInt(value, 10) : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.odontologo) newErrors.odontologo = 'Seleccione un odontólogo';
    if (!formData.hora_inicio) newErrors.hora_inicio = 'Ingrese la hora de inicio';
    if (!formData.hora_fin) newErrors.hora_fin = 'Ingrese la hora de fin';
    if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
      newErrors.hora_fin = 'La hora de fin debe ser mayor que la hora de inicio';
    }
    if (formData.duracion_cita <= 0) newErrors.duracion_cita = 'La duración debe ser mayor a 0';
    if (formData.duracion_cita > 480) newErrors.duracion_cita = 'La duración máxima es 480 minutos (8 horas)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      notify({
        type: 'warning',
        title: 'Formulario incompleto',
        message: 'Por favor complete todos los campos correctamente'
      });
      return;
    }

    try {
      if (editingHorario) {
        await updateHorario(editingHorario.id, formData);
        notify({
          type: 'success',
          title: 'Horario actualizado',
          message: 'Horario actualizado correctamente'
        });
        setEditingHorario(null);
      } else {
        await createHorario(formData);
        notify({
          type: 'success',
          title: 'Horario creado',
          message: 'Horario creado correctamente'
        });
      }
      
      setShowForm(false);
      setFormData({
        odontologo: selectedOdontologo || '', // Usar selectedOdontologo en lugar de selectedOdontologoId
        dia_semana: 0,
        hora_inicio: '08:00',
        hora_fin: '17:00',
        duracion_cita: 30,
        activo: true,
      });
      setErrors({});
      setCustomDuration(false);
      setDurationInputValue('30');

      if (selectedOdontologo) {
        fetchHorarios({ odontologo: selectedOdontologo });
      }
    } catch (error: unknown) {
      console.error('❌ Error en handleSubmit:', error);
      
      let errorMessage = 'Error al guardar el horario';
      const apiError = error as ApiError;
      
      if (apiError?.message) {
        errorMessage = apiError.message;
      } else if (apiError?.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError?.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      } else if (apiError?.response?.data?.detail) {
        errorMessage = apiError.response.data.detail;
      }

      notify({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    }
  };

  const handleEdit = (horario: IHorarioAtencion) => {
    setEditingHorario(horario);
    setFormData({
      odontologo: horario.odontologo,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      duracion_cita: horario.duracion_cita,
      activo: horario.activo,
    });
    setDurationInputValue(horario.duracion_cita.toString());
    setShowForm(true);
    setCustomDuration(false);
    setSelectedOdontologo(horario.odontologo);
  };

  const handleCancelEdit = () => {
    setEditingHorario(null);
    setShowForm(false);
    setFormData({
      odontologo: selectedOdontologo || '',
      dia_semana: 0,
      hora_inicio: '08:00',
      hora_fin: '17:00',
      duracion_cita: 30,
      activo: true,
    });
    setErrors({});
    setCustomDuration(false);
    setDurationInputValue('30');
  };

  const handleToggleActive = async (id: string, activo: boolean) => {
    try {
      await toggleActive(id, !activo);
      
      const action = activo ? 'desactivado' : 'activado';
      const notificationType = activo ? 'warning' : 'success';
      const notificationTitle = activo ? 'Horario desactivado' : 'Horario activado';
      
      notify({
        type: notificationType,
        title: notificationTitle,
        message: `Horario ${action} correctamente`
      });
      
      if (selectedOdontologo) {
        await fetchHorarios({ odontologo: selectedOdontologo });
      }
    } catch (error: unknown) {
      console.error('❌ Error toggling active:', error);
      
      let errorMessage = 'Error al cambiar el estado del horario';
      const apiError = error as ApiError;
      
      if (apiError?.message) {
        errorMessage = apiError.message;
      } else if (apiError?.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError?.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      } else if (apiError?.response?.data?.detail) {
        errorMessage = apiError.response.data.detail;
      }

      notify({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingHorario(null);
    setFormData({
      odontologo: selectedOdontologoId || '',
      dia_semana: 0,
      hora_inicio: '08:00',
      hora_fin: '17:00',
      duracion_cita: 30,
      activo: true,
    });
    setErrors({});
    setSelectedOdontologo(selectedOdontologoId);
    setSearchQuery('');
    setShowDropdown(false);
    setCustomDuration(false);
    setDurationInputValue('30');
    setShowInactivos(false);
    onClose();
  };

  const handleSelectOdontologo = (odontologo: IUser) => {
    setSelectedOdontologo(odontologo.id);
    setSearchQuery(`Dr. ${odontologo.nombres} ${odontologo.apellidos}`);
    setShowDropdown(false);
    setFormData(prev => ({ ...prev, odontologo: odontologo.id }));
    // Si estamos en modo edición, actualizar el odontólogo del horario en edición
    if (editingHorario) {
      setFormData(prev => ({ ...prev, odontologo: odontologo.id }));
    }
  };

  const handleClearSelection = () => {
    setSelectedOdontologo('');
    setSearchQuery('');
    setShowDropdown(false);
    setFormData(prev => ({ ...prev, odontologo: '' }));
  };

  const handleToggleForm = () => {
    if (showForm && !editingHorario) {
      setShowForm(false);
    } else if (editingHorario) {
      handleCancelEdit();
    } else {
      setShowForm(true);
    }
  };

  const filteredHorarios = selectedOdontologo
    ? horarios.filter(h => h.odontologo === selectedOdontologo)
    : horarios;

  const horariosGrouped = filteredHorarios.reduce((acc, horario) => {
    const key = horario.odontologo;
    if (!acc[key]) acc[key] = [];
    acc[key].push(horario);
    return acc;
  }, {} as Record<string, IHorarioAtencion[]>);

  const getOdontologoName = (odontologoId: string): string => {
    const odontologo = odontologos.find(doc => doc.id === odontologoId);
    if (odontologo) {
      return `Dr. ${odontologo.nombres} ${odontologo.apellidos}`;
    }

    const horario = horarios.find(h => h.odontologo === odontologoId);
    if (horario?.odontologo_detalle) {
      return `Dr. ${horario.odontologo_detalle.nombres} ${horario.odontologo_detalle.apellidos}`;
    }

    return 'Odontólogo';
  };

  // Determinar si mostrar el formulario o la lista
  const shouldShowForm = showForm || editingHorario;
  const shouldShowNoSelectionMessage = !selectedOdontologo && !shouldShowForm && !loading;
  const shouldShowHorariosList = selectedOdontologo && !shouldShowForm && !loading;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCloseModal} 
      className="max-w-5xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* ✅ Header */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                Horarios de Atención
              </h2>
              <p className="text-sm text-gray-500 mt-2 ml-13">
                {selectedOdontologoName 
                  ? `Configurando horarios para ${selectedOdontologoName}` 
                  : 'Gestiona los horarios laborales de los odontólogos'}
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

        {/* ✅ Barra de búsqueda */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Buscar odontólogo
                </span>
              </div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Escribe el nombre del odontólogo..."
                  disabled={loadingOdontologos}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                />
                {selectedOdontologo && (
                  <button
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    title="Limpiar selección"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && searchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredOdontologos.length > 0 ? (
                    filteredOdontologos.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => handleSelectOdontologo(doc)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-900 block truncate">
                            Dr. {doc.nombres} {doc.apellidos}
                          </span>
                          {doc.correo && (
                            <p className="text-xs text-gray-500 truncate">{doc.correo}</p>
                          )}
                        </div>
                        {selectedOdontologo === doc.id && (
                          <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">
                        No se encontraron odontólogos con "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón principal */}
            <button
              onClick={handleToggleForm}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg ${
                shouldShowForm
                  ? 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span>
                {shouldShowForm ? 'Cancelar' : 'Crear Nuevo Horario'}
              </span>
            </button>
          </div>

          {/* Indicador de odontólogo seleccionado */}
          {selectedOdontologo && (
            <div className="mt-4 p-4 bg-white border-2 border-blue-200 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {getOdontologoName(selectedOdontologo)}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    {filteredHorarios.length} horario{filteredHorarios.length !== 1 ? 's' : ''} configurado{filteredHorarios.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearSelection}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                Cambiar
              </button>
            </div>
          )}
        </div>

        {/* ✅ Mostrar formulario cuando corresponda */}
        {shouldShowForm && (
          <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-md ${
                editingHorario 
                  ? 'bg-blue-500'
                  : 'bg-blue-600'
              }`}>
                {editingHorario ? (
                  <PencilIcon className="h-6 w-6 text-white" />
                ) : (
                  <PlusIcon className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingHorario 
                    ? `Editar horario de ${DIAS_SEMANA[editingHorario.dia_semana]?.label || 'día'}`
                    : selectedOdontologo 
                      ? `Nuevo horario` 
                      : 'Crear Nuevo Horario'}
                </h3>
                <p className="text-sm text-gray-500">
                  Completa todos los campos obligatorios (*)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mostrar select de odontólogo solo si no hay uno seleccionado */}
              {!selectedOdontologo && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-1 mb-2">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Odontólogo <span className="text-red-500">*</span>
                    </span>
                  </div>
                  <select
                    name="odontologo"
                    value={formData.odontologo}
                    onChange={handleChange}
                    disabled={loadingOdontologos || !!editingHorario}
                    className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm ${
                      errors.odontologo ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccione un odontólogo</option>
                    {odontologos.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.nombres} {doc.apellidos}
                      </option>
                    ))}
                  </select>
                  {errors.odontologo && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <XCircleIcon className="h-4 w-4" />
                      {errors.odontologo}
                    </p>
                  )}
                </div>
              )}

              {/* Si hay odontólogo seleccionado, mostrar info en lugar de select */}
              {selectedOdontologo && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-1 mb-2">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Odontólogo
                    </span>
                  </div>
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{getOdontologoName(selectedOdontologo)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Seleccionado actualmente</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Día de la semana */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Día de la semana <span className="text-red-500">*</span>
                  </span>
                </div>
                <div className="relative">
                  <select
                    name="dia_semana"
                    value={formData.dia_semana}
                    onChange={handleChange}
                    className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white shadow-sm"
                  >
                    {DIAS_SEMANA.map(dia => (
                      <option key={dia.value} value={dia.value}>
                        {dia.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Duración de cita */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Duración de cita <span className="text-red-500">*</span>
                  </span>
                </div>
                
                {customDuration ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        ref={durationInputRef}
                        type="number"
                        value={durationInputValue}
                        onChange={(e) => setDurationInputValue(e.target.value)}
                        onKeyDown={handleCustomDurationKeyDown}
                        min="1"
                        max="480"
                        step="1"
                        className="w-full p-3.5 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                        placeholder="Escribe los minutos"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        min
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCustomDurationSave}
                      className="p-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                      title="Guardar duración personalizada"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCustomDurationCancel}
                      className="p-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow-sm"
                      title="Cancelar"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Opciones predefinidas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DURACIONES_PREDEFINIDAS.map(dur => (
                        <button
                          key={dur.value}
                          type="button"
                          onClick={() => handleDurationChange(dur.value)}
                          className={`p-3 rounded-xl border-2 transition-all font-medium ${
                            formData.duracion_cita === dur.value
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <span className="text-sm">{dur.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Display actual + botón editar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 p-3.5 bg-white border-2 border-gray-300 rounded-xl shadow-sm">
                          <ClockIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-900 font-semibold">
                            {formData.duracion_cita} minutos
                          </span>
                          <span className="text-gray-400 ml-auto text-sm">
                            {formData.duracion_cita >= 60 
                              ? `(${Math.floor(formData.duracion_cita / 60)}h ${formData.duracion_cita % 60}m)`
                              : ''
                            }
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCustomDurationClick}
                        className="p-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-colors flex items-center gap-2 shadow-sm"
                        title="Editar duración manualmente"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                
                {errors.duracion_cita && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <XCircleIcon className="h-4 w-4" />
                    {errors.duracion_cita}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  Duración máxima: 480 minutos (8 horas)
                </p>
              </div>

              {/* Hora de inicio */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Hora de inicio <span className="text-red-500">*</span>
                  </span>
                </div>
                <input
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm ${
                    errors.hora_inicio ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.hora_inicio && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <XCircleIcon className="h-4 w-4" />
                    {errors.hora_inicio}
                  </p>
                )}
              </div>

              {/* Hora de fin */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Hora de fin <span className="text-red-500">*</span>
                  </span>
                </div>
                <input
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm ${
                    errors.hora_fin ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.hora_fin && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <XCircleIcon className="h-4 w-4" />
                    {errors.hora_fin}
                  </p>
                )}
              </div>

              {/* Estado activo */}
              <div className="md:col-span-2">
                <div className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="activo"
                      name="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg"
                    />
                  </div>
                  <label htmlFor="activo" className="ml-3 flex-1">
                    <span className="text-sm font-semibold text-gray-900">Horario activo</span>
                    <p className="text-xs text-gray-500">
                      Los horarios inactivos no estarán disponibles para agendar citas
                    </p>
                  </label>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    formData.activo 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {formData.activo ? 'ACTIVO' : 'INACTIVO'}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones del formulario */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md ${
                  editingHorario
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </span>
                ) : (
                  editingHorario ? 'Actualizar Horario' : 'Guardar Horario'
                )}
              </button>
            </div>
          </form>
        )}

        {/* ✅ Mensaje cuando no hay odontólogo seleccionado */}
        {shouldShowNoSelectionMessage && (
          <div className="text-center py-16 bg-blue-50 rounded-2xl border-2 border-blue-200 shadow-sm">
            <div className="inline-flex items-center justify-center h-20 w-20 bg-blue-600 rounded-2xl mb-5 shadow-lg">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Selecciona un odontólogo
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8 px-4">
              Para ver o gestionar horarios, primero selecciona un odontólogo usando el buscador
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
              <div className="h-px w-12 bg-gray-300"></div>
              <span className="font-medium">o</span>
              <div className="h-px w-12 bg-gray-300"></div>
            </div>
            <p className="text-sm text-gray-500 mt-8 px-4">
              Haz clic en <strong className="text-blue-600">"Crear Nuevo Horario"</strong> para comenzar desde cero
            </p>
          </div>
        )}

        {/* ✅ Lista de Horarios cuando hay odontólogo seleccionado */}
        {shouldShowHorariosList && (
          <div className="min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="h-16 w-16 border-4 border-blue-200 rounded-full"></div>
                  <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
                </div>
                <p className="text-gray-600 mt-4 font-medium">Cargando horarios...</p>
                <p className="text-sm text-gray-400 mt-1">Por favor espera</p>
              </div>
            ) : filteredHorarios.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <div className="inline-flex items-center justify-center h-20 w-20 bg-gray-100 rounded-2xl mb-5">
                  <CalendarDaysIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No hay horarios registrados
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6 px-4">
                  Este odontólogo aún no tiene horarios configurados
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md font-semibold"
                >
                  <PlusIcon className="h-5 w-5" />
                  Crear primer horario
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    Horarios Configurados
                  </h3>
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                    {filteredHorarios.length} total
                  </span>
                </div>

                {/* ✅ CONTENEDOR CON SCROLL */}
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
                  {Object.entries(horariosGrouped).map(([odontologoId, horariosOdontologo]) => {
                    const odontologoName = getOdontologoName(odontologoId);
                    const horariosActivos = horariosOdontologo.filter(h => h.activo);
                    const horariosInactivos = horariosOdontologo.filter(h => !h.activo);

                    return (
                      <div key={odontologoId} className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-gray-200">
                        {/* Header de odontólogo */}
                        <div className="bg-blue-50 p-6 border-b-2 border-blue-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                <UserIcon className="h-7 w-7 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{odontologoName}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                                    <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
                                    {horariosOdontologo.length} día{horariosOdontologo.length !== 1 ? 's' : ''}
                                  </span>
                                  <span className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    {horariosActivos.length} activo{horariosActivos.length !== 1 ? 's' : ''}
                                  </span>
                                  {horariosInactivos.length > 0 && (
                                    <span className="text-sm text-red-600 flex items-center gap-1.5 font-medium">
                                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                                      {horariosInactivos.length} inactivo{horariosInactivos.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowForm(true)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md font-semibold"
                            >
                              <PlusIcon className="h-4 w-4" />
                              Agregar
                            </button>
                          </div>
                        </div>

                        {/* Lista de horarios */}
                        <div className="p-6">
                          {/* ✅ Botón para mostrar/ocultar inactivos */}
                          {horariosInactivos.length > 0 && (
                            <div className="mb-4">
                              <button
                                onClick={() => setShowInactivos(!showInactivos)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                              >
                                {showInactivos ? (
                                  <>
                                    <EyeSlashIcon className="h-4 w-4" />
                                    Ocultar horarios inactivos ({horariosInactivos.length})
                                  </>
                                ) : (
                                  <>
                                    <EyeIcon className="h-4 w-4" />
                                    Mostrar horarios ocultos ({horariosInactivos.length})
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(showInactivos ? horariosOdontologo : horariosActivos).map((horario) => {
                              const diaInfo = DIAS_SEMANA.find(d => d.value === horario.dia_semana);
                              const diaLabel = diaInfo?.label || horario.dia_semana_display || `Día ${horario.dia_semana}`;
                              const horaInicio = horario.hora_inicio;
                              const horaFin = horario.hora_fin;

                              return (
                                <div 
                                  key={horario.id} 
                                  className={`bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                                    horario.activo 
                                      ? 'border-blue-200 hover:border-blue-300' 
                                      : 'border-red-200 bg-red-50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <CalendarDaysIcon className={`h-5 w-5 ${horario.activo ? 'text-blue-600' : 'text-red-500'}`} />
                                      <h4 className="font-bold text-gray-900">{diaLabel}</h4>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                      horario.activo 
                                        ? 'bg-green-100 text-green-800 border border-green-300' 
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                    }`}>
                                      {horario.activo ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                  </div>

                                  <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                      <ClockIcon className={`h-4 w-4 ${horario.activo ? 'text-gray-400' : 'text-red-400'}`} />
                                      <span className="text-gray-700 font-medium">
                                        {horaInicio} - {horaFin}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <div className="h-4 w-4 flex items-center justify-center">
                                        <div className={`h-2 w-2 rounded-full ${horario.activo ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                      </div>
                                      <span className="text-gray-600">
                                        Citas de <strong className={horario.activo ? 'text-blue-600' : 'text-red-600'}>{horario.duracion_cita} min</strong>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                                    <button
                                      onClick={() => handleEdit(horario)}
                                      className="flex-1 px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                      title="Editar horario"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      Editar
                                    </button>
                                    
                                    <button
                                      onClick={() => handleToggleActive(horario.id, horario.activo)}
                                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                        horario.activo
                                          ? 'bg-red-500 text-white hover:bg-red-600'
                                          : 'bg-green-500 text-white hover:bg-green-600'
                                      }`}
                                      title={horario.activo ? 'Desactivar horario' : 'Activar horario'}
                                    >
                                      {horario.activo ? 'Desactivar' : 'Activar'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ScheduleModal;