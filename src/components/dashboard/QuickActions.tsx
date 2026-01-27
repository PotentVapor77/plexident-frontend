// src/components/dashboard/QuickActions.tsx
import React from 'react';
import {
  CalendarPlus,
  Heart,
  Search,
  FileText,
  Play,
  Check,
  UserPlus,
  Calendar,
  CheckCircle,
  Eye,
  Stethoscope,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuickAction {
  accion: string;
  label: string;
  icon: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: string, datos?: Record<string, unknown>) => Promise<void> | void;
  loading?: boolean;
  className?: string;
}

// ✅ Mapa de iconos mejorado
const iconMap: Record<string, React.ReactElement> = {
  'registrar_cita': <CalendarPlus className="h-5 w-5" />,
  'registrar_signos': <Heart className="h-5 w-5" />,
  'buscar_paciente': <Search className="h-5 w-5" />,
  'registrar_anamnesis': <FileText className="h-5 w-5" />,
  'iniciar_atencion': <Play className="h-5 w-5" />,
  'finalizar_cita': <Check className="h-5 w-5" />,
  'registrar_paciente': <UserPlus className="h-5 w-5" />,
  'agendar_cita': <Calendar className="h-5 w-5" />,
  'confirmar_cita': <CheckCircle className="h-5 w-5" />,
  'consultar_historial': <Stethoscope className="h-5 w-5" />,
  'citas_pendientes': <Clock className="h-5 w-5" />,
  'default': <Eye className="h-5 w-5" />,
};

// ✅ Colores temáticos para cada acción
const actionColors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  'registrar_cita': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-400 dark:hover:border-blue-600'
  },
  'registrar_signos': {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    hover: 'hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-400 dark:hover:border-red-600'
  },
  'buscar_paciente': {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-400 dark:hover:border-purple-600'
  },
  'registrar_anamnesis': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-400 dark:hover:border-amber-600'
  },
  'iniciar_atencion': {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    hover: 'hover:bg-green-100 dark:hover:bg-green-900/40 hover:border-green-400 dark:hover:border-green-600'
  },
  'finalizar_cita': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-600'
  },
  'registrar_paciente': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-600'
  },
  'agendar_cita': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/40 hover:border-cyan-400 dark:hover:border-cyan-600'
  },
  'confirmar_cita': {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    hover: 'hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:border-teal-400 dark:hover:border-teal-600'
  },
  'default': {
    bg: 'bg-gray-50 dark:bg-gray-900/30',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-800/40 hover:border-gray-400 dark:hover:border-gray-600'
  }
};

const getActionColors = (accion: string) => {
  return actionColors[accion] || actionColors.default;
};

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionClick,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("mb-6", className)}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!actions.length) {
    return null;
  }

  return (
    <div className={cn("mb-6", className)}>
      {/* Header mejorado */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Acciones Rápidas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Accede rápidamente a las funciones más utilizadas
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>{actions.length} disponibles</span>
          </div>
        </div>
      </div>

      {/* Grid de acciones mejorado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {actions.map((action) => {
          const colors = getActionColors(action.accion);
          
          return (
            <button
              key={action.accion}
              type="button"
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                "transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
                colors.bg,
                colors.border,
                colors.hover
              )}
              onClick={() => onActionClick(action.accion)}
              title={action.label}
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/50 to-transparent dark:from-white/10 pointer-events-none" />
              
              {/* Icono */}
              <div className={cn(
                "relative mb-2 p-2 rounded-lg transition-all duration-200",
                "group-hover:scale-110 group-hover:rotate-3",
                colors.text
              )}>
                {iconMap[action.icon] || iconMap.default}
              </div>
              
              {/* Label */}
              <span className={cn(
                "relative text-xs font-medium text-center leading-tight line-clamp-2",
                "text-gray-700 dark:text-gray-200"
              )}>
                {action.label}
              </span>

              {/* Indicador de hover */}
              <div className={cn(
                "absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 rounded-t-full transition-all duration-200",
                "group-hover:w-3/4",
                colors.text.replace('text-', 'bg-')
              )} />
            </button>
          );
        })}
      </div>

      {/* Info adicional en móvil */}
      <div className="sm:hidden flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>{actions.length} acciones disponibles</span>
        </div>
      </div>
    </div>
  );
};
