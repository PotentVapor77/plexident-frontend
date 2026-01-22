// src/components/odontogram/history/historyView/historyFile/FilesCompareView.tsx
import { useState } from 'react';
import { Calendar, User, AlertCircle, Loader2, Maximize2 } from 'lucide-react';
import { usePacienteActivo } from '../../../../../context/PacienteContext';
import { useSnapshotFiles } from '../../../../../hooks/clinicalFiles/useSnapshotFiles';
import { FilesCompareTable } from './FilesCompareTable';
import { FilesComparisonFullscreenView } from './FilesComparisonFullscreenView';

interface FilesCompareViewProps {
    beforeSnapshotId: string;
    afterSnapshotId: string;
    beforeSnapshotDate: Date;
    afterSnapshotDate: Date;
}

export const FilesCompareView = ({
    beforeSnapshotId,
    afterSnapshotId,
    beforeSnapshotDate,
    afterSnapshotDate,
}: FilesCompareViewProps) => {
    const { pacienteActivo } = usePacienteActivo();
    const [activeTab, setActiveTab] = useState<'comparison' | 'before' | 'after'>('comparison');
    const [fullscreenMode, setFullscreenMode] = useState(false); 
    const { 
        files: beforeFiles, 
        isLoading: isLoadingBefore, 
        error: errorBefore 
    } = useSnapshotFiles({
        pacienteId: pacienteActivo?.id,
        snapshotId: beforeSnapshotId,
        enabled: activeTab !== 'after',
    });

    const { 
        files: afterFiles, 
        isLoading: isLoadingAfter, 
        error: errorAfter 
    } = useSnapshotFiles({
        pacienteId: pacienteActivo?.id,
        snapshotId: afterSnapshotId,
        enabled: activeTab !== 'before',
    });

    const isLoading = isLoadingBefore || isLoadingAfter;
    const hasError = errorBefore || errorAfter;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cargando archivos de ambos snapshots...
                    </p>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                    Error al cargar archivos
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    {errorBefore?.message || errorAfter?.message || 'No se pudieron cargar los archivos'}
                </p>
            </div>
        );
    }

    const totalFiles = beforeFiles.length + afterFiles.length;

    if (totalFiles === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                    No hay archivos clínicos
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                    Ninguno de los snapshots comparados tiene archivos asociados.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header con estadísticas */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Archivos clínicos comparados
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {beforeSnapshotDate.toLocaleDateString('es-EC', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })} vs {afterSnapshotDate.toLocaleDateString('es-EC', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                                    {beforeFiles.length} archivos en Antes
                                </span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                                    {afterFiles.length} archivos en Después
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">
                            Total: {totalFiles} archivos
                        </div>
                        
                        {/* Botón para pantalla completa */}
                        {activeTab === 'comparison' && totalFiles > 0 && (
                            <button
                                type="button"
                                onClick={() => setFullscreenMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                <Maximize2 className="h-4 w-4" />
                                Pantalla completa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs de navegación */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    type="button"
                    onClick={() => setActiveTab('comparison')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === 'comparison'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Comparación completa
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('before')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === 'before'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Solo Antes
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                        {beforeFiles.length}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('after')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === 'after'
                            ? 'border-green-500 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Solo Después
                    <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                        {afterFiles.length}
                    </span>
                </button>
            </div>

            {/* Contenido de la vista */}
            <div className="flex-1 overflow-auto">
                {!fullscreenMode ? (
                    <FilesCompareTable
                        beforeFiles={beforeFiles}
                        afterFiles={afterFiles}
                        activeTab={activeTab}
                        beforeSnapshotDate={beforeSnapshotDate}
                        afterSnapshotDate={afterSnapshotDate}
                    />
                ) : (
                    <FilesComparisonFullscreenView
                        beforeFiles={beforeFiles}
                        afterFiles={afterFiles}
                        beforeSnapshotDate={beforeSnapshotDate}
                        afterSnapshotDate={afterSnapshotDate}
                        onClose={() => setFullscreenMode(false)}
                    />
                )}
            </div>
        </div>
    );
};