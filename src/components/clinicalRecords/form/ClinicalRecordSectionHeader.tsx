// src/components/clinicalRecord/form/SectionHeader.tsx

import React from "react";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: string | null;
  isPreloaded?: boolean;
}

/**
 * ============================================================================
 * COMPONENT: SectionHeader
 * ============================================================================
 * Encabezado visual para cada sección del formulario 033
 * ============================================================================
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  lastUpdated,
  isPreloaded = false,
}) => {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
      {/* Icono */}
      <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg text-blue-600">
        {icon}
      </div>

      {/* Textos */}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 mt-2">
          {/* Última actualización */}
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Última actualización:{" "}
                {format(new Date(lastUpdated), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </span>
            </div>
          )}

          {/* Badge de datos pre-cargados */}
          {isPreloaded && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-700">
                Datos pre-cargados
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
