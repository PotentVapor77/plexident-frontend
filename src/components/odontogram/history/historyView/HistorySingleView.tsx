// src/components/odontogram/history/historyView/HistorySingleView.tsx
// Vista Única (selectSnapshot) de Odontogramas

import { Calendar, Clock, User, UserCircle } from "lucide-react";
import { OdontogramaHistoryViewer } from "../..";
import type { OdontogramaSnapshot } from "../../../../core/types/odontogramaHistory.types";

interface HistorySingleViewProps {
  snapshot: OdontogramaSnapshot;
}

export const HistorySingleView = ({ snapshot }: HistorySingleViewProps) => {
  console.log('HistorySingleView snapshot', snapshot);
  return (
    <div className="flex flex-col h-full p-6">
      {/* Header con información del snapshot */}
      <div className="mb-4 flex-shrink-0 bg-white dark:bg-gray-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {snapshot.descripcion}
        </h2>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Fecha */}
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              {snapshot.fecha.toLocaleDateString("es-EC", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <span className="text-gray-300 dark:text-gray-600">•</span>

          {/* Hora */}
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>
              {snapshot.fecha.toLocaleTimeString("es-EC", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <span className="text-gray-300 dark:text-gray-600">•</span>

          {/* Profesional */}
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span>Dr. {snapshot.profesionalNombre}</span>
          </div>

          {/* Paciente (si existe) */}
          {snapshot.pacienteNombre && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <UserCircle className="w-4 h-4" />
                <span className="font-medium">{snapshot.pacienteNombre}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Viewer del odontograma - ocupa el espacio restante */}
      <div className="flex-1 min-h-0">
        <OdontogramaHistoryViewer odontogramaData={snapshot.odontogramaData} />
      </div>
    </div>
  );
};
