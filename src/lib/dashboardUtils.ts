// src/lib/dashboardUtils.ts

import type { PeriodoFiltro } from "../types/dashboard/IDashboard";

// ✅✅✅ FUNCIÓN MEJORADA PARA FORMATEAR FECHAS SIN PROBLEMAS DE TIMEZONE ✅✅✅
export const formatDate = (date: Date | string): string => {
  try {
    if (!date) return '-';
    
    let fecha: Date;
    
    if (typeof date === 'string') {
      // ✅ Si es YYYY-MM-DD, parsear manualmente para evitar timezone
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        fecha = new Date(year, month - 1, day, 12, 0, 0);
      } 
      // Si tiene hora (ISO completo)
      else if (date.includes('T') || date.includes('Z')) {
        fecha = new Date(date);
      }
      // Otro formato
      else {
        fecha = new Date(date);
      }
    } else {
      fecha = date;
    }
    
    if (isNaN(fecha.getTime())) {
      return String(date);
    }
    
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formateando fecha:', date, error);
    return String(date);
  }
};

// ✅✅✅ FUNCIÓN PARA FORMATEAR FECHA CORTA (sin año si es del año actual) ✅✅✅
export const formatDateShort = (date: Date | string): string => {
  try {
    if (!date) return '-';
    
    let fecha: Date;
    
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        fecha = new Date(year, month - 1, day, 12, 0, 0);
      } else {
        fecha = new Date(date);
      }
    } else {
      fecha = date;
    }
    
    if (isNaN(fecha.getTime())) {
      return String(date);
    }
    
    const currentYear = new Date().getFullYear();
    const includeYear = fecha.getFullYear() !== currentYear;
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      ...(includeYear && { year: 'numeric' })
    });
  } catch (error) {
    console.error('Error formateando fecha:', date, error);
    return String(date);
  }
};

// ✅✅✅ FUNCIÓN PARA FORMATEAR HORA ✅✅✅
export const formatTime = (time: string): string => {
  try {
    if (!time) return '-';
    
    // Si es solo hora (HH:MM:SS o HH:MM)
    if (time.match(/^\d{2}:\d{2}/)) {
      return time.substring(0, 5);
    }
    
    // Si viene con fecha completa ISO
    if (time.includes('T')) {
      const fecha = new Date(time);
      return fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return time;
  } catch (error) {
    console.error('Error formateando hora:', time, error);
    return time;
  }
};

// Función para obtener fecha local en formato YYYY-MM-DD
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Obtener fecha de hace N días (local)
export const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getLocalDateString(date);
};

// Formatear porcentaje
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Formatear número con separadores
export const formatNumber = (value: number): string => {
  return value.toLocaleString('es-ES');
};

// Obtener color según estado
export const getEstadoColor = (estado: string): string => {
  const estadoLower = estado.toLowerCase();
  
  if (estadoLower.includes('asistida') || estadoLower.includes('confirmada')) {
    return '#10B981'; // Verde
  }
  if (estadoLower.includes('programada')) {
    return '#3B82F6'; // Azul
  }
  if (estadoLower.includes('atención')) {
    return '#F59E0B'; // Amarillo
  }
  if (estadoLower.includes('cancelada')) {
    return '#EF4444'; // Rojo
  }
  if (estadoLower.includes('no asistida')) {
    return '#6B7280'; // Gris
  }
  return '#9CA3AF'; // Gris default
};

// Obtener icono según métrica
export const getMetricIcon = (metricKey: string): string => {
  const icons: Record<string, string> = {
    'total_pacientes': '👥',
    'pacientes_activos': '✅',
    'citas_hoy': '📅',
    'citas_semana': '📊',
    'promedio_citas_diarias': '📈',
    'signos_vitales_hoy': '❤️',
    'citas_asistidas_hoy': '✓',
    'citas_en_atencion_hoy': '⏳',
    'odontologos_activos': '👨‍⚕️',
    'mis_pacientes_atendidos': '🦷',
    'pacientes_con_condiciones': '⚠️',
    'pacientes_atendidos_hoy': '👤',
    'citas_registradas_hoy': '📝',
  };
  
  return icons[metricKey] || '📊';
};

// Obtener título para métrica
export const getMetricTitle = (metricKey: string): string => {
  const titles: Record<string, string> = {
    'total_pacientes': 'Total Pacientes',
    'pacientes_activos': 'Pacientes Activos',
    'citas_hoy': 'Citas Hoy',
    'citas_semana': 'Citas Semana',
    'promedio_citas_diarias': 'Promedio Diario',
    'total_pacientes_activos': 'Pacientes Activos',
    'citas_asistidas_hoy': 'Asistidas Hoy',
    'citas_en_atencion_hoy': 'En Atención',
    'signos_vitales_hoy': 'Signos Vitales',
    'odontologos_activos': 'Odontólogos',
    'mis_pacientes_atendidos': 'Mis Pacientes',
    'pacientes_con_condiciones': 'Con Condiciones',
    'pacientes_atendidos_hoy': 'Atendidos Hoy',
    'citas_registradas_hoy': 'Registradas Hoy',
  };
  
  return titles[metricKey] || metricKey.replace(/_/g, ' ').toUpperCase();
};

// Obtener periodos predefinidos USANDO HORA LOCAL
export const getPeriodosPredefinidos = (): PeriodoFiltro[] => {
  const hoy = new Date();
  
  // Función auxiliar para fecha local
  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Fecha actual
  const hoyStr = toLocalDateString(hoy);
  
  // Inicio de semana (lunes)
  const inicioSemana = new Date(hoy);
  const diaSemana = inicioSemana.getDay();
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicioSemana.setDate(hoy.getDate() + diffLunes);
  
  // Fin de semana (domingo)
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  
  // Inicio del mes
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  
  // Fin del mes
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  
  // Inicio del trimestre
  const mesActual = hoy.getMonth();
  const trimestre = Math.floor(mesActual / 3);
  const mesInicioTrimestre = trimestre * 3;
  const inicioTrimestre = new Date(hoy.getFullYear(), mesInicioTrimestre, 1);
  
  // Inicio del año
  const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
  const finAnio = new Date(hoy.getFullYear(), 11, 31);
  
  return [
    {
      label: 'Hoy',
      fecha_inicio: hoyStr,
      fecha_fin: hoyStr,
      periodo: 'hoy'
    },
    {
      label: 'Semana Actual',
      fecha_inicio: toLocalDateString(inicioSemana),
      fecha_fin: toLocalDateString(finSemana),
      periodo: 'semana_actual'
    },
    {
      label: 'Mes Actual',
      fecha_inicio: toLocalDateString(inicioMes),
      fecha_fin: toLocalDateString(finMes),
      periodo: 'mes_actual'
    },
    {
      label: 'Trimestre Actual',
      fecha_inicio: toLocalDateString(inicioTrimestre),
      fecha_fin: hoyStr,
      periodo: 'trimestre_actual'
    },
    {
      label: 'Año Actual',
      fecha_inicio: toLocalDateString(inicioAnio),
      fecha_fin: toLocalDateString(finAnio),
      periodo: 'anio_actual'
    }
  ];
};

// Validar rango de fechas
export const isValidDateRange = (fechaInicio: string, fechaFin: string): boolean => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return inicio <= fin;
};

// Calcular diferencia en días
export const getDiasDiferencia = (fechaInicio: string, fechaFin: string): number => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
