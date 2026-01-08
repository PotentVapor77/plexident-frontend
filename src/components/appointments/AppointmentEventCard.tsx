// frontend/src/components/appointments/AppointmentEventCard.tsx
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import type { ICita } from '../../types/appointments/IAppointment';

interface AppointmentEventCardProps {
  cita: ICita;
  onClick: () => void;
}

const AppointmentEventCard = ({ cita, onClick }: AppointmentEventCardProps) => {
  // Obtener colores según el estado de la cita
  const getStateColors = () => {
    const colors = {
      PROGRAMADA: {
        bg: 'bg-blue-50',
        border: 'border-l-blue-500',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800',
        hover: 'hover:bg-blue-100',
      },
      CONFIRMADA: {
        bg: 'bg-green-50',
        border: 'border-l-green-500',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800',
        hover: 'hover:bg-green-100',
      },
      ASISTIDA: {
        bg: 'bg-gray-50',
        border: 'border-l-gray-500',
        text: 'text-gray-900',
        badge: 'bg-gray-100 text-gray-800',
        hover: 'hover:bg-gray-100',
      },
      NO_ASISTIDA: {
        bg: 'bg-red-50',
        border: 'border-l-red-500',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800',
        hover: 'hover:bg-red-100',
      },
      CANCELADA: {
        bg: 'bg-orange-50',
        border: 'border-l-orange-500',
        text: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-800',
        hover: 'hover:bg-orange-100',
      },
      REPROGRAMADA: {
        bg: 'bg-purple-50',
        border: 'border-l-purple-500',
        text: 'text-purple-900',
        badge: 'bg-purple-100 text-purple-800',
        hover: 'hover:bg-purple-100',
      },
      EN_ATENCION: {
        bg: 'bg-yellow-50',
        border: 'border-l-yellow-500',
        text: 'text-yellow-900',
        badge: 'bg-yellow-100 text-yellow-800',
        hover: 'hover:bg-yellow-100',
      },
    };

    return colors[cita.estado as keyof typeof colors] || colors.PROGRAMADA;
  };

  const stateColors = getStateColors();

  return (
    <div
      onClick={onClick}
      className={`
        ${stateColors.bg} 
        ${stateColors.border} 
        ${stateColors.hover}
        border-l-4 rounded-lg p-3 mb-2 cursor-pointer 
        transition-all duration-200 
        hover:shadow-md
        group
      `}
    >
      {/* Header: Tipo de consulta y badge de estado */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${stateColors.text} mb-1`}>
            {cita.tipo_consulta_display}
          </p>
        </div>
        <span className={`
          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
          ${stateColors.badge}
          ml-2 flex-shrink-0
        `}>
          {cita.estado_display}
        </span>
      </div>

      {/* Información del paciente */}
      <div className="flex items-center mb-2">
        <UserIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${stateColors.text}`} />
        <p className={`text-sm font-medium ${stateColors.text} truncate`}>
          {cita.paciente_detalle.nombre_completo}
        </p>
      </div>

      {/* Hora */}
      <div className="flex items-center">
        <ClockIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${stateColors.text} opacity-70`} />
        <p className={`text-xs ${stateColors.text} opacity-70`}>
          {cita.hora_inicio} - {cita.hora_fin}
        </p>
      </div>

      {/* Odontólogo */}
      <div className="mt-2 pt-2 border-t border-current opacity-20">
        <p className={`text-xs ${stateColors.text} opacity-70 truncate`}>
          Dr(a). {cita.odontologo_detalle.apellidos}
        </p>
      </div>

      {/* Indicador de hover */}
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className={`text-xs ${stateColors.text} opacity-70`}>
          Click para ver detalles →
        </p>
      </div>
    </div>
  );
};

export default AppointmentEventCard;
