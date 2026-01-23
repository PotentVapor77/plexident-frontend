// src/services/odontogram/cpoService.ts

import api from '../api/axiosInstance';
import { createApiError } from '../../types/api';

export interface CPOIndices {
  C: number;
  P: number;
  O: number;
  total: number;
}

export interface CPOResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    permanente: CPOIndices;
    temporal: {
      c: number;
      e: number;
      o: number;
      total: number;
    };
  };
  errors: null;
}

export const CPOService = {
  /**
   * Obtiene los índices CPO de un paciente desde el backend
   */
  async getIndices(pacienteId: string): Promise<CPOIndices | null> {
    try {
      const response = await api.get<CPOResponse>(
        `/odontogram/pacientes/${pacienteId}/indices-cpo-ceo/`
      );
      
      if (response.data.success) {
        return response.data.data.permanente;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo índices CPO:', error);
      throw createApiError(error);
    }
  },

  /**
   * Calcula índices CPO localmente (sin guardar)
   * Útil para mostrar cambios en tiempo real
   */
  calculateLocalIndices(odontogramaData: any, categorias: any[]): CPOIndices {
    const indices: CPOIndices = {
      C: 0,
      P: 0,
      O: 0,
      total: 0,
    };

    if (!odontogramaData || !categorias) return indices;

    // Función auxiliar para verificar categoría
    const isDiagnosisInCategory = (diagnosticoKey: string, categoriaKey: string): boolean => {
      const categoria = categorias.find(cat => 
        cat.id.toLowerCase().includes(categoriaKey.toLowerCase()) || 
        cat.nombre.toLowerCase().includes(categoriaKey.toLowerCase())
      );
      
      if (!categoria) return false;
      
      return categoria.diagnosticos.some((diag: { id: string; }) => diag.id === diagnosticoKey);
    };

    // Dientes permanentes FDI (11-48)
    const dientesPermanentes = Object.keys(odontogramaData)
      .filter(fdi => {
        const num = parseInt(fdi, 10);
        return num >= 11 && num <= 48;
      });

    // Para cada diente permanente
    dientesPermanentes.forEach(fdi => {
      const toothData = odontogramaData[fdi];
      if (!toothData) return;

      // Obtener todos los diagnósticos del diente
      const allDiagnoses = Object.values(toothData).flat();
      
      let tieneCaries = false;
      let tieneObturado = false;
      let tienePerdida = false;

      // Verificar cada diagnóstico
      allDiagnoses.forEach((diag: any) => {
        const diagKey = diag.key || diag.procedimientoId;
        
        // 1. Caries
        if (diagKey === 'caries') {
          if (isDiagnosisInCategory(diagKey, 'patologia_activa')) {
            tieneCaries = true;
          }
        }
        
        // 2. Pérdida por caries
        if (['extraccion_indicada', 'extraccion_otra_causa', 'perdida_otra_causa', 'ausente'].includes(diagKey)) {
          if (
            isDiagnosisInCategory(diagKey, 'tratamiento_realizado') ||
            isDiagnosisInCategory(diagKey, 'ausencia')
          ) {
            tienePerdida = true;
          }
        }
        
        // 3. Obturado
        if (['obturacion', 'sellante_realizado', 'corona_realizada', 'protesis_fija_realizada', 'protesis_removible_realizada'].includes(diagKey)) {
          if (isDiagnosisInCategory(diagKey, 'tratamiento_realizado')) {
            tieneObturado = true;
          }
        }
      });

      // Reglas de prioridad para CPO
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
};