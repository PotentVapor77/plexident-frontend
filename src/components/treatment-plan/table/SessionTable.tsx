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
  User,
  FileText,
} from "lucide-react";
import Button from "../../ui/button/Button";

interface SessionTableProps {
  sesiones: SesionTratamientoListResponse[];
  totalCount?: number;
  onViewClick?: (sesion: SesionTratamientoListResponse) => void;
  onEditClick?: (sesion: SesionTratamientoListResponse) => void;
  onDeleteClick?: (sesion: SesionTratamientoListResponse) => void;
}

const SessionTable: React.FC<SessionTableProps> = ({
  sesiones,
  totalCount,
  onViewClick,
  onEditClick,
  onDeleteClick,
}) => {
  // ========================================================================
  // HELPERS MEMOIZADOS
  // ========================================================================

  const getEstadoBadge = useCallback((estado: string, estadoDisplay: string) => {
    const badgeClass = getEstadoSesionColor(estado);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
        {estado === "completada" && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
        {estado === "pendiente" && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
        {estadoDisplay || estado}
      </span>
    );
  }, []);

  const getFirmadaBadge = useCallback((esta_firmada: boolean) => {
    if (!esta_firmada) return null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/30 rounded-full">
        <FileSignature className="w-3 h-3" />
        Firmada
      </span>
    );
  }, []);

  // Helper para obtener iniciales
  const getInitials = (name: string) => {
    if (!name) return "??";
    const spaces = name.split(" ");
    if (spaces.length > 1) {
      return (spaces[0][0] + spaces[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const rows = useMemo(
    () =>
      sesiones.map((sesion) => {
        const isLocked = sesion.estado === "completada" || sesion.estado === "cancelada";

        return (
          <tr key={sesion.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
            {/* Sesión */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                  {getInitials(`Sesión ${sesion.numero_sesion}`)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Sesión #{sesion.numero_sesion}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {getFirmadaBadge(sesion.esta_firmada)}
                  </div>
                </div>
              </div>
            </td>

            {/* Fecha Programada */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {sesion.fecha_programada ? formatDateToReadable(sesion.fecha_programada) : "No especificada"}
              </div>
            </td>

            {/* Fecha Realización */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
                {sesion.fecha_realizacion ? formatDateToReadable(sesion.fecha_realizacion) : "No realizada"}
              </div>
            </td>

            {/* Estado */}
            <td className="px-6 py-4 whitespace-nowrap">
              {getEstadoBadge(sesion.estado, sesion.estado_display)}
            </td>

            {/* Odontólogo */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {sesion.odontologo_nombre || "No asignado"}
              </div>
            </td>

            {/* Contenido */}
            <td className="px-6 py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <FileText className="h-3 w-3" />
                  <span>
                    <span className="font-semibold">{sesion.total_diagnosticos}</span> diagnóstico(s)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <FileText className="h-3 w-3" />
                  <span>
                    <span className="font-semibold">{sesion.total_procedimientos}</span> procedimiento(s)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <FileText className="h-3 w-3" />
                  <span>
                    <span className="font-semibold">{sesion.total_prescripciones}</span> prescripción(es)
                  </span>
                </div>
              </div>
            </td>

            {/* Acciones */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex justify-end gap-1">
                {/* Ver */}
                {onViewClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewClick(sesion)}
                    className="text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalle</span>
                  </Button>
                )}

                {/* Editar - Solo si no está bloqueada */}
                {onEditClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => !isLocked && onEditClick(sesion)}
                    disabled={isLocked}
                    className={`text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 ${
                      isLocked
                        ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500 dark:hover:bg-transparent dark:hover:text-gray-400"
                        : ""
                    }`}
                    title={isLocked ? "No se puede editar" : "Editar sesión"}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                )}

                {/* Eliminar - Solo si no está bloqueada */}
                {onDeleteClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => !isLocked && onDeleteClick(sesion)}
                    disabled={isLocked}
                    className={`text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300 ${
                      isLocked
                        ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500 dark:hover:bg-transparent dark:hover:text-gray-400"
                        : ""
                    }`}
                    title={isLocked ? "No se puede eliminar" : "Eliminar sesión"}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                )}
              </div>
            </td>
          </tr>
        );
      }),
    [sesiones, getEstadoBadge, getFirmadaBadge, onViewClick, onEditClick, onDeleteClick]
  );

  // ==========================================================================
  // EMPTY STATE
  // ==========================================================================
  if (!sesiones || sesiones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No hay sesiones registradas
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cree una nueva sesión para comenzar con el tratamiento
        </p>
      </div>
    );
  }

  // ==========================================================================
  // TABLE RENDER
  // ==========================================================================
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 w-full">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[800px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">Sesión</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">Fecha programada</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">Fecha realización</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Estado</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Odontólogo</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Contenido</th>
              <th scope="col" className="px-6 py-3 text-right font-medium min-w-[150px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {rows}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
        Mostrando {sesiones.length} de {totalCount ?? sesiones.length} sesiones
      </div>
    </div>
  );
};

export default React.memo(
  SessionTable,
  (prev, next) =>
    prev.sesiones === next.sesiones &&
    prev.totalCount === next.totalCount &&
    prev.onViewClick === next.onViewClick &&
    prev.onEditClick === next.onEditClick &&
    prev.onDeleteClick === next.onDeleteClick
);