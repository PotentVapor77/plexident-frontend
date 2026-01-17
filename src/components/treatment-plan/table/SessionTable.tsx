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
      sesiones.map((sesion) => {
        const isLocked =
          sesion.estado === "completada" || sesion.estado === "cancelada";

        return (
          <tr
            key={sesion.id}
            className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/60"
          >
            {/* Sesión */}
            <td className="px-4 py-3 align-top">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Sesión #{sesion.numero_sesion}
                  </span>
                </div>
                <div>{getFirmadaBadge(sesion.esta_firmada)}</div>
              </div>
            </td>

            {/* Fecha Programada */}
            <td className="px-4 py-3 align-top text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
  {sesion.fecha_programada ? formatDateToReadable(sesion.fecha_programada) : "No especificada"}
</td>

            {/* Fecha Realización */}
            <td className="px-4 py-3 align-top text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
  {sesion.fecha_realizacion ? formatDateToReadable(sesion.fecha_realizacion) : "No realizada"}
</td>

            {/* Estado */}
            <td className="px-4 py-3 align-top text-sm whitespace-nowrap">
  {getEstadoBadge(sesion.estado, sesion.estado_display)}
</td>

            {/* Odontólogo */}
            <td className="px-4 py-3 align-top text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
  {sesion.odontologo_nombre || "No asignado"}
</td>

            {/* Contenido */}
            <td className="px-4 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
              <div className="flex flex-col gap-0.5">
                <span>
                  <span className="font-semibold">
                    {sesion.total_diagnosticos}
                  </span>{" "}
                  diagnóstico(s)
                </span>
                <span>
                  <span className="font-semibold">
                    {sesion.total_procedimientos}
                  </span>{" "}
                  procedimiento(s)
                </span>
                <span>
                  <span className="font-semibold">
                    {sesion.total_prescripciones}
                  </span>{" "}
                  prescripción(es)
                </span>
              </div>
            </td>

            {/* Acciones */}
            <td className="px-4 py-3 align-top">
              <div className="flex flex-wrap items-center justify-end gap-1">
                {onViewClick && (
                  <div className="group relative">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Ver sesión"
                      onClick={() => onViewClick(sesion)}
                      className="border-none bg-transparent text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                    >
                      <Eye className="h-4 w-4 text-brand-500 dark:text-brand-300" />
                    </Button>
                    <span className="pointer-events-none absolute -bottom-8 right-0 z-10 w-max rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-theme-sm transition-opacity group-hover:opacity-100 dark:bg-black">
                      Ver detalle
                    </span>
                  </div>
                )}

                {onEditClick && (
                  <div className="group relative">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Editar sesión"
                      onClick={() => !isLocked && onEditClick(sesion)}
                      disabled={isLocked}
                      className={`border-none bg-transparent text-gray-500 dark:text-gray-400 ${
                        isLocked
                          ? "cursor-not-allowed opacity-40"
                          : "hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
                      }`}
                    >
                      <Edit2
                        className={`h-4 w-4 ${
                          isLocked
                            ? "text-gray-400 dark:text-gray-500"
                            : "text-orange-500 dark:text-orange-300"
                        }`}
                      />
                    </Button>
                    <span className="pointer-events-none absolute -bottom-8 right-1/2 z-10 w-max translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-theme-sm transition-opacity group-hover:opacity-100 dark:bg-black">
                      {isLocked ? "No editable" : "Editar sesión"}
                    </span>
                  </div>
                )}

                {onDeleteClick && (
                  <div className="group relative">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Eliminar sesión"
                      onClick={() => !isLocked && onDeleteClick(sesion)}
                      disabled={isLocked}
                      className={`border-none bg-transparent text-gray-500 dark:text-gray-400 ${
                        isLocked
                          ? "cursor-not-allowed opacity-40"
                          : "hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-300"
                      }`}
                    >
                      <Trash2
                        className={`h-4 w-4 ${
                          isLocked
                            ? "text-gray-400 dark:text-gray-500"
                            : "text-error-500 dark:text-error-300"
                        }`}
                      />
                    </Button>
                    <span className="pointer-events-none absolute -bottom-8 right-0 z-10 w-max rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-theme-sm transition-opacity group-hover:opacity-100 dark:bg-black">
                      {isLocked ? "No eliminable" : "Eliminar sesión"}
                    </span>
                  </div>
                )}
              </div>
            </td>
          </tr>
        );
      }),
    [sesiones, getFirmadaBadge, getEstadoBadge, onViewClick, onEditClick, onDeleteClick]
  );


  // ========================================================================
  // RENDER
  // ========================================================================

  if (!sesiones || sesiones.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
        <Calendar className="h-6 w-6" />
      </div>
      <p className="font-medium">No hay sesiones registradas para este plan</p>
      <p className="mt-1 text-xs">
        Cree una nueva sesión para comenzar el tratamiento
      </p>
    </div>
  );
}
  return (
  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <table className=" min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Sesión
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Fecha programada
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Fecha realización
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Estado
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Odontólogo
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Contenido
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows}
      </tbody>
    </table>

    <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
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
