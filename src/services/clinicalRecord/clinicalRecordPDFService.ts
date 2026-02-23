// src/services/clinicalRecord/clinicalRecordPDFService.ts

import axiosInstance from "../api/axiosInstance";
import type {
  PDFGenerationParams,
  PDFServiceResponse,
  SeccionesDisponiblesResponse,
} from "../../core/types/typePDF";

const BASE_URL = "clinical-records";

/**
 * Servicio para manejar la generación y descarga de PDFs de historiales clínicos.
 *
 * ── POR QUÉ usamos axiosInstance con override de headers en lugar de una
 *    instancia separada ────────────────────────────────────────────────────
 *
 * En producción con Nginx como proxy reverso, crear una instancia axios nueva
 * con `baseURL: API_BASE_URL` puede fallar si la variable de entorno de Vite
 * tiene trailing slash, el path `/api` ya incluido, o el dominio no coincide
 * exactamente con el que espera el servidor.
 *
 * La solución más robusta es reutilizar axiosInstance (que ya funciona para
 * todos los demás endpoints) y sobreescribir SOLO el header `Accept` en la
 * petición individual usando el parámetro `headers` de axios.get().
 *
 * Axios permite que los headers de la llamada individual tengan precedencia
 * sobre los defaults de la instancia. De esta forma:
 *   ✅ Misma baseURL que funciona en prod
 *   ✅ Mismas cookies de sesión (withCredentials)
 *   ✅ Mismos interceptores de auth (token refresh)
 *   ✅ Accept: application/pdf sobreescribe al Accept de la instancia
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

      const response = await axiosInstance.get(url, {
        responseType: "blob",
        // Sobreescribir headers específicamente para esta petición.
        // En axios, los headers pasados aquí tienen mayor prioridad que
        // los defaults de la instancia (se hace deep merge, con el request
        // ganando sobre los defaults).
        headers: {
          Accept: "application/pdf",
          // Eliminar Content-Type para esta petición (no aplica a GET con blob)
          "Content-Type": undefined,
        },
        // Desactivar el transformResponse por defecto que podría interferir con el blob
        transformResponse: [(data) => data],
      });

      // Verificar Content-Type de la respuesta
      const contentType: string =
        response.headers["content-type"] ||
        (response.data instanceof Blob ? response.data.type : "") ||
        "";

      if (!contentType.includes("application/pdf")) {
        // El backend devolvió algo inesperado — intentar leer el mensaje de error
        const text =
          response.data instanceof Blob
            ? await response.data.text()
            : String(response.data);
        try {
          const errorData = JSON.parse(text);
          return {
            success: false,
            error: errorData.detail || errorData.message || "Error al generar el PDF",
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

      // response.data llega como Blob cuando responseType: 'blob'
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = error.response?.statusText || errorMessage;
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
   * Obtiene las secciones disponibles para el PDF (respuesta JSON normal).
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

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 150);
  }

  /**
   * Abre el PDF en una nueva pestaña del navegador.
   */
  previsualizarPDF(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const nuevaPestana = window.open(url, "_blank");

    const timeoutId = setTimeout(() => window.URL.revokeObjectURL(url), 60_000);

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
  generarNombreArchivo(pacienteNombre?: string, numeroHistoria?: string): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const base = pacienteNombre
      ? pacienteNombre.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
      : "historial";
    const hc = numeroHistoria ? `_${numeroHistoria}` : "";
    return `HC_${base}${hc}_${timestamp}.pdf`.replace(/_+/g, "_");
  }
}

export const clinicalRecordPDFService = new ClinicalRecordPDFService();
export default clinicalRecordPDFService;