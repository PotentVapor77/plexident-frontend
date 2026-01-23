// src/components/odontogram/history/historyView/historyFile/FilesCompareTable.tsx
import { useState } from 'react';
import { 
    FileText, 
    Image as ImageIcon, 
    Download, 
    Eye, 
    Calendar,
    ChevronDown,
    FileArchive,
    FileVideo,
    Maximize2,
    Minimize2,
    X
} from 'lucide-react';
import type { ClinicalFile } from '../../../../../services/clinicalFiles/clinicalFilesService';
import { isImageFile, useFilePreview } from '../../../../../hooks/clinicalFiles/useFilePreview';

interface FilesCompareTableProps {
    beforeFiles: ClinicalFile[];
    afterFiles: ClinicalFile[];
    activeTab: 'comparison' | 'before' | 'after';
    beforeSnapshotDate: Date;
    afterSnapshotDate: Date;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (file: ClinicalFile) => {
    // Primero verificar si es imagen usando nuestra función mejorada
    if (isImageFile(file.file_url || '', file.mime_type)) {
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    
    // Luego verificar el MIME type
    if (file.mime_type === 'application/pdf') {
        return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (file.mime_type.includes('video')) {
        return <FileVideo className="h-5 w-5 text-purple-500" />;
    }
    if (file.mime_type.includes('zip') || file.mime_type.includes('compressed')) {
        return <FileArchive className="h-5 w-5 text-orange-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
};

const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        'XRAY': 'Radiografía',
        'PHOTO': 'Fotografía',
        'LAB': 'Laboratorio',
        'MODEL_3D': 'Modelo 3D',
        'OTHER': 'Otro',
    };
    return labels[category] || category;
};

export const FilesCompareTable = ({
    beforeFiles,
    afterFiles,
    activeTab,
    beforeSnapshotDate,
    afterSnapshotDate,
}: FilesCompareTableProps) => {
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

    const toggleFileExpansion = (fileId: string) => {
        const newExpanded = new Set(expandedFiles);
        if (newExpanded.has(fileId)) {
            newExpanded.delete(fileId);
        } else {
            newExpanded.add(fileId);
        }
        setExpandedFiles(newExpanded);
    };
    const {
        imagePreview,
        openFilePreview,
        closeFilePreview,
        toggleFullscreen,
        openInNewTab,
        isFileViewable,
        getFileType
    } = useFilePreview();
    

    const renderFileRow = (
        file: ClinicalFile, 
        side: 'before' | 'after', 
        index: number
    ) => {
        const isExpanded = expandedFiles.has(file.id);
        const isImage = file.mime_type.startsWith('image/');
        const isPDF = file.mime_type === 'application/pdf';
        const isViewable = isImage || isPDF;
        
        return (
            <div
                key={`${side}-${file.id}`}
                className={`border rounded-lg mb-2 overflow-hidden transition-all
                    ${side === 'before'
                        ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                        : 'border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-900/10'
                    }
                `}
            >
                {/* Header del archivo */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer">
                    <div className="flex-shrink-0">
                        {getFileIcon(file)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {file.original_filename}
                            </span>
                            <span className={`
                                px-2 py-0.5 text-xs rounded-full
                                ${side === 'before'
                                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                                    : 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                                }
                            `}>
                                {getCategoryLabel(file.category)}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(file.file_size_bytes)}</span>
                            <span>•</span>
                            <span>
                                {new Date(file.created_at).toLocaleDateString('es-EC', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                            {file.is_Dicom && (
                                <>
                                    <span>•</span>
                                    <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded">
                                        DICOM
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isViewable && file.file_url && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFilePreview(file.file_url!, file.original_filename);
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                title={isImage ? "Ver imagen completa" : "Ver archivo"}
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                        )}
                        {file.file_url && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openInNewTab(file.file_url!);
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Abrir en nueva pestaña"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </button>
                        )}

                        {file.download_url && (
                            <a
                                href={file.download_url}
                                download={file.original_filename}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Descargar"
                            >
                                <Download className="h-4 w-4" />
                            </a>
                        )}
                        
                        <button
                            type="button"
                            onClick={() => toggleFileExpansion(file.id)}
                            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>
                </div>
                
                {/* Detalles expandidos */}
                {/* Detalles expandidos */}
                {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-3 bg-white dark:bg-gray-900">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Preview para imágenes */}
                            {isImage && file.file_url && (
                                <div className="col-span-2">
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                                        <div 
                                            className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden cursor-pointer group/image-preview"
                                            onClick={() => openFilePreview(file.file_url!, file.original_filename)}
                                        >
                                            <img
                                                src={file.file_url}
                                                alt={file.original_filename}
                                                className="w-full h-full object-contain transition-transform duration-300 group-hover/image-preview:scale-105"
                                                loading="lazy"
                                            />
                                            {/* Overlay para ver imagen completa */}
                                            <div className="absolute inset-0 bg-black/0 group-hover/image-preview:bg-black/20 transition-colors flex items-center justify-center">
                                                <div className="opacity-0 group-hover/image-preview:opacity-100 transition-opacity bg-white/90 dark:bg-gray-900/90 rounded-full p-2">
                                                    <Eye className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                            Haz clic para ver en tamaño completo
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Metadatos */}
                            <div className="space-y-2">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Información del archivo
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Subido: {new Date(file.created_at).toLocaleDateString('es-EC')}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Tipo MIME:</span> {file.mime_type}
                                    </div>
                                    <div>
                                        <span className="font-medium">Snapshot:</span> {side === 'before' ? 'Antes' : 'Después'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Acciones */}
                            <div className="space-y-2">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Acciones disponibles
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {/* Botón Ver imagen/archivo */}
                                    {isViewable && file.file_url && (
                                        <button
                                            type="button"
                                            onClick={() => openFilePreview(file.file_url!, file.original_filename)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            {isImage ? 'Ver imagen completa' : 'Ver archivo'}
                                        </button>
                                    )}
                                    {file.file_url && (
                                        <a
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-md transition-colors"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                openInNewTab(file.file_url!);
                                            }}
                                        >
                                            <Maximize2 className="h-3.5 w-3.5" />
                                            Abrir en nueva pestaña
                                        </a>
                                    )}
                                    {file.download_url && (
                                        <a
                                            href={file.download_url}
                                            download={file.original_filename}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-md transition-colors"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Descargar
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderComparisonView = () => {
        const maxLength = Math.max(beforeFiles.length, afterFiles.length);
        
        return (
            <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Columna Antes */}
                    <div>
                        <div className="sticky top-0 z-10 mb-3 pb-2 bg-gradient-to-b from-white dark:from-gray-900">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Antes</h4>
                                <span className="ml-auto text-xs text-gray-500">
                                    {beforeFiles.length} archivos
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {beforeSnapshotDate.toLocaleDateString('es-EC', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            {beforeFiles.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                    No hay archivos en este snapshot
                                </div>
                            ) : (
                                beforeFiles.map((file, index) => renderFileRow(file, 'before', index))
                            )}
                        </div>
                    </div>
                    
                    {/* Columna Después */}
                    <div>
                        <div className="sticky top-0 z-10 mb-3 pb-2 bg-gradient-to-b from-white dark:from-gray-900">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Después</h4>
                                <span className="ml-auto text-xs text-gray-500">
                                    {afterFiles.length} archivos
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {afterSnapshotDate.toLocaleDateString('es-EC', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            {afterFiles.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                    No hay archivos en este snapshot
                                </div>
                            ) : (
                                afterFiles.map((file, index) => renderFileRow(file, 'after', index))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSingleView = (files: ClinicalFile[], side: 'before' | 'after') => {
        const snapshotDate = side === 'before' ? beforeSnapshotDate : afterSnapshotDate;
        
        return (
            <div className="p-4">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`
                            h-4 w-4 rounded-full
                            ${side === 'before' ? 'bg-blue-500' : 'bg-green-500'}
                        `}></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Archivos del snapshot: {side === 'before' ? 'Antes' : 'Después'}
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {snapshotDate.toLocaleDateString('es-EC', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <span className="font-medium">{files.length}</span> archivos
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {files.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                No hay archivos clínicos en este snapshot
                            </p>
                        </div>
                    ) : (
                        files.map((file, index) => renderFileRow(file, side, index))
                    )}
                </div>
            </div>
        );
    };

    const renderPreviewModal = () => {
        if (!imagePreview.isOpen) return null;

        const fileType = getFileType(imagePreview.url);
        
        return (
            <>
                {/* Backdrop con blur */}
                <div 
                    className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 transition-all duration-300"
                    onClick={closeFilePreview}
                />

                {/* Modal flotante */}
                <div 
                    className={`fixed z-[51] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 
                               transition-all duration-300 overflow-hidden ${
                        imagePreview.isFullscreen 
                            ? 'inset-4' 
                            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[85vh] max-w-[1200px]'
                    }`}
                >
                    {/* Header del modal */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {imagePreview.title}
                        </h3>
                        <div className="flex items-center gap-2">
                            {/* Botón pantalla completa */}
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title={imagePreview.isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                            >
                                {imagePreview.isFullscreen ? (
                                    <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>
                            
                            {/* Botón cerrar */}
                            <button
                                type="button"
                                onClick={closeFilePreview}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                title="Cerrar"
                            >
                                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </button>
                        </div>
                    </div>

                    {/* Contenido de la imagen/archivo */}
                    <div className="flex-1 h-[calc(100%-80px)] overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
                        <div className="w-full h-full flex items-center justify-center">
                            {fileType === 'image' ? (
                                <img
                                    src={imagePreview.url}
                                    alt={imagePreview.title}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    loading="lazy"
                                    onError={(e) => {
                                        // Si falla la carga de la imagen, mostrar un mensaje
                                        console.error('Error loading image:', imagePreview.url);
                                        e.currentTarget.style.display = 'none';
                                        // Podrías agregar un estado para mostrar un mensaje de error
                                    }}
                                />
                            ) : fileType === 'pdf' ? (
                                <iframe
                                    src={imagePreview.url}
                                    className="w-full h-full border-0 rounded-lg shadow-lg"
                                    title={imagePreview.title}
                                />
                            ) : (
                                <div className="text-center p-8">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {imagePreview.title}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Este tipo de archivo no puede ser visualizado en esta vista previa.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => openInNewTab(imagePreview.url)}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    >
                                        Abrir en nueva pestaña
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer con información */}
                    <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                            <p>
                                {fileType === 'image' 
                                    ? "Usa la rueda del mouse para hacer zoom, o haz clic y arrastra para mover la imagen"
                                    : fileType === 'pdf'
                                    ? "Vista previa del documento PDF"
                                    : "Archivo no visualizable en vista previa"
                                }
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => openInNewTab(imagePreview.url)}
                                    className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                                >
                                    Abrir en nueva pestaña
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            {/* Contenido principal según activeTab */}
            {(() => {
                switch (activeTab) {
                    case 'comparison':
                        return renderComparisonView();
                    case 'before':
                        return renderSingleView(beforeFiles, 'before');
                    case 'after':
                        return renderSingleView(afterFiles, 'after');
                    default:
                        return renderComparisonView();
                }
            })()}
            
            {/* Modal de vista previa */}
            {renderPreviewModal()}
        </>
    );
};