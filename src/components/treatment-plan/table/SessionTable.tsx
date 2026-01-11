// src/components/odontogram/treatmentPlan/SessionTable.tsx
import React, { useMemo, useCallback } from "react";
import {
  formatDateToReadable,
  getEstadoSesionColor,
} from "../../../mappers/treatmentPlanMapper";
import type { SesionTratamientoListResponse } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import {
  Eye,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  FileSignature,
} from "lucide-react";
import Button from "../../ui/button/Button";

interface SessionTableProps {
  sesiones: SesionTratamientoListResponse[];
  onViewClick?: (sesion: SesionTratamientoListResponse) => void;
  onEditClick?: (sesion: SesionTratamientoListResponse) => void;
  onDeleteClick?: (sesion: SesionTratamientoListResponse) => void;
}

const SessionTable: React.FC<SessionTableProps> = ({
  sesiones,
  onViewClick,
  onEditClick,
  onDeleteClick,
}) => {
  // ========================================================================
  // HELPERS MEMOIZADOS
  // ========================================================================

  const getEstadoBadge = useCallback(
    (estado: string, estado_display: string) => {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoSesionColor(
            estado
          )}`}
        >
          {estado_display}
        </span>
      );
    },
    []
  );

  const getFirmadaBadge = useCallback((esta_firmada: boolean) => {
    if (!esta_firmada) return null;
    return (
      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/30 rounded-full">
        <FileSignature className="w-3 h-3" />
        Firmada
      </span>
    );
  }, []);

  const rows = useMemo(
    () =>
      sesiones.map((sesion) => (
        <tr
          key={sesion.id}
          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors"
        >
          {/* Sesión */}
          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span>Sesión #{sesion.numero_sesion}</span>
              {getFirmadaBadge(sesion.esta_firmada)}
            </div>
          </td>

          {/* Fecha programada */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {sesion.fecha_programada
              ? formatDateToReadable(sesion.fecha_programada)
              : "No especificada"}
          </td>

          {/* Fecha realización */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {sesion.fecha_realizacion
              ? formatDateToReadable(sesion.fecha_realizacion)
              : "No realizada"}
          </td>

          {/* Estado */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {getEstadoBadge(sesion.estado, sesion.estado_display)}
          </td>

          {/* Odontólogo */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {sesion.odontologo_nombre || "No asignado"}
          </td>

          {/* Contenido */}
          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="space-y-1">
              <div>
                <span className="font-medium">{sesion.total_diagnosticos}</span>{" "}
                diagnóstico(s)
              </div>
              <div>
                <span className="font-medium">
                  {sesion.total_procedimientos}
                </span>{" "}
                procedimiento(s)
              </div>
              <div>
                <span className="font-medium">
                  {sesion.total_prescripciones}
                </span>{" "}
                prescripción(es)
              </div>
            </div>
          </td>

          {/* Acciones */}
          <td className="px-4 py-3 text-right whitespace-nowrap">
            <div className="inline-flex items-center gap-1">
              {onViewClick && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Ver sesión"
                  onClick={() => onViewClick(sesion)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {onEditClick &&
                sesion.estado !== "completada" &&
                sesion.estado !== "cancelada" && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Editar sesión"
                    onClick={() => onEditClick(sesion)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              {onDeleteClick &&
  sesion.estado !== "completada" &&
  sesion.estado !== "cancelada" && (
    <Button
      variant="outline"
      size="sm"
      aria-label="Eliminar sesión"
      onClick={() => onDeleteClick(sesion)}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
)}
            </div>
          </td>
        </tr>
      )),
    [sesiones, getFirmadaBadge, getEstadoBadge, onViewClick, onEditClick, onDeleteClick]
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  if (!sesiones || sesiones.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <Calendar className="w-6 h-6 text-gray-400" />
          <p className="font-medium">
            No hay sesiones registradas para este plan
          </p>
          <p className="text-xs">
            Cree una nueva sesión para comenzar el tratamiento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sesión
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fecha Programada
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fecha Realización
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Odontólogo
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Contenido
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {rows}
        </tbody>
      </table>
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
        Total de sesiones: {sesiones.length}
      </div>
    </div>
  );
};

// Memo con comparación personalizada
export default React.memo(SessionTable, (prev, next) => {
  return (
    prev.sesiones === next.sesiones &&
    prev.onViewClick === next.onViewClick &&
    prev.onEditClick === next.onEditClick &&
    prev.onDeleteClick === next.onDeleteClick
  );
});
