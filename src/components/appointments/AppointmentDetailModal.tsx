// frontend/src/components/appointments/AppointmentDetailModal.tsx

import { useState } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ICita } from '../../types/appointments/IAppointment';
import { useAppointment } from '../../hooks/appointments/useAppointment';
import AppointmentRescheduleModal from './AppointmentRescheduleModal';
import { useNotification } from '../../context/notifications/NotificationContext';
import RecordatorioSendModal from './RecordatorioSendModal';
import HistorialModal from './HistorialModal';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cita: ICita;
  onUpdate?: () => void;
}

const AppointmentDetailModal = ({
  isOpen,
  onClose,
  cita,
  onUpdate,
}: AppointmentDetailModalProps) => {
  const { cancelarCita, cambiarEstadoCita, deleteCita, loading } = useAppointment();
  const { notify } = useNotification();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showRecordatorioModal, setShowRecordatorioModal] = useState(false);
  const { fetchHistorialCita, historialCita } = useAppointment();
  const [showHistorial, setShowHistorial] = useState(false);
  const [loadingHistorial] = useState(false); 
  const getEstadoBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      PROGRAMADA: 'bg-blue-100 text-blue-800',
      
      CONFIRMADA: 'bg-green-100 text-green-800',
      ASISTIDA: 'bg-gray-100 text-gray-800',
      NO_ASISTIDA: 'bg-red-100 text-red-800',
      CANCELADA: 'bg-orange-100 text-orange-800',
      REPROGRAMADA: 'bg-purple-100 text-purple-800',
      EN_ATENCION: 'bg-yellow-100 text-yellow-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const handleCancelar = async () => {
    if (!motivoCancelacion.trim()) {
      notify({
        type: 'error',
        title: 'Motivo requerido',
        message: 'Ingrese el motivo de cancelación'
      });
      return;
    }

    try {
      await cancelarCita(cita.id, motivoCancelacion);
      notify({
        type: 'success',
        title: 'Cita cancelada',
        message: 'Cita cancelada exitosamente'
      });
      setShowCancelConfirm(false);
      setMotivoCancelacion('');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      notify({
        type: 'error',
        title: 'Error al cancelar',
        message: 'Error al cancelar la cita'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCita(cita.id);
      notify({
        type: 'success',
        title: 'Cita eliminada',
        message: 'Cita eliminada exitosamente'
      });
      setShowDeleteConfirm(false);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      notify({
        type: 'error',
        title: 'Error al eliminar',
        message: 'Error al eliminar la cita'
      });
    }
  };

  const handleConfirmar = async () => {
    try {
      await cambiarEstadoCita(cita.id, 'CONFIRMADA');
      notify({
        type: 'success',
        title: 'Cita confirmada',
        message: 'Cita confirmada exitosamente'
      });
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      notify({
        type: 'error',
        title: 'Error al confirmar',
        message: 'Error al confirmar la cita'
      });
    }
  };

  // Agregar función para cargar historial
  const handleVerHistorial = async () => {
    await fetchHistorialCita(cita.id);
    setShowHistorial(true);
  };

  const handleMarcarAsistida = async () => {
    try {
      await cambiarEstadoCita(cita.id, 'ASISTIDA');
      notify({
        type: 'success',
        title: 'Cita marcada como asistida',
        message: 'Cita marcada como asistida'
      });
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error al marcar como asistida:', error);
      notify({
        type: 'error',
        title: 'Error al marcar',
        message: 'Error al marcar como asistida'
      });
    }
  };

  const handleMarcarNoAsistida = async () => {
    try {
      await cambiarEstadoCita(cita.id, 'NO_ASISTIDA');
      notify({
        type: 'success',
        title: 'Cita marcada como no asistida',
        message: 'Cita marcada como no asistida'
      });
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error al marcar como no asistida:', error);
      notify({
        type: 'error',
        title: 'Error al marcar',
        message: 'Error al marcar como no asistida'
      });
    }
  };

  const handleIniciarAtencion = async () => {
    try {
      await cambiarEstadoCita(cita.id, 'EN_ATENCION');
      notify({
        type: 'success',
        title: 'Atención iniciada',
        message: 'Atención iniciada correctamente'
      });
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error al iniciar atención:', error);
      notify({
        type: 'error',
        title: 'Error al iniciar',
        message: 'Error al iniciar atención'
      });
    }
  };

  const handleRescheduleSuccess = () => {
    if (onUpdate) onUpdate();
    onClose();
  };

  // ==========================================
  // BOTONES POR ESTADO
  // ==========================================

  // Estado: PROGRAMADA 🟡
  const renderButtonsPROGRAMADA = () => (
    <>
      {/* Primera fila: Confirmar, Reprogramar, Recordatorio y Cancelar */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {/* ✅ Confirmar cita */}
        <button
          onClick={handleConfirmar}
          disabled={loading}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 rounded-lg hover:from-green-600 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Confirmar Cita
        </button>

        {/* 🔄 Reprogramar */}
        <button
          onClick={() => setShowRescheduleModal(true)}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-md"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Reprogramar
        </button>

        {/* 📧 Recordatorio */}
        <button
          onClick={() => setShowRecordatorioModal(true)}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg hover:from-indigo-600 hover:to-indigo-800 transition-all shadow-md"
        >
          <EnvelopeIcon className="h-5 w-5 mr-2" />
          Recordatorio
        </button>

        {/* ❌ Cancelar cita */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 rounded-lg hover:from-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          <XCircleIcon className="h-5 w-5 mr-2" />
          Cancelar Cita
        </button>
      </div>

      {/* Segunda fila: Eliminar y Cerrar */}
      <div className="flex justify-center gap-3">
        {/* 🗑️ Eliminar */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-red-700 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Eliminar
        </button>

        {/* 🔒 Cerrar */}
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cerrar
        </button>
      </div>
    </>
  );

  // Estado: CONFIRMADA 🟢
  const renderButtonsCONFIRMADA = () => (
    <>
      {/* Primera fila: Iniciar atención, Reprogramar, Recordatorio y Cancelar */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {/* ▶️ Iniciar atención */}
        <button
          onClick={handleIniciarAtencion}
          disabled={loading}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-lg hover:from-yellow-600 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          <PlayCircleIcon className="h-5 w-5 mr-2" />
          Iniciar Atención
        </button>

        {/* 🔄 Reprogramar */}
        <button
          onClick={() => setShowRescheduleModal(true)}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-md"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Reprogramar
        </button>

        {/* 📧 Recordatorio */}
        <button
          onClick={() => setShowRecordatorioModal(true)}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg hover:from-indigo-600 hover:to-indigo-800 transition-all shadow-md"
        >
          <EnvelopeIcon className="h-5 w-5 mr-2" />
          Recordatorio
        </button>

        {/* ❌ Cancelar cita */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 rounded-lg hover:from-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          <XCircleIcon className="h-5 w-5 mr-2" />
          Cancelar Cita
        </button>
      </div>

      {/* Segunda fila: Eliminar y Cerrar */}
      <div className="flex justify-center gap-3">
        {/* 🗑️ Eliminar */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-red-700 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Eliminar
        </button>

        {/* 🔒 Cerrar */}
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cerrar
        </button>
      </div>
    </>
  );

  // Estado: EN_ATENCION 🟠 (estado crítico)
  const renderButtonsEN_ATENCION = () => (
    <div className="flex justify-center gap-3">
      {/* ✔️ Marcar asistida (finaliza atención) */}
      <button
        onClick={handleMarcarAsistida}
        disabled={loading}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 rounded-lg hover:from-green-600 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
      >
        <CheckCircleIcon className="h-5 w-5 mr-2" />
        Marcar Asistida
      </button>

      {/* 🚫 No asistió */}
      <button
        onClick={handleMarcarNoAsistida}
        disabled={loading}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 rounded-lg hover:from-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
      >
        <XCircleIcon className="h-5 w-5 mr-2" />
        No Asistió
      </button>

      {/* 🔒 Cerrar */}
      <button
        onClick={onClose}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
      >
        Cerrar
      </button>
    </div>
  );

  // Estado: ASISTIDA 🟢
  const renderButtonsASISTIDA = () => (
    <div className="flex justify-center gap-3">
      {/* 🔄 Reprogramar (para seguimiento) */}
      <button
        onClick={() => setShowRescheduleModal(true)}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-md"
      >
        <ArrowPathIcon className="h-5 w-5 mr-2" />
        Reprogramar
      </button>

    

      {/* 🗑️ Eliminar */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-red-700 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <TrashIcon className="h-5 w-5 mr-2" />
        Eliminar
      </button>

      {/* 🔒 Cerrar */}
      <button
        onClick={onClose}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
      >
        Cerrar
      </button>
    </div>
  );

  // Estado: NO_ASISTIDA 🔴
  const renderButtonsNO_ASISTIDA = () => (
    <div className="flex justify-center gap-3">
      {/* 🔄 Reprogramar */}
      <button
        onClick={() => setShowRescheduleModal(true)}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-md"
      >
        <ArrowPathIcon className="h-5 w-5 mr-2" />
        Reprogramar
      </button>

    

      {/* 🗑️ Eliminar */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-red-700 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <TrashIcon className="h-5 w-5 mr-2" />
        Eliminar
      </button>

      {/* 🔒 Cerrar */}
      <button
        onClick={onClose}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
      >
        Cerrar
      </button>
    </div>
  );

  // Estado: REPROGRAMADA 🟣
  const renderButtonsREPROGRAMADA = () => (
    <div className="flex justify-center gap-3">
      {/* Confirmar */}
      <button
        onClick={handleConfirmar}
        disabled={loading}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 rounded-lg hover:from-green-600 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
      >
        <CheckCircleIcon className="h-5 w-5 mr-2" />
        Confirmar Cita
      </button>

      {/* 📧 Recordatorio */}
      <button
        onClick={() => setShowRecordatorioModal(true)}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg hover:from-indigo-600 hover:to-indigo-800 transition-all shadow-md"
      >
        <EnvelopeIcon className="h-5 w-5 mr-2" />
        Recordatorio
      </button>

      {/* ❌ Cancelar cita */}
      <button
        onClick={() => setShowCancelConfirm(true)}
        disabled={loading}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 rounded-lg hover:from-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
      >
        <XCircleIcon className="h-5 w-5 mr-2" />
        Cancelar Cita
      </button>

      {/* 🗑️ Eliminar */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-red-700 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <TrashIcon className="h-5 w-5 mr-2" />
        Eliminar
      </button>

      {/* 🔒 Cerrar */}
      <button
        onClick={onClose}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
      >
        Cerrar
      </button>
    </div>
  );

  // Estado: CANCELADA 🟠
  const renderButtonsCANCELADA = () => (
    <div className="flex justify-center gap-3">
      {/* 🔄 Reprogramar */}
      <button
        onClick={() => setShowRescheduleModal(true)}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-md"
      >
        <ArrowPathIcon className="h-5 w-5 mr-2" />
        Reprogramar
      </button>

      {/* 📧 Recordatorio */}
      <button
        onClick={() => setShowRecordatorioModal(true)}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg hover:from-indigo-600 hover:to-indigo-800 transition-all shadow-md"
      >
        <EnvelopeIcon className="h-5 w-5 mr-2" />
        Recordatorio
      </button>

      {/* 🗑️ Eliminar */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-red-700 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <TrashIcon className="h-5 w-5 mr-2" />
        Eliminar
      </button>

      {/* 🔒 Cerrar */}
      <button
        onClick={onClose}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
      >
        Cerrar
      </button>
    </div>
  );

  // Función principal para renderizar botones según estado
  const renderButtonsByEstado = () => {
    switch (cita.estado) {
      case 'PROGRAMADA':
        return renderButtonsPROGRAMADA();
      case 'CONFIRMADA':
        return renderButtonsCONFIRMADA();
      case 'EN_ATENCION':
        return renderButtonsEN_ATENCION();
      case 'ASISTIDA':
        return renderButtonsASISTIDA();
      case 'NO_ASISTIDA':
        return renderButtonsNO_ASISTIDA();
      case 'REPROGRAMADA':
        return renderButtonsREPROGRAMADA();
      case 'CANCELADA':
        return renderButtonsCANCELADA();
      default:
        return (
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cerrar
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-3xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-6">

          {/* Header */}
<div className="pb-4 border-b border-gray-200">
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
          <CalendarIcon className="h-6 w-6 text-white" />
        </div>
        Detalles de la Cita
      </h2>
      <p className="text-sm text-gray-500 mt-2 ml-13">
        ID: #{cita.id}
      </p>
    </div>
    
    <div className="flex items-center gap-3">
      <button
        onClick={handleVerHistorial}
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow hover:shadow-md"
      >
        <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" />
        Ver Historial
      </button>
      
      <button
        onClick={onClose}
        className="inline-flex items-center justify-center p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Cerrar modal"
      >
        <XCircleIcon className="h-5 w-5" />
      </button>
    </div>
  </div>

  {showHistorial && historialCita && (
    <HistorialModal
      isOpen={showHistorial}
      onClose={() => setShowHistorial(false)}
      historialCita={historialCita}
      loading={loadingHistorial} 
    />
  )}

  {/* Estado */}
  <div className="mt-4 ml-13">
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getEstadoBadgeColor(cita.estado)}`}>
      {cita.estado_display}
    </span>
  </div>
</div>


          

          {/* Información de la cita */}
          <div className="space-y-6">
            {/* ✅ Sección: Fecha y Hora - AZUL */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Fecha y Horario
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
  <p className="text-xs font-medium text-blue-600 uppercase mb-1">
    Fecha
  </p>
  <p className="text-base font-semibold text-gray-900">
    {format(new Date(cita.fecha + 'T12:00:00'), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
  </p>
</div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase mb-1">
                      Horario
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {cita.hora_inicio} - {cita.hora_fin}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Duración: {cita.duracion} minutos
                    </p>
                  </div>
                </div>

              
                
              </div>
            </div>

            {/* ✅ Sección: Información del Paciente - VERDE */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Información del Paciente
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombre completo</p>
                    <p className="text-base font-semibold text-gray-900">
                      {cita.paciente_detalle.nombre_completo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CI/Pasaporte</p>
                    <p className="text-base font-medium text-gray-900">
                      {cita.paciente_detalle.cedula_pasaporte}
                    </p>
                  </div>
                </div>

                {cita.paciente_detalle.telefono && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <PhoneIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-base font-medium text-gray-900">
                        {cita.paciente_detalle.telefono}
                      </p>
                    </div>
                  </div>
                )}

                {cita.paciente_detalle.correo && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <EnvelopeIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Correo electrónico</p>
                      <p className="text-base font-medium text-gray-900">
                        {cita.paciente_detalle.correo}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Sección: Información del Odontólogo - PÚRPURA */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Odontólogo Asignado
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Doctor(a)</p>
                    <p className="text-base font-semibold text-gray-900">
                      Dr(a). {cita.odontologo_detalle.nombre_completo}
                    </p>
                  </div>
                </div>

                {cita.odontologo_detalle.correo && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <EnvelopeIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Correo</p>
                      <p className="text-base font-medium text-gray-900">
                        {cita.odontologo_detalle.correo}
                      </p>
                    </div>
                  </div>
                )}
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
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Tipo de consulta
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {cita.tipo_consulta_display}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Motivo de la consulta
                  </p>
                  <p className="text-base text-gray-900">
                    {cita.motivo_consulta}
                  </p>
                </div>

                {cita.observaciones && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Observaciones
                    </p>
                    <p className="text-base text-gray-900">
                      {cita.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Confirmación de Cancelación */}
          {showCancelConfirm && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-orange-900 mb-4">
                Cancelar Cita
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de cancelación *
                </label>
                <textarea
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Ingrese el motivo de la cancelación..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setMotivoCancelacion('');
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          )}

          {/* ✅ Confirmación de Eliminación */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-red-900 mb-2">
                Eliminar Cita
              </h4>
              <p className="text-sm text-red-700 mb-4">
                ¿Está seguro que desea eliminar esta cita? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Eliminando...' : 'Eliminar Cita'}
                </button>
              </div>
            </div>
          )}

          {/* ✅ BOTONES POR ESTADO */}
          {!showCancelConfirm && !showDeleteConfirm && (
            <div className="pt-6 border-t-2 border-gray-200">
              {renderButtonsByEstado()}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Reprogramación */}
      {showRescheduleModal && (
        <AppointmentRescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          cita={cita}
          onRescheduleSuccess={handleRescheduleSuccess}
        />
      )}

      {/* Modal de Recordatorio */}
      {showRecordatorioModal && (
        <RecordatorioSendModal
          isOpen={showRecordatorioModal}
          onClose={() => setShowRecordatorioModal(false)}
          citaId={cita.id}
          onSuccess={() => {
            notify({
              type: 'success',
              title: 'Recordatorio enviado',
              message: 'El recordatorio se ha enviado exitosamente'
            });
            if (onUpdate) onUpdate();
            setShowRecordatorioModal(false);
          }}
        />
      )}
    </>
  );
};

export default AppointmentDetailModal;