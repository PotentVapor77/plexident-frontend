// src/components/odontogram/history/historyView/HistoryCompareView.tsx
import { useState, useMemo } from 'react';
import { OdontogramaHistoryViewer } from "../..";
import { ViewModeToggle } from './ViewModeToggle';
import type { OdontogramaSnapshot } from "../../../../core/types/odontogramaHistory.types";
import type { HistoryViewMode } from '../../../../core/types/historyView.types';
import { FilesCompareView } from './historyFile/FilesCompareView';

interface HistoryCompareViewProps {
    beforeSnapshot: OdontogramaSnapshot;
    afterSnapshot: OdontogramaSnapshot;
}

export const HistoryCompareView = ({
    beforeSnapshot,
    afterSnapshot,
}: HistoryCompareViewProps) => {
    const [viewMode, setViewMode] = useState<HistoryViewMode>('models');

    const beforeSnapshotId = beforeSnapshot.snapshotId || beforeSnapshot.id;
    const afterSnapshotId = afterSnapshot.snapshotId || afterSnapshot.id;

    const totalFilesCount = useMemo(() => {
        // Si tienes acceso a los archivos en los snapshots, puedes sumarlos aquí
        // Por ejemplo, si los snapshots tienen una propiedad 'fileCounts'
        const beforeCount = (beforeSnapshot as any).fileCounts || 0;
        const afterCount = (afterSnapshot as any).fileCounts || 0;
        return beforeCount + afterCount;
    }, [beforeSnapshot, afterSnapshot]);

    const handleViewModeChange = (mode: HistoryViewMode) => {
        setViewMode(mode);
    };

    // Renderizar vista de archivos
    if (viewMode === 'files') {
        return (
            <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                {/* Header con toggle */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                Archivos clínicos comparados
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Comparando versiones del {beforeSnapshot.fecha.toLocaleDateString('es-EC', {
                                    day: 'numeric',
                                    month: 'short',
                                })} y {afterSnapshot.fecha.toLocaleDateString('es-EC', {
                                    day: 'numeric',
                                    month: 'short',
                                })}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Antes
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Después
                                </span>
                            </div>
                        </div>
                        
                        <ViewModeToggle 
                            currentMode={viewMode} 
                            onModeChange={handleViewModeChange}
                            filesCount={totalFilesCount}
                            isCompareView={true}
                        />
                    </div>
                </div>

                {/* Vista de archivos - ocupa todo el espacio */}
                <div className="flex-1 overflow-hidden">
                    <FilesCompareView
                        beforeSnapshotId={beforeSnapshotId}
                        afterSnapshotId={afterSnapshotId}
                        beforeSnapshotDate={beforeSnapshot.fecha}
                        afterSnapshotDate={afterSnapshot.fecha}
                    />
                </div>
            </div>
        );
    }

    // Renderizar vista de modelos 3D (por defecto)
    return (
        <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            {/* Header con toggle */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                <div className="flex flex-col">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Comparación de modelos 3D
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>
                                {beforeSnapshot.fecha.toLocaleDateString("es-EC", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>
                                {afterSnapshot.fecha.toLocaleDateString("es-EC", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{totalFilesCount}</span> archivos asociados
                    </div>
                    
                    <ViewModeToggle 
                        currentMode={viewMode} 
                        onModeChange={handleViewModeChange}
                        filesCount={totalFilesCount}
                        isCompareView={true}
                    />
                </div>
            </div>

            {/* Modelos 3D lado a lado - con layout responsivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 p-6 min-h-[600px]">
                {/* ANTES */}
                <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                ANTES
                            </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            Dr. {beforeSnapshot.profesionalNombre}
                        </div>
                    </div>
                    
                    <div className="flex-1 relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <OdontogramaHistoryViewer
                            key={`before-${beforeSnapshot.id}`}
                            odontogramaData={beforeSnapshot.odontogramaData}
                        />
                        
                        {/* Badge de fecha */}
                        <div className="absolute top-3 left-3 z-10">
                            <div className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full shadow-sm">
                                {beforeSnapshot.fecha.toLocaleTimeString("es-EC", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESPUÉS */}
                <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                DESPUÉS
                            </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            Dr. {afterSnapshot.profesionalNombre}
                        </div>
                    </div>
                    
                    <div className="flex-1 relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <OdontogramaHistoryViewer
                            key={`after-${afterSnapshot.id}`}
                            odontogramaData={afterSnapshot.odontogramaData}
                        />
                        
                        {/* Badge de fecha */}
                        <div className="absolute top-3 left-3 z-10">
                            <div className="px-3 py-1 bg-green-500 text-white text-xs rounded-full shadow-sm">
                                {afterSnapshot.fecha.toLocaleTimeString("es-EC", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer con información adicional */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                    
                    <button
                        type="button"
                        onClick={() => setViewMode('files')}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium flex items-center gap-1"
                    >
                        <span>Ver archivos clínicos asociados</span>
                        {totalFilesCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded text-[10px]">
                                {totalFilesCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};