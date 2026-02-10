// src/components/clinicalRecord/form/sections/ExamenesComplementariosSection.tsx
import React from "react";
import { FileText, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import RefreshButton from "../../../ui/button/RefreshButton";

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ExamenesComplementariosSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated: string | null;
  refreshSection: () => Promise<void>;
  mode: "create" | "edit";
  refreshLoading?: boolean;
}

/**
 * ============================================================================
 * HELPERS - Funciones auxiliares para mostrar estados
 * ============================================================================
 */

/**
 * Obtiene el icono y color según el estado de los exámenes
 */
// const getEstadoIcon = (estado: string) => {
//   switch (estado) {
//     case "COMPLETADO":
//       return {
//         icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
//         color: "text-green-700",
//         bgColor: "bg-green-50",
//         borderColor: "border-green-200",
//         label: "Completado",
//       };
//     case "PENDIENTE":
//       return {
//         icon: <Clock className="h-5 w-5 text-amber-600" />,
//         color: "text-amber-700",
//         bgColor: "bg-amber-50",
//         borderColor: "border-amber-200",
//         label: "Pendiente",
//       };
//     case "SIN_PEDIDO":
//       return {
//         icon: <XCircle className="h-5 w-5 text-gray-400" />,
//         color: "text-gray-600",
//         bgColor: "bg-gray-50",
//         borderColor: "border-gray-200",
//         label: "Sin Pedido",
//       };
//     default:
//       return {
//         icon: <FileText className="h-5 w-5 text-gray-400" />,
//         color: "text-gray-600",
//         bgColor: "bg-gray-50",
//         borderColor: "border-gray-200",
//         label: "Desconocido",
//       };
//   }
// };

/**
 * ============================================================================
 * COMPONENT: ExamenesComplementariosSection
 * ============================================================================
 */
const ExamenesComplementariosSection: React.FC<ExamenesComplementariosSectionProps> = ({
  formData,
  lastUpdated,
  refreshSection,
  mode,
  refreshLoading = false,
}) => {
  const examenesData = formData.examenes_complementarios_data;
  const hasData = !!examenesData;

  // Obtener estado y estilos
  const estado = examenesData?.estado_examenes || "SIN_PEDIDO";
  //const estadoConfig = getEstadoIcon(estado);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* ====================================================================
          HEADER
      ==================================================================== */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                L. Exámenes Complementarios
              </h3>
              {lastUpdated && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Última actualización:{" "}
                  {new Date(lastUpdated).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Botón de refresh */}
          <RefreshButton
            onClick={refreshSection}
            color="blue"
            size="sm"
            label="Actualizar"
            loading={refreshLoading}
            disabled={false}
          />
        </div>
      </div>

      {/* ====================================================================
          CONTENT
      ==================================================================== */}
      <div className="p-6">
        {!hasData ? (
          // Sin datos
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No hay exámenes complementarios registrados para este paciente
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Use el botón "Actualizar" para cargar los datos más recientes
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estado General */}
            {/* <div
              className={`rounded-lg border ${estadoConfig.borderColor} ${estadoConfig.bgColor} p-4`}
            >
              <div className="flex items-center gap-3">
                {estadoConfig.icon}
                <div className="flex-1">
                  <h4 className={`font-semibold ${estadoConfig.color}`}>
                    {estadoConfig.label}
                  </h4>
                  {examenesData.resumen_examenes_complementarios && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {examenesData.resumen_examenes_complementarios}
                    </p>
                  )}
                </div>
              </div>
            </div> */}

            {/* Detalle del Pedido y Resultados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PEDIDO DE EXÁMENES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Pedido de Exámenes
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      examenesData.pedido_examenes && examenesData.pedido_examenes.trim() !== ""
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {examenesData.pedido_examenes && examenesData.pedido_examenes.trim() !== ""
                      ? "Solicitado"
                      : "No Solicitado"}
                  </span>
                </div>

                {examenesData.pedido_examenes && examenesData.pedido_examenes.trim() !== "" ? (
                  <div className="space-y-2">
                    {/* Tipos de exámenes solicitados */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Exámenes Solicitados:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {examenesData.pedido_examenes.split(',').map((examen, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded"
                          >
                            {examen.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Detalle del pedido */}
                    {examenesData.pedido_examenes_detalle && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Detalle:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {examenesData.pedido_examenes_detalle}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No se han solicitado exámenes complementarios
                  </p>
                )}
              </div>

              {/* INFORME DE EXÁMENES (Resultados) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Informe de Resultados
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      examenesData.informe_examenes && examenesData.informe_examenes.trim() !== ""
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {examenesData.informe_examenes && examenesData.informe_examenes.trim() !== ""
                      ? "Completado"
                      : "Sin Informe"}
                  </span>
                </div>

                {examenesData.informe_examenes && examenesData.informe_examenes.trim() !== "" ? (
                  <div className="space-y-2">
                    {/* Tipos de informes recibidos */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                        Informes Recibidos:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {examenesData.informe_examenes.split(',').map((informe, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded"
                          >
                            {informe.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Detalle del informe */}
                    {examenesData.informe_examenes_detalle && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Resultados:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {examenesData.informe_examenes_detalle}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {examenesData.pedido_examenes && examenesData.pedido_examenes.trim() !== ""
                      ? "Pendiente de resultados"
                      : "Sin informe disponible"}
                  </p>
                )}
              </div>
            </div>

            {/* Indicadores de Estado */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            
              <div className="flex items-center gap-2">
                {examenesData.tiene_pedido_examenes_pendiente ? (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-gray-300" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {examenesData.tiene_pedido_examenes_pendiente
                    ? "Tiene pedido pendiente"
                    : "Sin pedidos pendientes"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {examenesData.tiene_informe_examenes_completado ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-300" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {examenesData.tiene_informe_examenes_completado
                    ? "Informe completado"
                    : "Sin informe completado"}
                </span>
              </div>
            </div> */}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-medium">Fecha de creación: </span>
                  <span>
                    {new Date(examenesData.fecha_creacion).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Última modificación: </span>
                  <span>
                    {new Date(
                      examenesData.fecha_modificacion
                    ).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          FOOTER - Mensaje informativo
      ==================================================================== */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Nota:</span> Esta sección muestra los
          exámenes complementarios {mode === "create" ? "más recientes" : "vinculados"} del
          paciente. Los datos son de solo lectura y se actualizan automáticamente
          desde el módulo de gestión de exámenes.
        </p>
      </div>
    </div>
  );
};

export default ExamenesComplementariosSection;