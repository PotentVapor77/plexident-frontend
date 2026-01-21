// src/components/odontogram/history/historyView/FilesDetailedView.tsx
import { useState } from 'react';
import { FileText, Image, Download, Eye, Calendar, User, AlertCircle, ChevronDown } from 'lucide-react';
import type { ClinicalFile } from '../../../../../services/clinicalFiles/clinicalFilesService';
interface FilesDetailedViewProps {
    files: ClinicalFile[];
    isLoading: boolean;
    pacienteName?: string;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
};

const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        'XRAY': 'Radiografía',
        'PHOTO': 'Fotografía',
        'DICOM': 'DICOM',
        'REPORT': 'Reporte',
        'OTHER': 'Otro',
    };
    return labels[category] || category;
};

export const FilesDetailedView = ({ files, isLoading }: FilesDetailedViewProps) => {
    const [expandedFile, setExpandedFile] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cargando archivos...</p>
                </div>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">No hay archivos asociados a este snapshot</p>
                <p className="text-xs mt-1">Los archivos adjuntos aparecerán aquí</p>
            </div>
        );
    }

    return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Header minimalista */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-7 w-6 items-center justify-center rounded-lg bg-brand-500">
            <span className="text-sm font-bold text-white">{files.length}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Archivos del Snapshot
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Radiografías, fotografías y documentos asociados
            </p>
          </div>
        </div>
      </div>

      {/* Lista de archivos con scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 py-10 space-y-1">
          {files.map((file) => {
            const isExpanded = expandedFile === file.id;
            const isImage = file.mime_type.startsWith('image/');

            return (
              <div
                key={file.id}
                className="group rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-theme-sm"
              >
                {/* Header del archivo */}
                <button
                  onClick={() => setExpandedFile(isExpanded ? null : file.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* Icono del archivo */}
                  <div className="flex-shrink-0 text-brand-500">
                    {getFileIcon(file.mime_type)}
                  </div>

                  {/* Info del archivo */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.original_filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                        {getCategoryLabel(file.category)}
                      </span>
                      <span>{formatFileSize(file.file_size_bytes)}</span>
                      {file.is_Dicom && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          DICOM
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Detalles expandidos */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="px-4 py-3 space-y-3">
                      {/* Metadatos */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(file.created_at).toLocaleDateString('es-EC', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {/*<div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <User className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{file.paciente  || 'Desconocido'}</span>
                        </div> */}
                        
                      </div>

                      {/* Preview de imagen */}
                      {isImage && file.file_url && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                          <img
                            src={file.file_url}
                            alt={file.original_filename}
                            className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800 rounded"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-2 pt-2">
                        {file.file_url && (
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                                     bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium 
                                     rounded-md transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver archivo
                          </a>
                        )}
                        {file.download_url && (
                          <a
                            href={file.download_url}
                            download={file.original_filename}
                            className="flex items-center justify-center gap-2 px-3 py-2 
                                     bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                                     text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md transition-colors"
                            title="Descargar"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Mensaje si no hay URLs disponibles */}
                      {!file.file_url && !file.download_url && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center pt-2">
                          URLs de visualización no disponibles
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer minimalista */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Haz clic para expandir detalles
        </p>
        <button
          onClick={() => {
            if (expandedFile) {
              setExpandedFile(null);
            } else {
              // Expandir el primero como demo
              if (files.length > 0) setExpandedFile(files[0].id);
            }
          }}
          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          {expandedFile ? 'Colapsar' : 'Expandir'}
        </button>
      </div>
    </div>
  );
};