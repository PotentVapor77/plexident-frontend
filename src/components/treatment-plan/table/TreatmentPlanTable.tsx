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

  const getActivoBadge = useCallback((activo: boolean) => {
    if (activo) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-emerald-800 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/60">
        Inactivo
      </span>
    );
  }, []);

  const getProgressBar = useCallback((completadas: number, total: number) => {
    const percentage = total > 0 ? (completadas / total) * 100 : 0;
    return (
      <div className="w-full flex flex-col gap-1">
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-brand-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {completadas} de {total} sesiones
        </span>
      </div>
    );
  }, []);

  const rows = useMemo(
    () =>
      planes.map((plan) => (
        <tr
          key={plan.id}
          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors"
        >
          {/* Título */}
          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              <span>{plan.titulo}</span>
              {plan.version_odontograma && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                  Con odontograma vinculado
                </span>
              )}
            </div>
          </td>

          {/* Paciente */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {plan.paciente_nombre}
          </td>

          {/* Fecha creación */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {formatDateToReadable(plan.fecha_creacion)}
          </td>

          {/* Creado por */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {plan.creado_por_nombre || "N/A"}
          </td>

          {/* Progreso */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            {getProgressBar(plan.sesiones_completadas, plan.total_sesiones)}
          </td>

          {/* Estado */}
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {getActivoBadge(plan.activo)}
          </td>

          {/* Acciones */}
          <td className="px-4 py-3 text-right whitespace-nowrap">
            <div className="inline-flex items-center gap-1">
              {onViewClick && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Ver plan"
                  onClick={() => onViewClick(plan)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {onViewSessionsClick && plan.activo && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Ver sesiones"
                  onClick={() => onViewSessionsClick(plan)}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              {onEditClick && plan.activo && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Editar plan"
                  onClick={() => onEditClick(plan)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              {onDeleteClick && plan.activo && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Eliminar plan"
                  onClick={() => onDeleteClick(plan)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </td>
        </tr>
      )),
    [planes, getProgressBar, getActivoBadge, onViewClick, onEditClick, onDeleteClick, onViewSessionsClick]
  );

  if (!planes || planes.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <FileText className="w-6 h-6 text-gray-400" />
          <p className="font-medium">No hay planes de tratamiento registrados</p>
          <p className="text-xs">
            Cree un nuevo plan para comenzar
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
              Título
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Paciente
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fecha Creación
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Creado Por
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Progreso
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estado
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
        Total de registros: {planes.length}
      </div>
    </div>
  );
};

export default React.memo(TreatmentPlanTable, (prev, next) => {
  return (
    prev.planes === next.planes &&
    prev.onViewClick === next.onViewClick &&
    prev.onEditClick === next.onEditClick &&
    prev.onDeleteClick === next.onDeleteClick &&
    prev.onViewSessionsClick === next.onViewSessionsClick
  );
});
