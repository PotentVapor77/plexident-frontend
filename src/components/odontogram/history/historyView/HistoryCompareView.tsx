// src/components/odontogram/history/historyView/HistoryCompareView.tsx
// Vista Comparativa de Odontogramas antes y despues

import { OdontogramaHistoryViewer } from "../..";
import type { OdontogramaSnapshot } from "../../../../core/types/odontogramaHistory.types";


// src/components/odontogram/history/HistoryCompareView.tsx


interface HistoryCompareViewProps {
    beforeSnapshot: OdontogramaSnapshot;
    afterSnapshot: OdontogramaSnapshot;
}

export const HistoryCompareView = ({
    beforeSnapshot,
    afterSnapshot,
}: HistoryCompareViewProps) => {
    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
            {/* ANTES */}
            <div className="bg-white dark:bg-gray-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-blue-light-500 text-white text-sm font-bold rounded-lg shadow-sm">
                                ANTES
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-white">
                                    {beforeSnapshot.descripcion}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {beforeSnapshot.fecha.toLocaleDateString("es-EC", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    • Dr. {beforeSnapshot.profesionalNombre}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <OdontogramaHistoryViewer
                            odontogramaData={beforeSnapshot.odontogramaData}
                        />
                    </div>
                </div>
            </div>

            {/* DESPUÉS */}
            <div className="bg-white dark:bg-gray-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-success-500 text-white text-sm font-bold rounded-lg shadow-sm">
                                DESPUÉS
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-white">
                                    {afterSnapshot.descripcion}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {afterSnapshot.fecha.toLocaleDateString("es-EC", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    • Dr. {afterSnapshot.profesionalNombre}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <OdontogramaHistoryViewer
                            odontogramaData={afterSnapshot.odontogramaData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
