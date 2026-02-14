// src/services/clinicalRecord/clinicalRecordPDFService.ts

import axiosInstance from "../api/axiosInstance";
import type { 
  PDFGenerationParams, 
  PDFServiceResponse,
  SeccionesDisponiblesResponse 
} from "../../core/types/typePDF";

const BASE_URL = "clinical-records";

/**
 * Servicio para manejar la generación y descarga de PDFs de historiales clínicos
 */
class ClinicalRecordPDFService {
  /**
   * Genera y descarga un PDF del historial clínico
   */
  async generarPDF({
    historialId,
    secciones,
    descarga = true,
  }: PDFGenerationParams): Promise<PDFServiceResponse> {
    try {
      // Construir URL con parámetros
      let url = `${BASE_URL}/${historialId}/pdf/`;
      const params = new URLSearchParams();
      
      if (secciones && secciones.length > 0) {
        params.append('secciones', secciones.join(','));
      }
      
      params.append('descarga', descarga ? 'true' : 'false');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`[PDF Service] Solicitando PDF: ${url}`);

      // Realizar la petición con respuesta tipo blob
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      // Verificar si la respuesta es un PDF
      if (response.data.type !== 'application/pdf') {
        // Intentar parsear como JSON (posible error)
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Error al generar el PDF',
          };
        } catch {
          return {
            success: false,
            error: 'La respuesta no es un PDF válido',
          };
        }
      }

      return {
        success: true,
        blob: response.data,
      };
    } catch (error: any) {
      console.error('[PDF Service] Error generando PDF:', error);
      
      // Manejar errores de red/respuesta
      let errorMessage = 'Error al generar el PDF';
      
      if (error.response?.data) {
        // Intentar extraer mensaje de error del blob
        try {
          const errorData = JSON.parse(await error.response.data.text());
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = error.response.statusText || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Obtiene las secciones disponibles para el PDF
   */
  async obtenerSeccionesDisponibles(): Promise<SeccionesDisponiblesResponse> {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/pdf/secciones-disponibles/`
      );
      return response.data;
    } catch (error) {
      console.error('[PDF Service] Error obteniendo secciones:', error);
      return { secciones: {} };
    }
  }

  /**
   * Descarga un blob como archivo PDF
   */
  descargarPDF(blob: Blob, nombreArchivo: string): void {
    // Crear URL del blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento anchor y simular clic
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo.endsWith('.pdf') ? nombreArchivo : `${nombreArchivo}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Abre el PDF en una nueva pestaña (previsualización)
   */
  previsualizarPDF(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  /**
   * Genera un nombre de archivo amigable
   */
  generarNombreArchivo(
    pacienteNombre?: string, 
    numeroHistoria?: string
  ): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const base = pacienteNombre 
      ? pacienteNombre.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      : 'historial';
    
    const hc = numeroHistoria ? `_HC-${numeroHistoria}` : '';
    
    return `HC_${base}${hc}_${timestamp}.pdf`.replace(/_+/g, '_');
  }
}

// Exportar instancia única
export const clinicalRecordPDFService = new ClinicalRecordPDFService();
export default clinicalRecordPDFService;