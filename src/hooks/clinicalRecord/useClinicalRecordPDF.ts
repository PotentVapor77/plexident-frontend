// src/hooks/clinicalRecord/useClinicalRecordPDF.ts

import { useState, useCallback } from 'react';
import { clinicalRecordPDFService } from '../../services/clinicalRecord/clinicalRecordPDFService';
import type { 
  PDFGenerationParams, 
  PDFGenerationState,
  PDFViewMode
} from '../../core/types/typePDF';
import { useNotification } from '../../context/notifications/NotificationContext';

interface UseClinicalRecordPDFOptions {
  /** Mostrar notificaciones automáticas */
  showNotifications?: boolean;
  /** Callback al iniciar la generación */
  onStart?: () => void;
  /** Callback al completar exitosamente */
  onSuccess?: () => void;
  /** Callback en caso de error */
  onError?: (error: string) => void;
}

/**
 * Hook personalizado para manejar la generación de PDF de historiales clínicos
 */
export function useClinicalRecordPDF(
  options: UseClinicalRecordPDFOptions = {}
) {
  const { showNotifications = true, onStart, onSuccess, onError } = options;
  const { notify } = useNotification();
  
  const [state, setState] = useState<PDFGenerationState>({
    isLoading: false,
    error: null,
    progress: null,
  });

  const [seccionesDisponibles, setSeccionesDisponibles] = useState<
    Record<string, string>
  >({});

  /**
   * Genera y descarga el PDF
   */
  const generarPDF = useCallback(async (
    params: PDFGenerationParams,
    mode: PDFViewMode = 'download'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, progress: 0 }));
    
    try {
      onStart?.();

      // Simular progreso (opcional - para UX)
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + 10, 90),
        }));
      }, 200);

      const result = await clinicalRecordPDFService.generarPDF(params);
      
      clearInterval(progressInterval);
      
      if (result.success && result.blob) {
        setState(prev => ({ ...prev, progress: 100 }));
        
        // Generar nombre de archivo
        const nombreArchivo = clinicalRecordPDFService.generarNombreArchivo(
          params.historialId,
          params.pacienteNombre,
        );

        // Acción según el modo
        if (mode === 'download') {
          clinicalRecordPDFService.descargarPDF(result.blob, nombreArchivo);
          
          if (showNotifications) {
            notify({
              type: "success",
              title: "PDF generado",
              message: "El PDF se ha descargado correctamente.",
            });
          }
        } else {
          clinicalRecordPDFService.previsualizarPDF(result.blob);
        }

        onSuccess?.();
      } else {
        throw new Error(result.error || 'Error al generar el PDF');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al generar el PDF';
      
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (showNotifications) {
        notify({
          type: "error",
          title: "Error",
          message: errorMessage,
        });
      }
      
      onError?.(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
      // Resetear progreso después de un tiempo
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: null }));
      }, 1000);
    }
  }, [showNotifications, notify, onStart, onSuccess, onError]);

  /**
   * Carga las secciones disponibles
   */
  const cargarSeccionesDisponibles = useCallback(async () => {
    try {
      const response = await clinicalRecordPDFService.obtenerSeccionesDisponibles();
      setSeccionesDisponibles(response.secciones || {});
      return response.secciones;
    } catch (error) {
      console.error('Error cargando secciones PDF:', error);
      return {};
    }
  }, []);

  /**
   * Genera PDF con secciones específicas
   */
  const generarPDFConSecciones = useCallback((
    historialId: string,
    secciones: string[],
    mode: PDFViewMode = 'download',
    metadata?: { pacienteNombre?: string; numeroHistoria?: string }
  ) => {
    return generarPDF({
      historialId,
      secciones,
      descarga: mode === 'download',
      pacienteNombre: metadata?.pacienteNombre,
      numeroHistoria: metadata?.numeroHistoria,
    }, mode);
  }, [generarPDF]);

  return {
    isLoading: state.isLoading,
    error: state.error,
    progress: state.progress,
    seccionesDisponibles,
    generarPDF,
    generarPDFConSecciones,
    cargarSeccionesDisponibles,
    // Utilidades
    isDownloading: state.isLoading,
    hasError: !!state.error,
    resetError: () => setState(prev => ({ ...prev, error: null })),
  };
}