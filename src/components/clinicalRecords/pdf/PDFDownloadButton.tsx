// src/components/clinicalRecords/pdf/PDFDownloadButton.tsx

import React, { useState } from 'react';
import { FileText, Loader2, Eye, Download, ChevronDown } from 'lucide-react';
import Button from '../../ui/button/Button';
import type { PDFDownloadButtonProps } from '../../../core/types/typePDF';
import { useClinicalRecordPDF } from '../../../hooks/clinicalRecord/useClinicalRecordPDF';

/**
 * Botón para generar y descargar/previsualizar PDF del historial clínico
 */
const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  historialId,
  pacienteNombre,
  numeroHistoria,
  mode = 'download',
  className = '',
  size = 'md',
  text = 'PDF',
  secciones,
  onSuccess,
  onError,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  
  const {
    isLoading,
    progress,
    error,
    generarPDF,
  } = useClinicalRecordPDF({
    showNotifications: true,
    onSuccess,
    onError,
  });

  const handleClick = async () => {
    await generarPDF({
      historialId,
      secciones,
      descarga: mode === 'download',
      pacienteNombre,
      numeroHistoria,
    }, mode);
  };

  const handlePreview = async () => {
    await generarPDF({
      historialId,
      secciones,
      descarga: false,
      pacienteNombre,
      numeroHistoria,
    }, 'preview');
  };

  // Determinar el tamaño del botón
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  // Si está cargando, mostrar progreso
  if (isLoading && progress !== null) {
    return (
      <Button
        variant="outline"
        disabled
        className={`${sizeClasses[size]} ${className}`}
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generando {progress}%</span>
        </div>
      </Button>
    );
  }

  
  if (error && import.meta.env?.MODE === 'development') {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        className={`${sizeClasses[size]} border-error-200 text-error-700 hover:bg-error-50 ${className}`}
        title={`Error: ${error}`}
      >
        <FileText className="h-4 w-4 mr-2" />
        Reintentar
      </Button>
    );
  }

  // Versión con opciones de descarga/previsualización
  if (mode === 'preview') {
    return (
      <div className="relative inline-block">
        <Button
          variant="outline"
          onClick={handlePreview}
          className={`${sizeClasses[size]} ${className}`}
          title="Previsualizar PDF"
        >
          <Eye className="h-4 w-4 mr-2" />
          {text}
        </Button>
        
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          type="button"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {showOptions && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <button
              onClick={() => {
                handleClick();
                setShowOptions(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
              type="button"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
            <button
              onClick={() => {
                handlePreview();
                setShowOptions(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
              type="button"
            >
              <Eye className="h-4 w-4" />
              Ver en navegador
            </button>
          </div>
        )}
      </div>
    );
  }

  // Versión simple (solo descarga)
  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={`${sizeClasses[size]} ${className}`}
      title="Descargar PDF"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <FileText className="h-4 w-4 mr-2" />
      )}
      {text}
    </Button>
  );
};

export default React.memo(PDFDownloadButton);