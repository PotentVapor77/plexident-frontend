// src/components/odontogram/treatmentPlan/TreatmentPlanTable.tsx

import React, { useMemo, useCallback } from "react";
import { formatDateToReadable } from "../../../mappers/treatmentPlanMapper";
import type { PlanTratamientoListResponse } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import {
  Eye,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Button from "../../ui/button/Button";

interface TreatmentPlanTableProps {
  planes: PlanTratamientoListResponse[];
  onViewClick?: (plan: PlanTratamientoListResponse) => void;
  onEditClick?: (plan: PlanTratamientoListResponse) => void;
  onDeleteClick?: (plan: PlanTratamientoListResponse) => void;
  onViewSessionsClick?: (plan: PlanTratamientoListResponse) => void;
}

const TreatmentPlanTable: React.FC<TreatmentPlanTableProps> = ({
  planes,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onViewSessionsClick,
}) => {
  // ========================================================================
  // HELPERS MEMOIZADOS
  // ========================================================================

  const getProgressBar = useCallback((completadas: number, total: number) => {
    const percentage = total > 0 ? (completadas / total) * 100 : 0;

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {completadas} de {total} sesiones
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-brand-500 dark:bg-brand-400 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }, []);

  // Helper para obtener iniciales del nombre
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
      planes.map((plan) => (
        <tr
          key={plan.id}
          className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
        >
          {/* Título */}
          <td className="px-6 py-4">
            <div className="flex w-full items-start justify-between gap-4">
              {/* Contenedor Izquierdo: Icono de Archivo + Texto del Título */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                  {getInitials(plan.titulo)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plan.titulo}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <FileText className="h-3 w-3" />
                      Plan de tratamiento
                    </span>
                    {plan.version_odontograma && (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
                        <Calendar className="h-3 w-3" />
                        Odontograma vinculado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </td>

          {/* Paciente */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {getInitials(plan.paciente_nombre)}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-white">
                  {plan.paciente_nombre}
                </span>
                
              </div>
            </div>
          </td>

          {/* Fecha creación */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {formatDateToReadable(plan.fecha_creacion)}
            </div>
          </td>

          {/* Creado por */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
              <span>{plan.creado_por_nombre || "No asignado"}</span>
            </div>
          </td>

          {/* Progreso */}
          <td className="px-6 py-4">
            {getProgressBar(plan.sesiones_completadas, plan.total_sesiones)}
          </td>

          {/* Acciones */}
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end gap-1">
              {/* Ver */}
              {onViewClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewClick(plan)}
                  className="text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                  title="Ver detalle"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalle</span>
                </Button>
              )}

              {/* Sesiones - Solo si está activo */}
              {onViewSessionsClick && plan.activo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewSessionsClick(plan)}
                  className="inline-flex items-center gap-1 border-brand-100 bg-brand-50 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
                  title="Ver sesiones"
                >
                  <span>Sesiones</span>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" />
                </Button>
              )}

              {/* Editar - Solo si está activo */}
              {onEditClick && plan.activo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(plan)}
                  disabled={!plan.activo}
                  className={`text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 ${
                    !plan.activo
                      ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500 dark:hover:bg-transparent dark:hover:text-gray-400"
                      : ""
                  }`}
                  title={!plan.activo ? "No se puede editar" : "Editar plan"}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
              )}

              {/* Eliminar - Solo si está activo */}
              {onDeleteClick && plan.activo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteClick(plan)}
                  disabled={!plan.activo}
                  className={`text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300 ${
                    !plan.activo
                      ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500 dark:hover:bg-transparent dark:hover:text-gray-400"
                      : ""
                  }`}
                  title={!plan.activo ? "No se puede eliminar" : "Eliminar plan"}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              )}
            </div>
          </td>
        </tr>
      )),
    [planes, getProgressBar, onViewClick, onEditClick, onDeleteClick, onViewSessionsClick]
  );

  // ==========================================================================
  // EMPTY STATE
  // ==========================================================================
  if (!planes || planes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <FileText className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No hay planes de tratamiento registrados
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cree un nuevo plan para comenzar con el tratamiento del paciente
        </p>
      </div>
    );
  }

  // ==========================================================================
  // TABLE RENDER
  // ==========================================================================
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 w-full">
      <div className="overflow-x-auto custom-scrollbar max-h-[calc(100vh-20rem)]">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[800px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Título</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Paciente</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">Fecha creación</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Creado por</th>
              <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">Progreso</th>
              <th scope="col" className="px-6 py-3 text-right font-medium min-w-[180px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {rows}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
        Total de registros: {planes.length}
      </div>
    </div>
  );
};

export default React.memo(
  TreatmentPlanTable,
  (prev, next) =>
    prev.planes === next.planes &&
    prev.onViewClick === next.onViewClick &&
    prev.onEditClick === next.onEditClick &&
    prev.onDeleteClick === next.onDeleteClick &&
    prev.onViewSessionsClick === next.onViewSessionsClick
);