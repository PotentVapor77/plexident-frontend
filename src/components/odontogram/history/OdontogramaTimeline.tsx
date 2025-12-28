// src/components/odontogram/history/OdontogramaTimeline.tsx
import type { OdontogramaSnapshot } from "../../../core/types/odontogramaHistory.types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineProps {
  snapshots: OdontogramaSnapshot[];
  onSelectSnapshot: (id: string) => void;
  selectedSnapshotId: string | null;
}

export const OdontogramaTimeline = ({
  snapshots,
  onSelectSnapshot,
  selectedSnapshotId
}: TimelineProps) => {
  const sortedSnapshots = [...snapshots].sort(
    (a, b) => b.fecha.getTime() - a.fecha.getTime()
  );

  return (
    <div className="p-4 space-y-3">
      {sortedSnapshots.map((snapshot, index) => {
        const isSelected = snapshot.id === selectedSnapshotId;
        const isLast = index === sortedSnapshots.length - 1;

        return (
          <div
            key={snapshot.id}
            onClick={() => onSelectSnapshot(snapshot.id)}
            className={`relative group cursor-pointer transition-all duration-200 ${isSelected
                ? 'transform scale-[1.02]'
                : 'hover:transform hover:scale-[1.01]'
              }`}
          >
            {/* Card principal */}
            <div
              className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${isSelected
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 shadow-lg'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md'
                }`}
            >
              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute -left-1 top-0 bottom-0 w-1 bg-brand-500 rounded-l-xl" />
              )}

              {/* Header con fecha y hora */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {/* Icono de calendario */}
                    <svg
                      className={`w-4 h-4 flex-shrink-0 ${isSelected
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-gray-400 dark:text-gray-500'
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span
                      className={`text-sm font-semibold ${isSelected
                          ? 'text-brand-700 dark:text-brand-300'
                          : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {format(snapshot.fecha, "d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-medium ml-6 ${isSelected
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {format(snapshot.fecha, 'HH:mm')}
                  </p>
                </div>

                {/* Badge de estado */}
                {isSelected && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-100 dark:bg-brand-800/40 rounded-full">
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-brand-700 dark:text-brand-300">
                      Actual
                    </span>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <p
                className={`text-sm mb-3 line-clamp-2 ${isSelected
                    ? 'text-gray-800 dark:text-gray-200 font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                {snapshot.descripcion}
              </p>

              {/* Footer con profesional */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {/* Avatar con iniciales */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${isSelected
                      ? 'bg-brand-200 dark:bg-brand-800 text-brand-700 dark:text-brand-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                >
                  {snapshot.profesionalNombre
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${isSelected
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    {snapshot.profesionalNombre}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Odontólogo
                  </p>
                </div>

                {/* Icono de flecha */}
                <svg
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${isSelected
                      ? 'text-brand-500 transform rotate-0'
                      : 'text-gray-400 -rotate-90 group-hover:rotate-0'
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Línea conectora */}
            {!isLast && (
              <div className="flex justify-center py-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full" />
              </div>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {snapshots.length === 0 && (
        <div className="text-center py-12 px-4">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            No hay registros históricos
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Los odontogramas guardados aparecerán aquí
          </p>
        </div>
      )}
    </div>
  );
};
