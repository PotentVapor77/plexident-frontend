// src/components/clinicalRecords/pdf/PDFDownloadButton.tsx

import React, { useState } from 'react';
import { FileText, Loader2, Eye, Download, ChevronDown, AlertCircle } from 'lucide-react';
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
    resetError,
    generarPDF,
  } = useClinicalRecordPDF({
    showNotifications: true,
    onSuccess,
    onError,
  });

  const handleClick = async () => {
    if (error) resetError();
    await generarPDF({
      historialId,
      secciones,
      descarga: mode === 'download',
      pacienteNombre,
      numeroHistoria,
    }, mode);
  };

  const handlePreview = async () => {
    if (error) resetError();
    await generarPDF({
      historialId,
      secciones,
      descarga: false,
      pacienteNombre,
      numeroHistoria,
    }, 'preview');
  };

  // Tamaños de botón
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  // Estado de carga con progreso
  if (isLoading) {
    return (
      <Button
        variant="outline"
        disabled
        className={`${sizeClasses[size]} ${className}`}
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {progress !== null && progress < 100
              ? `Generando ${progress}%`
              : 'Generando...'}
          </span>
        </div>
      </Button>
    );
  }

  // BUG FIX: el botón de reintentar antes solo aparecía en development.
  // Ahora se muestra siempre que haya un error, en cualquier entorno.
  if (error) {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        className={`${sizeClasses[size]} border-error-200 text-error-700 hover:bg-error-50 dark:border-error-800 dark:text-error-400 dark:hover:bg-error-900/20 ${className}`}
        title={`Error: ${error}. Haz clic para reintentar.`}
      >
        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
        Reintentar
      </Button>
    );
  }

  // Versión con opciones de previsualización + dropdown
  if (mode === 'preview') {
    return (
      <div className="relative inline-flex items-center">
        <Button
          variant="outline"
          onClick={handlePreview}
          className={`${sizeClasses[size]} ${className}`}
          title="Previsualizar PDF en el navegador"
        >
          <Eye className="h-4 w-4 mr-2" />
          {text}
        </Button>
        
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          type="button"
          title="Más opciones"
          aria-label="Más opciones de PDF"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {showOptions && (
          <>
            {/* Overlay para cerrar el dropdown al hacer clic fuera */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowOptions(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <button
                onClick={() => {
                  handleClick();
                  setShowOptions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 rounded-t-lg"
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
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 rounded-b-lg"
                type="button"
              >
                <Eye className="h-4 w-4" />
                Ver en navegador
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Versión simple (solo descarga) — modo por defecto en la tabla
  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={`${sizeClasses[size]} ${className}`}
      title={`Descargar PDF${pacienteNombre ? ` de ${pacienteNombre}` : ''}`}
      disabled={isLoading}
    >
      <FileText className="h-4 w-4 mr-2" />
      {text}
    </Button>
  );
};

export default React.memo(PDFDownloadButton);