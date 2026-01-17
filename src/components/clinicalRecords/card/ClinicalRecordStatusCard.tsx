// src/components/clinicalRecord/card/ClinicalRecordStatusCard.tsx

import { Lock, LockOpen, FileEdit, CheckCircle2 } from "lucide-react";
import type { EstadoHistorial } from "../../../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordStatusCardProps {
  estado: EstadoHistorial;
  estaCompleto: boolean;
  puedeEditar: boolean;
}

/**
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */
export default function ClinicalRecordStatusCard({
  estado,
  estaCompleto,
  puedeEditar,
}: ClinicalRecordStatusCardProps) {
  // ==========================================================================
  // CONFIGURACIÓN POR ESTADO
  // ==========================================================================
  const statusConfig = {
    BORRADOR: {
      icon: FileEdit,
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-700 dark:text-gray-300",
      iconColor: "text-gray-600 dark:text-gray-400",
      borderColor: "border-gray-300 dark:border-gray-600",
      label: "Borrador",
      description: "Historial en construcción",
    },
    ABIERTO: {
      icon: LockOpen,
      bgColor: "bg-blue-light-50 dark:bg-blue-light-900/20",
      textColor: "text-blue-light-700 dark:text-blue-light-300",
      iconColor: "text-blue-light-600 dark:text-blue-light-400",
      borderColor: "border-blue-light-300 dark:border-blue-light-600",
      label: "Abierto",
      description: "Historial activo y editable",
    },
    CERRADO: {
      icon: Lock,
      bgColor: "bg-success-50 dark:bg-success-900/20",
      textColor: "text-success-700 dark:text-success-300",
      iconColor: "text-success-600 dark:text-success-400",
      borderColor: "border-success-300 dark:border-success-600",
      label: "Cerrado",
      description: "Historial finalizado",
    },
  };

  const config = statusConfig[estado];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-4 transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${config.bgColor} ${config.iconColor}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-sm font-semibold ${config.textColor}`}>{config.label}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de completitud */}
          {estaCompleto ? (
            <div className="flex items-center gap-1 text-xs text-success-600 dark:text-success-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Completo</span>
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Incompleto</span>
            </div>
          )}

          {/* Indicador de editable */}
          {puedeEditar && estado !== "CERRADO" && (
            <div className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Editable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
