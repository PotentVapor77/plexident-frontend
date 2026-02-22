// src/services/clinicalRecord/clinicalRecordPDFService.ts

import axios from "axios";
import axiosInstance from "../api/axiosInstance";
import { API_BASE_URL } from "../../config/api";
import type {
  PDFGenerationParams,
  PDFServiceResponse,
  SeccionesDisponiblesResponse,
} from "../../core/types/typePDF";

const BASE_URL = "clinical-records";

/**
 * Instancia de axios específica para peticiones de PDF.
 *
 * POR QUÉ es necesaria una instancia separada:
 * ─────────────────────────────────────────────
 * axiosInstance tiene `Content-Type: application/json` en sus defaults.
 * Django REST Framework realiza negociación de contenido basada en el header
 * `Accept` de la petición. Cuando axios no envía un Accept explícito pero sí
 * un Content-Type: application/json, algunos middlewares de DRF (o el
 * DEFAULT_RENDERER_CLASSES) interpretan esto como que el cliente solo acepta
 * JSON, y devuelven 406 Not Acceptable porque el endpoint PDF solo puede
 * servir application/pdf.
 *
 * Esta instancia:
 *  ✅ Hereda baseURL y withCredentials (para autenticación por cookies)
 *  ✅ Envía Accept: application/pdf explícito
 *  ✅ NO envía Content-Type: application/json
 *  ✅ NO pasa por los interceptores de response de axiosInstance
 *     (que envuelven errores con createApiError y complican el manejo del blob)
 */
const pdfAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  withCredentials: true,   // necesario para enviar la cookie de sesión/JWT
  headers: {
    Accept: "application/pdf",
    // NO incluir Content-Type aquí
  },
});

/**
 * Servicio para manejar la generación y descarga de PDFs de historiales clínicos
 */
class ClinicalRecordPDFService {
  /**
   * Genera y retorna el PDF del historial clínico como Blob.
   */
  async generarPDF({
    historialId,
    secciones,
    descarga = true,
  }: PDFGenerationParams): Promise<PDFServiceResponse> {
    try {
      const params = new URLSearchParams();

      if (secciones && secciones.length > 0) {
        params.append("secciones", secciones.join(","));
      }
      params.append("descarga", descarga ? "true" : "false");

      const url = `${BASE_URL}/${historialId}/pdf/?${params.toString()}`;

      console.log(`[PDF Service] Solicitando PDF: ${url}`);

      const response = await pdfAxiosInstance.get(url, {
        responseType: "blob",
      });

      // Verificar Content-Type de la respuesta
      const contentType: string =
        response.headers["content-type"] ||
        (response.data as Blob).type ||
        "";

      if (!contentType.includes("application/pdf")) {
        const text = await (response.data as Blob).text();
        try {
          const errorData = JSON.parse(text);
          return {
            success: false,
            error:
              errorData.detail ||
              errorData.message ||
              "Error al generar el PDF",
          };
        } catch {
          return {
            success: false,
            error: "La respuesta no es un PDF válido",
          };
        }
      }

      return { success: true, blob: response.data };
    } catch (error: any) {
      console.error("[PDF Service] Error generando PDF:", error);

      let errorMessage = "Error al generar el PDF";

      // El response.data llega como Blob cuando responseType: 'blob'
      if (error.response?.data instanceof Blob) {
        try {
          const text = await (error.response.data as Blob).text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = error.response.statusText || errorMessage;
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Obtiene las secciones disponibles — usa axiosInstance normal (JSON)
   */
  async obtenerSeccionesDisponibles(): Promise<SeccionesDisponiblesResponse> {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/pdf/secciones-disponibles/`
      );
      return response.data;
    } catch (error) {
      console.error("[PDF Service] Error obteniendo secciones:", error);
      return { secciones: {} };
    }
  }

  /**
   * Descarga un Blob como archivo PDF en el dispositivo del usuario.
   */
  descargarPDF(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo.endsWith(".pdf")
      ? nombreArchivo
      : `${nombreArchivo}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Pequeño delay para que el browser procese el clic antes de limpiar
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 150);
  }

  /**
   * Abre el PDF en una nueva pestaña del navegador.
   * 60 s de timeout para que el browser cargue el blob antes de revocar la URL.
   */
  previsualizarPDF(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const nuevaPestana = window.open(url, "_blank");

    const timeoutId = setTimeout(
      () => window.URL.revokeObjectURL(url),
      60_000
    );

    // Si el popup fue bloqueado por el navegador, limpiar inmediatamente
    if (!nuevaPestana) {
      clearTimeout(timeoutId);
      window.URL.revokeObjectURL(url);
      console.warn("[PDF Service] La nueva pestaña fue bloqueada por el navegador.");
    }
  }

  /**
   * Genera un nombre de archivo amigable para el PDF descargado.
   *
   * @param pacienteNombre  Nombre completo del paciente
   * @param numeroHistoria  Número de historia clínica (ej: HC-2026000001)
   */
  generarNombreArchivo(
    pacienteNombre?: string,
    numeroHistoria?: string
  ): string {
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const base = pacienteNombre
      ? pacienteNombre.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
      : "historial";
    const hc = numeroHistoria ? `_${numeroHistoria}` : "";
    return `HC_${base}${hc}_${timestamp}.pdf`.replace(/_+/g, "_");
  }
}

export const clinicalRecordPDFService = new ClinicalRecordPDFService();
export default clinicalRecordPDFService;