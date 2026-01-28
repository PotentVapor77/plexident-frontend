// src/components/dashboard/DashboardMetrics.tsx

import React from 'react';
import Badge from '../ui/badge/Badge';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import { 
  Users, 
  Calendar, 
  CalendarDays,
  Heart, 
  UserCheck, 
  Stethoscope, 
  FileText, 
  TrendingUp, 
  Activity, 
  UserMinus
} from 'lucide-react';
import type { DashboardMetricas } from '../../types/dashboard/IDashboard';

interface DashboardMetricsProps {
  metricas?: DashboardMetricas;
  rol?: string;
  loading?: boolean;
}

// ✅✅✅ TIPO PARA VALORES DE MÉTRICAS ✅✅✅
type MetricValue = number | string | Record<string, unknown> | undefined;

// ✅✅✅ FUNCIÓN PARA EXTRAER VALOR NUMÉRICO (SIN any) ✅✅✅
const extractNumericValue = (value: MetricValue): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Si es un objeto o undefined, retornar 0
  return 0;
};

// ✅✅✅ FUNCIÓN PARA FORMATEAR FECHA LOCAL ✅✅✅
const formatFechaLocal = (fechaStr: string): string => {
  try {
    // ✅ SIEMPRE parsear como YYYY-MM-DD local (nunca usar new Date(string))
    let year: number, month: number, day: number;
    
    if (fechaStr.includes('T') || fechaStr.includes('Z')) {
      // Si tiene timezone, convertir a local
      const date = new Date(fechaStr);
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
    } else {
      // Si es YYYY-MM-DD, parsear directo
      [year, month, day] = fechaStr.split('-').map(Number);
    }
    
    if (!year || !month || !day) return fechaStr;
    
    // ✅ Crear fecha en zona horaria local (sin usar constructor Date(string))
    const date = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas
    
    if (isNaN(date.getTime())) return fechaStr;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short'
    });
  } catch (error) {
    console.error('Error formateando fecha:', fechaStr, error);
    return fechaStr;
  }
};

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  metricas, 
  rol, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"></div>
            <div className="mt-5 flex items-end justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
                <div className="mt-2 h-8 bg-gray-200 rounded dark:bg-gray-700 w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ✅✅✅ SOLO 3 MÉTRICAS PRINCIPALES POR ROL ✅✅✅
  const getMetricasPorRol = () => {
    const metricasPorRol: Record<string, Array<{
      key: keyof DashboardMetricas;
      label: string;
      subtitle?: string;
    }>> = {
      Administrador: [
        { 
          key: 'pacientes_activos', 
          label: 'Pacientes Activos',
          subtitle: 'Últimos 30 días'
        },
        { 
          key: 'citas_hoy', 
          label: 'Citas Hoy',
          subtitle: 'Para el día de hoy'
        },
        { 
          key: 'citas_semana', 
          label: 'Citas Semana',
          subtitle: 'Esta semana'
        },
      ],
      Odontologo: [
        { 
          key: 'pacientes_activos', 
          label: 'Pacientes Activos',
          subtitle: 'Últimos 30 días'
        },
        { 
          key: 'citas_hoy', 
          label: 'Mis Citas Hoy',
          subtitle: 'Mis citas de hoy'
        },
        { 
          key: 'citas_semana', 
          label: 'Mis Citas Semana',
          subtitle: 'Mis citas esta semana'
        },
      ],
      Asistente: [
        { 
          key: 'pacientes_activos', 
          label: 'Pacientes Activos',
          subtitle: 'Total activos'
        },
        { 
          key: 'citas_hoy', 
          label: 'Citas Hoy',
          subtitle: 'Total programadas'
        },
        { 
          key: 'signos_vitales_hoy', 
          label: 'Signos Vitales',
          subtitle: 'Registrados hoy'
        },
      ],
    };

    return metricasPorRol[rol as keyof typeof metricasPorRol] || metricasPorRol.Asistente;
  };

  // ✅ Iconos para las métricas
  const iconMap: Record<string, React.ReactNode> = {
    'pacientes_activos': <UserCheck className="text-gray-800 size-6 dark:text-white/90" />,
    'citas_hoy': <Calendar className="text-gray-800 size-6 dark:text-white/90" />,
    'citas_semana': <CalendarDays className="text-gray-800 size-6 dark:text-white/90" />,
    'signos_vitales_hoy': <Heart className="text-gray-800 size-6 dark:text-white/90" />,
    
    // Iconos secundarios
    'total_pacientes': <Users className="text-gray-800 size-6 dark:text-white/90" />,
    'mis_pacientes_atendidos': <Stethoscope className="text-gray-800 size-6 dark:text-white/90" />,
    'pacientes_con_condiciones': <Activity className="text-gray-800 size-6 dark:text-white/90" />,
    'pacientes_inactivos': <UserMinus className="text-gray-800 size-6 dark:text-white/90" />,
    'pacientes_sin_anamnesis': <FileText className="text-gray-800 size-6 dark:text-white/90" />,
    'citas_mes': <TrendingUp className="text-gray-800 size-6 dark:text-white/90" />,
    'mis_citas_mes': <Calendar className="text-gray-800 size-6 dark:text-white/90" />,
    'mis_citas_hoy': <Calendar className="text-gray-800 size-6 dark:text-white/90" />,
    'citas_en_atencion_hoy': <Activity className="text-gray-800 size-6 dark:text-white/90" />,
    'pacientes_atendidos_hoy': <UserCheck className="text-gray-800 size-6 dark:text-white/90" />,
    'citas_registradas_hoy': <Calendar className="text-gray-800 size-6 dark:text-white/90" />,
    'citas_programadas_hoy': <Calendar className="text-gray-800 size-6 dark:text-white/90" />,
  };

  // ✅✅✅ OBTENER SUBTÍTULO DINÁMICO SEGÚN EL PERIODO SELECCIONADO ✅✅✅
  // ✅ CORREGIDO: Acepta keyof DashboardMetricas y lo convierte a string
  const getSubtitle = (key: keyof DashboardMetricas, defaultSubtitle?: string): string => {
    // Convertir key a string para comparaciones
    const keyStr = String(key);
    
    // 1️⃣ PACIENTES ACTIVOS - Siempre fijo
    if (keyStr === 'pacientes_activos') {
      return 'Últimos 30 días';
    }

    // 2️⃣ CITAS HOY - Siempre mostrar la fecha de hoy
    if (keyStr === 'citas_hoy') {
      const info = metricas?.info_citas_hoy;
      
      if (!info) {
        return defaultSubtitle || '';
      }
      
      // Si tiene la propiedad 'label' (formato corto), usarla
      if ('label' in info && info.label) {
        return info.label;
      }
      
      // Si tiene 'fecha', formatearla
      if ('fecha' in info && info.fecha) {
        return formatFechaLocal(info.fecha);
      }
      
      return defaultSubtitle || '';
    }

    // 3️⃣ CITAS SEMANA - Mostrar según el periodo del filtro
    if (keyStr === 'citas_semana') {
      const periodoActivo = metricas?.periodo_activo;
      const periodoInfo = metricas?.periodo_info;
      
      // ✅ Si el periodo activo NO es "semana", usar el label del periodo del filtro
      if (periodoActivo && periodoActivo !== 'semana' && periodoActivo !== 'semana_actual') {
        if (periodoInfo?.label) {
          return periodoInfo.label;
        }
      }
      
      // ✅ Si el periodo es "semana", usar el rango de la semana fija
      const infoSemana = metricas?.info_semana;
      
      if (!infoSemana) {
        return defaultSubtitle || '';
      }
      
      // Si tiene la propiedad 'label' (formato corto), usarla
      if ('label' in infoSemana && infoSemana.label) {
        return infoSemana.label;
      }
      
      // Si tiene inicio y fin, formatearlas
      if ('inicio' in infoSemana && 'fin' in infoSemana && infoSemana.inicio && infoSemana.fin) {
        const inicioFormateado = formatFechaLocal(infoSemana.inicio);
        const finFormateado = formatFechaLocal(infoSemana.fin);
        return `${inicioFormateado} - ${finFormateado}`;
      }
      
      return defaultSubtitle || '';
    }

    // 4️⃣ SIGNOS VITALES HOY
    if (keyStr === 'signos_vitales_hoy') {
      const info = metricas?.info_citas_hoy;
      
      if (!info) {
        return defaultSubtitle || '';
      }
      
      if ('label' in info && info.label) {
        return info.label;
      }
      
      if ('fecha' in info && info.fecha) {
        return formatFechaLocal(info.fecha);
      }
      
      return defaultSubtitle || '';
    }
    
    return defaultSubtitle || '';
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {getMetricasPorRol().map((item) => {
        // ✅✅✅ EXTRAER VALOR NUMÉRICO CORRECTAMENTE ✅✅✅
        const rawValue = metricas?.[item.key];
        const value = extractNumericValue(rawValue);
        const icon = iconMap[String(item.key)];
        const subtitle = getSubtitle(item.key, item.subtitle);
        
        // ✅ Generar tendencia aleatoria (o puedes recibirla del backend)
        const trendValue = Math.random() > 0.5 ? 11.01 : -9.05;
        const isPositive = trendValue > 0;
        
        return (
          <div 
            key={String(item.key)} 
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Icono */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
              {icon}
            </div>

            {/* Contenido */}
            <div className="flex items-end justify-between mt-5">
              <div className="flex-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {item.label}
                </span>
                {subtitle && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {subtitle}
                  </p>
                )}
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {value.toLocaleString()}
                </h4>
              </div>
              
              {/* Badge de tendencia */}
              <Badge 
                color={isPositive ? "success" : "error"} 
                variant="light"
                startIcon={isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              >
                {Math.abs(trendValue)}%
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMetrics;
