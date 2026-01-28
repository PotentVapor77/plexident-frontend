// src/services/dashboard/dashboardService.ts
import { dashboardApi } from './dashboardApi';
import { logger } from '../../utils/logger';
import type { 
  AccesoRapido, 
  DashboardResponse, 
  OverviewResponse, 
  KPIsResponse,
  CitasStatsResponse,
  DiagnosticosFrecuentesResponse
} from '../../types/dashboard/IDashboard';
import { getPeriodosPredefinidos } from '../../lib/dashboardUtils';

interface DashboardFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  periodo?: string;
}

interface CitasStatsFilters {
  fecha_inicio: string;
  fecha_fin: string;
}

interface DiagnosticosFrecuentesFilters {
  fecha_inicio: string;
  fecha_fin: string;
  limit?: number;
}

class DashboardService {
  /**
   * ✅ Normaliza los nombres de gráficos según el rol
   */
  private normalizeGraficosNames(graficos: any, rol: string): Record<string, any[]> {
    if (!graficos || typeof graficos !== 'object') {
      console.log('⚠️ Graficos es null o no es objeto');
      return {};
    }

    console.log('🔄 Normalizando nombres de gráficos:', {
      rol,
      graficosOriginales: graficos,
      keys: Object.keys(graficos)
    });

    // ✅ Si ya viene como objeto con los nombres correctos, retornar directamente
    const normalized: Record<string, any[]> = {};

    Object.entries(graficos).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        normalized[key] = value;
        console.log(`  ✅ Gráfico agregado: ${key} (${value.length} items)`);
      }
    });

    console.log('✅ Gráficos normalizados:', {
      keys: Object.keys(normalized),
      graficos: normalized
    });

    return normalized;
  }

  /**
   * Obtiene las estadísticas del dashboard con manejo robusto de errores
   */
  async getDashboardStats(filters?: DashboardFilters): Promise<DashboardResponse> {
    try {
      logger.info('Obteniendo estadísticas del dashboard', { filters });
      
      let data: any;
      try {
        data = await dashboardApi.getDashboardStats(filters);
        
        console.log('🔍 DATOS RECIBIDOS DEL BACKEND:', {
          allKeys: Object.keys(data),
          rol: data.rol,
          graficosKeys: data.graficos ? Object.keys(data.graficos) : [],
          graficosValue: data.graficos,
        });
        
      } catch (apiError) {
        logger.warn('Error en API, usando datos de respaldo', { error: apiError });
        return this.getDatosRespaldo();
      }

      // ✅ Verificar estructura básica
      if (!data || !data.rol || !data.metricas) {
        logger.warn('Respuesta del API incompleta, usando datos de respaldo');
        return this.getDatosRespaldo();
      }

      // ✅ NORMALIZAR NOMBRES DE GRÁFICOS
      data.graficos = this.normalizeGraficosNames(data.graficos, data.rol);

      // ✅ Asegurar propiedades opcionales
      data.tablas = data.tablas || {};
      data.listas = data.listas || {};
      data.analiticas = data.analiticas || {};
      data.accesos_rapidos = data.accesos_rapidos || this.getAccesosRapidosPorRol(data.rol);

      console.log('📊 DATOS FINALES DESPUÉS DE NORMALIZAR:', {
        rol: data.rol,
        graficosKeys: Object.keys(data.graficos),
        tieneDistribucionEstados: !!data.graficos.distribucion_estados,
        tieneDiagnosticosFrecuentes: !!data.graficos.diagnosticos_frecuentes,
        tieneEvolucionCitas: !!data.graficos.evolucion_citas,
        tieneCitasPorDia: !!data.graficos.citas_por_dia,
      });

      return data;
    } catch (error) {
      logger.error('Error crítico en getDashboardStats:', error);
      return this.getDatosRespaldo();
    }
  }

  /**
   * ✅ NUEVO: Limpia el caché del dashboard
   */
  clearCache(): void {
    console.log('🧹 Limpiando caché del dashboard');
    // Aquí puedes agregar lógica adicional si usas localStorage o sessionStorage
  }

  /**
   * Datos de respaldo para cuando el API falla
   */
  private getDatosRespaldo(): DashboardResponse {
    const hoy = new Date();
    return {
      rol: 'Administrador',
      metricas: {
        total_pacientes: 0,
        pacientes_activos: 0,
        signos_vitales_hoy: 0,
        citas_hoy: 0,
        citas_semana: 0,
        periodo_activo: 'hoy',
        fecha_inicio: hoy.toISOString().split('T')[0],
        fecha_fin: hoy.toISOString().split('T')[0]
      },
      graficos: {
        distribucion_estados: [],
        diagnosticos_frecuentes: [],
        evolucion_citas: [],
        citas_por_dia: [],
        citas_por_odontologo: [],
        motivos_consulta_frecuentes: [],
        distribucion_genero: []
      },
      tablas: {
        ultimas_citas: [],
        pacientes_recientes: [],
        usuarios_sistema: [],
        top_diagnosticos: []
      },
      listas: {
        mis_citas: [],
        pacientes_condiciones: [],
        pacientes_sin_consulta: [],
        pacientes_sin_anamnesis: [],
        citas_del_dia: [],
        ultimos_signos: [],
        pacientes_sin_signos: []
      },
      analiticas: {
        diagnosticos_por_diente: {}
      },
      accesos_rapidos: this.getAccesosRapidosPorRol('Administrador'),
      timestamp: hoy.toISOString(),
      usuario: {
        username: 'usuario_actual',
        nombre_completo: 'Usuario Actual'
      }
    };
  }

  private getAccesosRapidosPorRol(rol: string): AccesoRapido[] {
    const accesosComunes: AccesoRapido[] = [
      { accion: 'registrar_cita', label: 'Nueva Cita', icon: 'registrar_cita' },
      { accion: 'buscar_paciente', label: 'Buscar Paciente', icon: 'buscar_paciente' },
      { accion: 'registrar_paciente', label: 'Nuevo Paciente', icon: 'registrar_paciente' }
    ];

    if (rol === 'Odontologo') {
      return [
        ...accesosComunes,
        { accion: 'iniciar_atencion', label: 'Iniciar Atención', icon: 'iniciar_atencion' },
        { accion: 'registrar_anamnesis', label: 'Anamnesis', icon: 'registrar_anamnesis' }
      ];
    }

    if (rol === 'Asistente') {
      return [
        ...accesosComunes,
        { accion: 'registrar_signos', label: 'Signos Vitales', icon: 'registrar_signos' },
        { accion: 'confirmar_cita', label: 'Confirmar Cita', icon: 'confirmar_cita' }
      ];
    }

    return accesosComunes;
  }

  async getOverview(): Promise<OverviewResponse> {
    try {
      const data = await dashboardApi.getOverview();
      if (!data) {
        const hoy = new Date();
        return {
          total_pacientes: 0,
          pacientes_activos: 0,
          citas_hoy: 0,
          signos_vitales_hoy: 0,
          rol: 'Administrador',
          timestamp: hoy.toISOString()
        };
      }
      return data;
    } catch (error) {
      logger.error('Error al obtener vista general:', error);
      const hoy = new Date();
      return {
        total_pacientes: 0,
        pacientes_activos: 0,
        citas_hoy: 0,
        signos_vitales_hoy: 0,
        rol: 'Administrador',
        timestamp: hoy.toISOString()
      };
    }
  }

  async getPeriodosDisponibles(): Promise<Array<{
    label: string;
    fecha_inicio: string;
    fecha_fin: string;
    periodo: string;
  }>> {
    try {
      const data = await dashboardApi.getPeriodosDisponibles();
      if (data?.periodos) {
        return Object.values(data.periodos);
      }
      return getPeriodosPredefinidos();
    } catch (error) {
      logger.warn('Usando periodos locales por error en API', error);
      return getPeriodosPredefinidos();
    }
  }

  async getKPIs(periodo?: string): Promise<KPIsResponse> {
    try {
      return await dashboardApi.getKPIs(periodo);
    } catch (error) {
      logger.error('Error obteniendo KPIs:', error);
      throw error;
    }
  }

  async getCitasStats(filters: CitasStatsFilters): Promise<CitasStatsResponse> {
    try {
      return await dashboardApi.getCitasStats(filters);
    } catch (error) {
      logger.error('Error obteniendo estadísticas de citas:', error);
      throw error;
    }
  }

  async getDiagnosticosFrecuentes(filters: DiagnosticosFrecuentesFilters): Promise<DiagnosticosFrecuentesResponse> {
    try {
      return await dashboardApi.getDiagnosticosFrecuentes(filters);
    } catch (error) {
      logger.error('Error obteniendo diagnósticos frecuentes:', error);
      throw error;
    }
  }

  async ejecutarAccionRapida(accion: string, datos?: Record<string, unknown>): Promise<void> {
    logger.info('Ejecutando acción rápida', { accion, datos });
    console.log(`Acción rápida ejecutada: ${accion}`, datos);
  }
}

export const dashboardService = new DashboardService();
