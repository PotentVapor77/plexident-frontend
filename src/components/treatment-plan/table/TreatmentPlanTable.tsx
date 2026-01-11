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

  const rows = useMemo(
    () =>
      planes.map((plan) => (
        <tr
          key={plan.id}
          className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
        >
          {/* Título */}
{/* Título */}
<td className="px-4 py-3 align-top">
  {/* AÑADIDO: w-full y justify-between para empujar el icono a la derecha */}
  <div className="flex w-full items-start justify-between gap-4">
    
    {/* Contenedor Izquierdo: Icono de Archivo + Texto del Título */}
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
        <FileText className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {plan.titulo}
      </span>
    </div>

    {/* Contenedor Derecho: Icono de Odontograma (Alineado al fondo a la derecha) */}
    <div className="group relative ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/10 dark:hover:text-brand-300">
      {plan.version_odontograma ? (
        <Calendar className="h-3.5 w-3.5 text-brand-500 dark:text-brand-300" />
      ) : (
        <Calendar className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
      )}

      {/* Tooltip ajustado para que no se salga por la derecha */}
      <span className="pointer-events-none absolute -bottom-9 right-0 z-10 w-max rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-theme-sm transition-opacity group-hover:opacity-100 dark:bg-black">
        {plan.version_odontograma
          ? "Odontograma vinculado"
          : "No esta vinculado"}
      </span>
    </div>
    
  </div>
</td>

          {/* Paciente */}
          <td className="px-4 py-3 align-top">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {plan.paciente_nombre}
              </span>
              {/* Si en el futuro agregas la cédula al tipo:
    {plan.paciente_cedula && (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        CI: {plan.paciente_cedula}
      </span>
    )} */}
            </div>
          </td>

          {/* Fecha creación */}
          <td className="px-4 py-3 align-top">
            <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
              <span>{formatDateToReadable(plan.fecha_creacion)}</span>
            </div>
          </td>

          {/* Creado por */}
          <td className="px-4 py-3 align-top">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-gray-800 dark:text-gray-100">
                {plan.creado_por_nombre || "N/A"}
              </span>
            </div>
          </td>

          {/* Progreso */}
          <td className="px-4 py-3 align-top">
            {getProgressBar(plan.sesiones_completadas, plan.total_sesiones)}
          </td>

          {/* Acciones */}
<td className="px-4 py-3 align-top">
  <div className="flex flex-wrap items-center justify-end gap-2">
    {onViewClick && (
      <div className="group relative">
        <Button
          variant="outline"
          size="sm"
          aria-label="Ver plan"
          onClick={() => onViewClick(plan)}
          className="border-none bg-transparent text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
        >
          <Eye className="h-4 w-4 text-brand-500 dark:text-brand-300" />
        </Button>
        <span
          className="pointer-events-none absolute -bottom-8 right-1/2 z-10 w-max translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-theme-sm transition-opacity group-hover:opacity-100 dark:bg-black"
        >
          Ver detalle
        </span>
      </div>
    )}

    {onViewSessionsClick && plan.activo && (
      <div className="group relative">
        <Button
          variant="outline"
          size="sm"
          aria-label="Ver sesiones"
          onClick={() => onViewSessionsClick(plan)}
          className="inline-flex items-center gap-1 border-brand-100 bg-brand-50 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
        >
          <span>Sesiones</span>
          <ArrowRight className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" />
        </Button>
        <span
          className="pointer-events-none absolute -bottom-8 right-1/2 z-10 w-max translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-theme-sm transition-opacity group-hover:opacity-100 dark:bg-black"
        >
          Ver sesiones
        </span>
      </div>
    )}

    {onEditClick && plan.activo && (
      <div className="group relative">
        <Button
          variant="outline"
          size="sm"
          aria-label="Editar plan"
          onClick={() => onEditClick(plan)}
          className="border-none bg-transparent text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
        >
          <Edit2 className="h-4 w-4 text-orange-500 dark:text-orange-300" />
        </Button>
        <span
          className="pointer-events-none absolute -bottom-8 right-1/2 z-10 w-max translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-theme-sm transition-opacity group-hover:opacity-100 dark:bg-black"
        >
          Editar plan
        </span>
      </div>
    )}

    {onDeleteClick && plan.activo && (
      <div className="group relative">
        <Button
          variant="outline"
          size="sm"
          aria-label="Eliminar plan"
          onClick={() => onDeleteClick(plan)}
          className="border-none bg-transparent text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300"
        >
          <Trash2 className="h-4 w-4 text-error-500 dark:text-error-300" />
        </Button>
        <span
          className="pointer-events-none absolute -bottom-8 right-1/2 z-10 w-max translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-theme-sm transition-opacity group-hover:opacity-100 dark:bg-black"
        >
          Eliminar plan
        </span>
      </div>
    )}
  </div>
</td>
        </tr>
      )),
    [planes, getProgressBar, onViewClick, onEditClick, onDeleteClick, onViewSessionsClick]
  );

  if (!planes || planes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          No hay planes de tratamiento registrados
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cree un nuevo plan para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/60">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Título
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Paciente
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Fecha creación
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Creado por
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Progreso
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
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
