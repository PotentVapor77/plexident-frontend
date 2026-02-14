// src/services/odontogram/cpoService.ts

import api from '../api/axiosInstance';

export interface CPOIndices {
  C: number;
  P: number;
  O: number;
  total: number;
}

export interface CPOIndicesTemporales {
  c: number;
  e: number;
  o: number;
  total: number;
}

export interface CPOResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    permanente: CPOIndices;
    temporal: CPOIndicesTemporales;
  };
  errors: null;
}

export interface CPOServiceConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export const CPOService = {
  /**
   * Obtiene los índices CPO de un paciente desde el backend
   * Con manejo mejorado de errores y timeout
   */
  async getIndices(
    pacienteId: string, 
    config: CPOServiceConfig = {}
  ): Promise<CPOIndices | null> {
    const { timeout = 25000, retries = 1, retryDelay = 1000 } = config;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await api.get<CPOResponse>(
          `/odontogram/pacientes/${pacienteId}/indices-cpo-ceo/`,
          {
            timeout,
            // AbortController para poder cancelar la petición si es necesario
            signal: config.timeout ? AbortSignal.timeout(timeout) : undefined
          }
        );
        
        if (response.data?.success && response.data?.data?.permanente) {
          return response.data.data.permanente;
        }
        
        // Si la respuesta no tiene el formato esperado
        console.warn('Respuesta de índices CPO con formato inesperado:', response.data);
        return null;
        
      } catch (error: any) {
        const isLastAttempt = attempt === retries;
        
        // Log detallado del error
        console.error(
          `[Intento ${attempt + 1}/${retries + 1}] Error obteniendo índices CPO:`,
          {
            pacienteId,
            errorName: error.name,
            errorMessage: error.message,
            statusCode: error.statusCode || error.response?.status,
            isTimeout: error.code === 'ECONNABORTED' || error.message?.includes('timeout')
          }
        );

        // Errores que no deberían reintentarse
        if (!isLastAttempt) {
          const isNetworkError = !error.response && error.message?.includes('Network');
          const isTimeoutError = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
          const isServerError = error.response?.status >= 500;
          
          // Solo reintentar en ciertos tipos de error
          if (isNetworkError || isTimeoutError || isServerError) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
        }

        // Si es el último intento o error no reintentable
        if (isLastAttempt) {
          // Devolver null en lugar de lanzar error para no romper la UI
          // Registrar el error pero no propagarlo
          console.warn(
            'No se pudieron cargar los índices CPO guardados, usando cálculo local:',
            error.message
          );
          return null;
        }
      }
    }
    
    return null;
  },

  /**
   * Calcula índices CPO localmente (sin guardar)
   * Útil para mostrar cambios en tiempo real
   * Versión optimizada y con validaciones mejoradas
   */
  calculateLocalIndices(odontogramaData: any, categorias: any[]): CPOIndices {
    const indices: CPOIndices = {
      C: 0,
      P: 0,
      O: 0,
      total: 0,
    };

    // Validaciones tempranas
    if (!odontogramaData || typeof odontogramaData !== 'object' || !categorias?.length) {
      return indices;
    }

    // Cachear categorías por ID y nombre para búsqueda más rápida
    const categoriaMap = new Map();
    categorias.forEach(cat => {
      const catId = cat.id?.toLowerCase() || '';
      const catNombre = cat.nombre?.toLowerCase() || '';
      categoriaMap.set(catId, cat);
      categoriaMap.set(catNombre, cat);
    });

    // Cachear diagnósticos por categoría
    const diagnosticosPorCategoria = new Map();
    categorias.forEach(cat => {
      if (cat.diagnosticos?.length) {
        cat.diagnosticos.forEach((diag: any) => {
          if (diag.id) {
            diagnosticosPorCategoria.set(diag.id, cat);
          }
        });
      }
    });

    // Función auxiliar optimizada para verificar categoría
    const isDiagnosisInCategory = (diagnosticoKey: string, categoriaKey: string): boolean => {
      if (!diagnosticoKey || !categoriaKey) return false;
      
      // Búsqueda directa en el mapa de diagnósticos
      const categoria = diagnosticosPorCategoria.get(diagnosticoKey);
      if (categoria) {
        const catId = categoria.id?.toLowerCase() || '';
        const catNombre = categoria.nombre?.toLowerCase() || '';
        return catId.includes(categoriaKey.toLowerCase()) || 
               catNombre.includes(categoriaKey.toLowerCase());
      }
      
      // Fallback a búsqueda por categoría
      const categoriaEncontrada = categoriaMap.get(categoriaKey.toLowerCase()) ||
        Array.from(categoriaMap.values()).find(cat => 
          cat.id?.toLowerCase().includes(categoriaKey.toLowerCase()) ||
          cat.nombre?.toLowerCase().includes(categoriaKey.toLowerCase())
        );
      
      if (!categoriaEncontrada) return false;
      
      return categoriaEncontrada.diagnosticos?.some((diag: any) => diag.id === diagnosticoKey) || false;
    };

    // Dientes permanentes FDI (11-48)
    const dientesPermanentes = Object.entries(odontogramaData)
      .filter(([fdi]) => {
        const num = parseInt(fdi, 10);
        return !isNaN(num) && num >= 11 && num <= 48;
      })
      .map(([fdi]) => fdi);

    // Para cada diente permanente
    dientesPermanentes.forEach(fdi => {
      const toothData = odontogramaData[fdi];
      if (!toothData || typeof toothData !== 'object') return;

      // Obtener todos los diagnósticos del diente de manera más eficiente
      const allDiagnoses: any[] = [];
      Object.values(toothData).forEach(caraData => {
        if (Array.isArray(caraData)) {
          allDiagnoses.push(...caraData);
        }
      });
      
      let tieneCaries = false;
      let tieneObturado = false;
      let tienePerdida = false;

      // Verificar cada diagnóstico
      for (const diag of allDiagnoses) {
        if (!diag) continue;
        
        const diagKey = diag.key || diag.procedimientoId || diag.id;
        if (!diagKey) continue;
        
        const diagKeyLower = diagKey.toLowerCase();
        
        // 1. Caries - optimizado con early exit
        if (!tieneCaries && diagKey === 'caries') {
          if (isDiagnosisInCategory(diagKey, 'patologia_activa')) {
            tieneCaries = true;
            continue;
          }
        }
        
        // 2. Pérdida por caries - optimizado con early exit
        if (!tienePerdida && 
            ['extraccion_indicada', 'extraccion_otra_causa', 'perdida_otra_causa', 'ausente']
              .includes(diagKeyLower)) {
          if (
            isDiagnosisInCategory(diagKeyLower, 'tratamiento_realizado') ||
            isDiagnosisInCategory(diagKeyLower, 'ausencia')
          ) {
            tienePerdida = true;
            continue;
          }
        }
        
        // 3. Obturado - optimizado con early exit
        if (!tieneObturado && 
            ['obturacion', 'sellante_realizado', 'corona_realizada', 'protesis_fija_realizada', 'protesis_removible_realizada']
              .includes(diagKeyLower)) {
          if (isDiagnosisInCategory(diagKeyLower, 'tratamiento_realizado')) {
            tieneObturado = true;
          }
        }
      }

      // Reglas de prioridad para CPO (en orden de prioridad)
      if (tienePerdida) {
        indices.P += 1;
      } else if (tieneCaries) {
        indices.C += 1;
      } else if (tieneObturado) {
        indices.O += 1;
      }
    });

    indices.total = indices.C + indices.P + indices.O;
    
    return indices;
  },

  /**
   * Versión memoizada del cálculo local para evitar recalcular
   * cuando los datos no han cambiado
   */
  createMemoizedCalculator() {
    let lastData: any = null;
    let lastCategorias: any = null;
    let lastResult: CPOIndices | null = null;
    
    return (odontogramaData: any, categorias: any[]): CPOIndices => {
      // Verificar si los datos son los mismos
      if (lastData === odontogramaData && lastCategorias === categorias && lastResult) {
        return lastResult;
      }
      
      // Recalcular y cachear
      lastData = odontogramaData;
      lastCategorias = categorias;
      lastResult = this.calculateLocalIndices(odontogramaData, categorias);
      return lastResult;
    };
  }
};