// frontend/src/hooks/appointments/useRecordatorio.ts

import { useState, useCallback } from 'react';
import type {
  IRecordatorioEnvio,
  IRecordatorioCita,
  IRecordatorioEstadisticas,
} from '../../types/appointments/IAppointment';
import recordatorioService from '../../services/appointments/recordatorioService';

// ✅ TIPO CORREGIDO para el retorno del service
interface IResultadoEnvio {
  exito: boolean;
  mensaje: string;
  recordatorio: IRecordatorioCita | null;
}

export const useRecordatorio = () => {
  const [loading, setLoading] = useState(false);
  const [recordatorios, setRecordatorios] = useState<IRecordatorioCita[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<IRecordatorioEstadisticas | null>(null);

  // ✅ Enviar recordatorio - TIPO CORREGIDO
  const enviarRecordatorio = useCallback(
    async (
      citaId: string,
      data: IRecordatorioEnvio
    ): Promise<IResultadoEnvio> => {
      setLoading(true);
      try {
        const resultado = await recordatorioService.enviarRecordatorio(
          citaId,
          data
        );

        return resultado;
      } catch (error) {
        console.error('❌ useRecordatorio.enviarRecordatorio - Error:', error);

        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';

       

        // ✅ Retorna resultado de error en lugar de throw
        return {
          exito: false,
          mensaje: errorMessage,
          recordatorio: null,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ✅ Obtener estadísticas - SIN any
  const fetchEstadisticas = useCallback(async (): Promise<IRecordatorioEstadisticas> => {
    setLoading(true);
    try {
      const response = await recordatorioService.obtenerEstadisticas();

      // ✅ Extraer datos SIN any - usar type guards
      let statsData: IRecordatorioEstadisticas = {
        total_enviados: 0,
        exitosos: 0,
        fallidos: 0,
        tasa_exito: 0,
        por_destinatario: { PACIENTE: 0, ODONTOLOGO: 0, AMBOS: 0 },
        ultimos_recordatorios: [],
      };

      // Si response tiene estructura {data: ...}
      if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        typeof response.data === 'object'
      ) {
        statsData = {
          total_enviados: (response.data as Partial<IRecordatorioEstadisticas>)
            ?.total_enviados ?? 0,
          exitosos: (response.data as Partial<IRecordatorioEstadisticas>)
            ?.exitosos ?? 0,
          fallidos: (response.data as Partial<IRecordatorioEstadisticas>)
            ?.fallidos ?? 0,
          tasa_exito: (response.data as Partial<IRecordatorioEstadisticas>)
            ?.tasa_exito ?? 0,
          por_destinatario:
            (response.data as Partial<IRecordatorioEstadisticas>)
              ?.por_destinatario ?? {
              PACIENTE: 0,
              ODONTOLOGO: 0,
              AMBOS: 0,
            },
          ultimos_recordatorios:
            (response.data as Partial<IRecordatorioEstadisticas>)
              ?.ultimos_recordatorios ?? [],
        };
      } else if (typeof response === 'object') {
        // Si response es directamente IRecordatorioEstadisticas
        statsData = {
          total_enviados: (response as Partial<IRecordatorioEstadisticas>)
            ?.total_enviados ?? 0,
          exitosos: (response as Partial<IRecordatorioEstadisticas>)
            ?.exitosos ?? 0,
          fallidos: (response as Partial<IRecordatorioEstadisticas>)
            ?.fallidos ?? 0,
          tasa_exito: (response as Partial<IRecordatorioEstadisticas>)
            ?.tasa_exito ?? 0,
          por_destinatario:
            (response as Partial<IRecordatorioEstadisticas>)
              ?.por_destinatario ?? {
              PACIENTE: 0,
              ODONTOLOGO: 0,
              AMBOS: 0,
            },
          ultimos_recordatorios:
            (response as Partial<IRecordatorioEstadisticas>)
              ?.ultimos_recordatorios ?? [],
        };
      }

      setEstadisticas(statsData);
      return statsData;
    } catch (error) {
      console.error('❌ useRecordatorio.fetchEstadisticas - Error:', error);

   
      // Retornar estadísticas vacías
      const emptyStats: IRecordatorioEstadisticas = {
        total_enviados: 0,
        exitosos: 0,
        fallidos: 0,
        tasa_exito: 0,
        por_destinatario: {
          PACIENTE: 0,
          ODONTOLOGO: 0,
          AMBOS: 0,
        },
        ultimos_recordatorios: [],
      };

      setEstadisticas(emptyStats);
      return emptyStats;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Resto del hook igual...
  const fetchRecordatorios = useCallback(
    async (params?: {
      cita?: string;
      tipo_recordatorio?: string;
      enviado_exitosamente?: boolean;
    }): Promise<IRecordatorioCita[]> => {
      setLoading(true);
      try {
        const lista = await recordatorioService.obtenerRecordatorios(params);
        setRecordatorios(lista);
        return lista;
      } catch (error) {
        console.error('❌ useRecordatorio.fetchRecordatorios - Error:', error);


        setRecordatorios([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchRecordatoriosPorCita = useCallback(
    async (citaId: string): Promise<IRecordatorioCita[]> => {
      setLoading(true);
      try {
        const lista = await recordatorioService.obtenerRecordatoriosPorCita(
          citaId
        );
        setRecordatorios(lista);
        return lista;
      } catch (error) {
        console.error('❌ useRecordatorio.fetchRecordatoriosPorCita - Error:', error);


        setRecordatorios([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verificarRecordatoriosEnviados = useCallback(
    async (citaId: string): Promise<boolean> => {
      try {
        return await recordatorioService.verificarRecordatoriosEnviados(
          citaId
        );
      } catch (error) {
        console.error('❌ useRecordatorio.verificarRecordatoriosEnviados - Error:', error);
        return false;
      }
    },
    []
  );

  const obtenerUltimoRecordatorioExitoso = useCallback(
    async (citaId: string): Promise<IRecordatorioCita | null> => {
      try {
        return await recordatorioService.obtenerUltimoRecordatorioExitoso(
          citaId
        );
      } catch (error) {
        console.error('❌ useRecordatorio.obtenerUltimoRecordatorioExitoso - Error:', error);
        return null;
      }
    },
    []
  );

  // Funciones helper (ajustadas al nuevo tipo)
  const enviarRecordatorioPaciente = useCallback(
    async (
      citaId: string,
      mensajePersonalizado?: string
    ): Promise<IResultadoEnvio> => {
      const data: IRecordatorioEnvio = {
        tipo_recordatorio: 'EMAIL',
        destinatario: 'PACIENTE',
        mensaje_personalizado: mensajePersonalizado || '',
      };

      return enviarRecordatorio(citaId, data);
    },
    [enviarRecordatorio]
  );

  const enviarRecordatorioOdontologo = useCallback(
    async (
      citaId: string,
      mensajePersonalizado?: string
    ): Promise<IResultadoEnvio> => {
      const data: IRecordatorioEnvio = {
        tipo_recordatorio: 'EMAIL',
        destinatario: 'ODONTOLOGO',
        mensaje_personalizado: mensajePersonalizado || '',
      };

      return enviarRecordatorio(citaId, data);
    },
    [enviarRecordatorio]
  );

  const enviarRecordatorioAmbos = useCallback(
    async (
      citaId: string,
      mensajePersonalizado?: string
    ): Promise<IResultadoEnvio> => {
      const data: IRecordatorioEnvio = {
        tipo_recordatorio: 'EMAIL',
        destinatario: 'AMBOS',
        mensaje_personalizado: mensajePersonalizado || '',
      };

      return enviarRecordatorio(citaId, data);
    },
    [enviarRecordatorio]
  );

  return {
    loading,
    recordatorios,
    estadisticas,
    enviarRecordatorio,
    fetchEstadisticas,
    fetchRecordatorios,
    fetchRecordatoriosPorCita,
    verificarRecordatoriosEnviados,
    obtenerUltimoRecordatorioExitoso,
    enviarRecordatorioPaciente,
    enviarRecordatorioOdontologo,
    enviarRecordatorioAmbos,
  };
};
