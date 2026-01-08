// src/components/odontogram/history/historyView/HistoryCompareView.tsx
import { OdontogramaHistoryViewer } from "../..";
import type { OdontogramaSnapshot } from "../../../../core/types/odontogramaHistory.types";

interface HistoryCompareViewProps {
    beforeSnapshot: OdontogramaSnapshot;
    afterSnapshot: OdontogramaSnapshot;
}

export const HistoryCompareView = ({
    beforeSnapshot,
    afterSnapshot,
}: HistoryCompareViewProps) => {
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {/* ANTES */}
            <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 px-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        ANTES
                    </span>
                    <div className="mt-1">
                        {beforeSnapshot.fecha.toLocaleDateString("es-EC", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}{" "}
                        • Dr. {beforeSnapshot.profesionalNombre}
                    </div>
                </div>
                <div className="flex-1 relative">
                    <OdontogramaHistoryViewer
                        key={`before-${beforeSnapshot.id}`}
                        odontogramaData={beforeSnapshot.odontogramaData}
                    />
                </div>
            </div>

            {/* DESPUÉS */}
            <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 px-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                        DESPUÉS
                    </span>
                    <div className="mt-1">
                        {afterSnapshot.fecha.toLocaleDateString("es-EC", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}{" "}
                        • Dr. {afterSnapshot.profesionalNombre}
                    </div>
                </div>
                <div className="flex-1 relative">
                    <OdontogramaHistoryViewer
                        key={`after-${afterSnapshot.id}`}
                        odontogramaData={afterSnapshot.odontogramaData}
                    />
                </div>
            </div>
        </div>
    );
};
