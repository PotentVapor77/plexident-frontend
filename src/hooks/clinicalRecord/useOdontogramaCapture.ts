// src/hooks/clinicalRecord/useOdontogramaCapture.ts
import { useCallback, useRef } from "react";
import axiosInstance from "../../services/api/axiosInstance";

// Lazy-load html2canvas para no penalizar el bundle inicial
const loadHtml2Canvas = () => import("html2canvas").then((m) => m.default);

/**
 * Captura un elemento del DOM y retorna su canvas.
 */
const captureElement = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  const html2canvas = await loadHtml2Canvas();
  return html2canvas(element, {
    scale: 2,                    // 144 DPI — balance calidad/tamaño para PDF
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
    allowTaint: true,
    removeContainer: true,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
};

/**
 * Convierte un canvas a Blob PNG.
 */
const canvasToBlob = (canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> =>
  new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob devolvió null"))),
      "image/png",
      quality
    )
  );

/**
 * Fusiona dos canvas apilándolos verticalmente.
 * Usado para combinar permanente + temporal en una sola imagen.
 */
const mergeCanvasVertical = (canvases: HTMLCanvasElement[]): HTMLCanvasElement => {
  const SEPARATOR = 16; // px de separación entre tabs en la imagen final
  const totalHeight =
    canvases.reduce((acc, c) => acc + c.height, 0) + SEPARATOR * (canvases.length - 1);
  const maxWidth = Math.max(...canvases.map((c) => c.width));

  const merged = document.createElement("canvas");
  merged.width = maxWidth;
  merged.height = totalHeight;

  const ctx = merged.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, maxWidth, totalHeight);

  let y = 0;
  for (const canvas of canvases) {
    ctx.drawImage(canvas, 0, y);
    y += canvas.height + SEPARATOR;
  }

  return merged;
};

/**
 * ============================================================================
 * HOOK: useOdontogramaCapture
 * ============================================================================
 *
 * Captura silenciosa del odontograma 2D (ambos tabs: permanente + temporal)
 * y envía la imagen compuesta al backend para incluirla en el PDF.
 *
 * DISEÑO:
 * - Completamente invisible para el usuario (sin estados, sin botones)
 * - Captura los dos tabs aunque solo uno esté visible (los IDs always están en el DOM)
 * - Nunca bloquea el guardado: los errores se loguean pero no se propagan
 * - Devuelve una función `capture` estable que ClinicalRecordForm puede llamar
 *
 * USO EN Odontograma2DSection:
 *   Los contenedores deben tener IDs fijos:
 *   - id="odontograma-permanente"   ← div que envuelve el tab permanente
 *   - id="odontograma-temporal"     ← div que envuelve el tab temporal
 *   (pueden estar ocultos con CSS, html2canvas los captura igual si están en el DOM)
 *
 * USO EN ClinicalRecordForm (handleSubmit / handleReload):
 *   const captureOdontograma = useOdontogramaCapture(recordId);
 *   // Antes de onSuccess():
 *   await captureOdontograma.capture();
 */
export const useOdontogramaCapture = (historialId: string | undefined) => {
  const isCapturingRef = useRef(false);

  const capture = useCallback(async (): Promise<void> => {
    if (!historialId) {
      console.warn("[OdontogramaCapture] Sin historialId — captura omitida");
      return;
    }

    if (isCapturingRef.current) {
      console.warn("[OdontogramaCapture] Captura en progreso, se omite nueva solicitud");
      return;
    }

    isCapturingRef.current = true;
    console.log("[OdontogramaCapture] 📸 Iniciando captura automática...");

    try {
      const permanenteEl = document.getElementById("odontograma-permanente");
      const temporalEl   = document.getElementById("odontograma-temporal");

      if (!permanenteEl && !temporalEl) {
        console.warn("[OdontogramaCapture] No se encontraron elementos del odontograma en el DOM");
        return;
      }

      // Capturar cada tab disponible (puede haber solo uno si el paciente no tiene datos)
      const canvases: HTMLCanvasElement[] = [];

      if (permanenteEl) {
        try {
          canvases.push(await captureElement(permanenteEl));
          console.log("[OdontogramaCapture] Tab permanente capturado");
        } catch (e) {
          console.warn("[OdontogramaCapture] Error capturando permanente:", e);
        }
      }

      if (temporalEl) {
        try {
          canvases.push(await captureElement(temporalEl));
          console.log("[OdontogramaCapture] Tab temporal capturado");
        } catch (e) {
          console.warn("[OdontogramaCapture] Error capturando temporal:", e);
        }
      }

      if (canvases.length === 0) {
        console.warn("[OdontogramaCapture] No se pudo capturar ningún canvas");
        return;
      }

      // Fusionar en imagen única (o usar directamente si solo hay uno)
      const finalCanvas =
        canvases.length === 1 ? canvases[0] : mergeCanvasVertical(canvases);

      const blob = await canvasToBlob(finalCanvas);
      console.log(`[OdontogramaCapture] Imagen: ${(blob.size / 1024).toFixed(1)} KB`);

      // Enviar al backend
      const formData = new FormData();
      formData.append("imagen", blob, `odontograma_${historialId}.png`);

      await axiosInstance.post(
        `/clinical-records/${historialId}/capturar-odontograma/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("[OdontogramaCapture] ✅ Imagen guardada en el backend");
    } catch (err) {
      // La captura NUNCA debe interrumpir el flujo principal (guardar, refrescar)
      console.error("[OdontogramaCapture] Error no bloqueante:", err);
    } finally {
      isCapturingRef.current = false;
    }
  }, [historialId]);

  return { capture };
};