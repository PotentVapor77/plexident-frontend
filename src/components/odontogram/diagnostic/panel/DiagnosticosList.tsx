// src/core/types/DiagnosticosList.tsx

import React, { useEffect, useRef, useState, type JSX } from 'react';
import { formatGroupedSurfaces, type GroupedDiagnostic } from '../../../../core/utils/groupDiagnostics';
import type { NotificationOptions } from '../../../../core/types/diagnostic.types';
import { eliminarDiagnostico } from '../../../../services/odontogram/odontogramaService';

// ============================================================================
// INTERFACES
// ============================================================================

interface DiagnosticosListProps {
  diagnosticos: GroupedDiagnostic[];
  onRemove: (id: string, superficieId: string) => void;
  addNotification: (options: NotificationOptions) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL: DiagnosticosList
// ============================================================================

export const DiagnosticosList: React.FC<DiagnosticosListProps> = ({
  diagnosticos,
  onRemove,
  addNotification,
}) => {
  // ============================================================================
  // ESTADO VACÍO
  // ============================================================================
const prioridadOrden = ['ALTA', 'ESTRUCTURAL', 'MEDIA', 'BAJA', 'INFORMATIVA'];
  if (diagnosticos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2.5 max-w-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Sin diagnósticos
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Haz clic en "Añadir" para comenzar a registrar hallazgos clínicos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LISTA DE DIAGNÓSTICOS
  // ============================================================================

  return (
    <div className="p-4 space-y-3">
      {/* Header con contador */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Diagnósticos aplicados
        </h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
          {diagnosticos.length}
        </span>
      </div>

      {/* Cards de diagnósticos */}
      <div className="space-y-2.5">
  {[...diagnosticos]
    .sort(
      (a, b) =>
        prioridadOrden.indexOf(a.prioridadKey) -
        prioridadOrden.indexOf(b.prioridadKey)
    )
    .map((diagnostico) => (
      <DiagnosticoCard
        key={diagnostico.groupId}
        diagnostico={diagnostico}
        onRemove={onRemove}
        addNotification={addNotification}
      />
    ))}
</div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: DiagnosticoCard
// ============================================================================

interface DiagnosticoCardProps {
  diagnostico: GroupedDiagnostic;
  onRemove: (id: string, superficieId: string) => void;
  addNotification: (options: NotificationOptions) => void;
}

const DiagnosticoCard: React.FC<DiagnosticoCardProps> = ({
  diagnostico,
  onRemove,
  addNotification,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const detallesClinicos = diagnostico.secondaryOptions;
  const hasDetallesClinicos = detallesClinicos && Object.keys(detallesClinicos).length > 0;
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    isLeftSide?: boolean
  }>({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 450;
      let left = rect.left - tooltipWidth - 12;
      let top = rect.top + (rect.height / 2) - (tooltipHeight / 2);

      const isLeftSide = left >= 8;
      if (!isLeftSide) {
        left = rect.right + 12;
      }

      if (top < 8) {
        top = 8;
      }

      if (top + tooltipHeight > window.innerHeight - 8) {
        top = window.innerHeight - tooltipHeight - 8;
      }

      setTooltipPosition({ top, left, isLeftSide });
    }
  }, [showTooltip]);
  // ============================================================================
  // ESTILOS DE PRIORIDAD
  // ============================================================================
  const esIdTemporal = (id: string): boolean => {
    return (
      id.startsWith('temp-') ||
      /^\d{13,}-[a-z0-9]+$/i.test(id)
    );
  };
  const priorityColors: Record<string, string> = {
    ALTA: 'bg-error-50 border-error-200 text-error-700',
    ESTRUCTURAL: 'bg-blue-light-50 border-blue-light-200 text-blue-light-700',
    MEDIA: 'bg-warning-50 border-warning-200 text-warning-700',
    BAJA: 'bg-success-50 border-success-200 text-success-700',
    INFORMATIVA: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  const priorityClass = priorityColors[diagnostico.prioridadKey] || priorityColors['INFORMATIVA'];
  const superficiesDisplay = formatGroupedSurfaces(diagnostico);
  // ============================================================================
  // FUNCIONES AUXILIARES PARA TOOLTIP
  // ============================================================================

  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  console.log('[DiagnosticoCard] Debug:', {
    nombre: diagnostico.nombre,
    hasDetallesClinicos,
    detallesClinicos,
    descripcion: diagnostico.descripcion
  });
  const getSecondaryOptions = (): Record<string, any> | undefined => {
    return (diagnostico as any).secondaryOptions;
  };


  const formatDiagnosticoIds = (): JSX.Element[] => {
    const uniqueIds = [...new Set(diagnostico.diagnosticoIds.map(d => d.id))];
    return uniqueIds.map((id, idx) => (
      <div key={idx} className="flex items-center gap-1.5">
        {esIdTemporal(id) ? (
          <>
            <span className="text-yellow-400">🕐</span>
            <span>Pendiente de guardar</span>
          </>
        ) : (
          <>
            <span className="text-green-400">✓</span>
            <span className="font-mono text-xs">{id.slice(0, 12)}...</span>
          </>
        )}
      </div>
    ));
  };



  // ============================================================================
  // FORMATEO DE SUPERFICIES
  // ============================================================================



  // Determinar estilo del badge de superficie
  const getSurfaceBadgeStyle = (): string => {
    if (diagnostico.isGeneral) {
      return 'bg-brand-100 border-brand-200 text-brand-700';
    }
    if (diagnostico.isCoronaCompleta && diagnostico.isRaizCompleta) {
      return 'bg-purple-100 border-purple-200 text-purple-700';
    }
    if (diagnostico.isCoronaCompleta) {
      return 'bg-brand-100 border-brand-200 text-brand-700';
    }
    if (diagnostico.isRaizCompleta) {
      return 'bg-purple-100 border-purple-200 text-purple-700';
    }

    // Mixto o individual
    const hasCorona = diagnostico.superficies.some((s) => s.startsWith('cara_'));
    const hasRaiz = diagnostico.superficies.some((s) => s.startsWith('raiz:'));

    if (hasCorona && hasRaiz) {
      return 'bg-gradient-to-r from-brand-50 to-purple-50 border-brand-200 text-gray-700';
    }
    if (hasRaiz) {
      return 'bg-purple-50 border-purple-200 text-purple-700';
    }
    return 'bg-brand-50 border-brand-200 text-brand-700';
  };


  // ============================================================================
  // HANDLER: Eliminar diagnóstico
  // ============================================================================

  const handleRemove = async () => {
    const superficiesDisplay = formatGroupedSurfaces(diagnostico);

    const confirmMessage =
      diagnostico.superficies.length > 1
        ? `¿Deseas eliminar este diagnóstico de todas las superficies?\n\n${superficiesDisplay}`
        : `¿Deseas eliminar este diagnóstico?\n\n${superficiesDisplay}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);

    try {
      const diagnosticosTemporales: Array<{ id: string; superficieId: string }> = [];
      const diagnosticosPersistentes: Array<{ id: string; superficieId: string }> = [];

      for (const { id, superficieId } of diagnostico.diagnosticoIds) {
        if (esIdTemporal(id)) {
          diagnosticosTemporales.push({ id, superficieId });
        } else {
          diagnosticosPersistentes.push({ id, superficieId });
        }
      }


      for (const { id } of diagnosticosPersistentes) {
        try {
          await eliminarDiagnostico(id);
          // console.log('[DiagnosticoCard] ✓ Eliminado del backend:', id);
        } catch (error) {
          console.error('[DiagnosticoCard] Error eliminando del backend:', id, error);
          throw error;
        }
      }

      for (const { id, superficieId } of diagnostico.diagnosticoIds) {
        onRemove(id, superficieId);
      }

      const mensaje = diagnosticosTemporales.length > 0 && diagnosticosPersistentes.length > 0
        ? `Eliminado de ${diagnostico.superficies.length} superficie(s) (${diagnosticosTemporales.length} pendiente(s) de guardar)`
        : `Eliminado de ${diagnostico.superficies.length} superficie(s)`;

      addNotification({
        type: 'success',
        title: 'Diagnóstico eliminado',
        message: mensaje,
      });

    } catch (error) {
      console.error('[DiagnosticoCard] Error al eliminar:', error);

      addNotification({
        type: 'error',
        title: 'Error al eliminar',
        message: 'No se pudo eliminar el diagnóstico del servidor. Intenta nuevamente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const secondaryOptions = getSecondaryOptions();
  const hasSecondaryOptions = secondaryOptions && Object.keys(secondaryOptions).length > 0;
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={cardRef}
      className="relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-theme-md transition-shadow"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* TOOLTIP */}
      {showTooltip && (
        <div
          className="fixed w-80 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 pointer-events-none tooltip-animate"
          style={{
            zIndex: 9999,
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {/* Flecha del tooltip */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 ${
              tooltipPosition.isLeftSide 
                ? '-right-[9px] border-t-[8px] border-b-[8px] border-l-[8px] border-transparent border-l-gray-200 dark:border-l-gray-700'
                : '-left-[9px] border-t-[8px] border-b-[8px] border-r-[8px] border-transparent border-r-gray-200 dark:border-r-gray-700'
            }`}
          >
            <div 
              className={`absolute top-[-8px] w-0 h-0 border-t-[8px] border-b-[8px] ${
                tooltipPosition.isLeftSide
                  ? 'left-[-10px] border-l-[8px] border-transparent border-l-white dark:border-l-gray-800'
                  : 'right-[-10px] border-r-[8px] border-transparent border-r-white dark:border-r-gray-800'
              }`}
            ></div>
          </div>
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <span 
              className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
              style={{ backgroundColor: diagnostico.colorHex }}
            />
            <h4 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
              {diagnostico.nombre}
            </h4>
          </div>

          {/* Contenido del tooltip */}
          <div className="space-y-2.5 text-xs max-h-96 overflow-y-auto pr-2 custom-scrollbar-light dark:custom-scrollbar-dark">
            {/* Prioridad */}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Prioridad:</span>
              <span className={`font-semibold px-2 py-0.5 rounded ${priorityClass}`}>
                {diagnostico.prioridadKey}
              </span>
            </div>

            {/* Áreas afectadas */}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Áreas:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {diagnostico.areasafectadas?.join(', ') || 'N/A'}
              </span>
            </div>

            {/* Superficies */}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Superficies:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {diagnostico.superficies.length}
              </span>
            </div>

            {/* Superficies detalladas */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400 font-medium block mb-1.5">
                Detalles de superficie:
              </span>
              <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded break-words leading-relaxed">
                {superficiesDisplay}
              </div>
            </div>

            {/*  DETALLES CLÍNICOS */}
            {hasDetallesClinicos && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 font-medium block mb-1.5">
                  Detalles Clínicos:
                </span>
                <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/10 rounded-lg p-2.5 space-y-1.5 border border-brand-200 dark:border-brand-700">
                  {Object.entries(detallesClinicos!).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start gap-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
                        {formatLabel(key)}:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs text-right">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/*  NOTAS ADICIONALES */}
            {diagnostico.descripcion && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 font-medium block mb-1.5">
                  Notas Adicionales:
                </span>
                <div className="bg-amber-50 dark:bg-amber-900/10 border-l-3 border-amber-400 dark:border-amber-600 rounded p-2.5">
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    {diagnostico.descripcion}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL DEL CARD */}
      <div className="flex items-start gap-2.5">
        {/* Contenido principal */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header: Nombre + Prioridad */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: diagnostico.colorHex }} />
            <h4 className="text-sm font-semibold text-gray-900 truncate flex-1 min-w-0">{diagnostico.nombre}</h4>
            <span className={`flex-shrink-0 inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${priorityClass}`}>
              {diagnostico.prioridadKey}
            </span>
          </div>

          {/* Descripción */}
          {diagnostico.descripcion && (
            <p className="text-xs text-gray-600 line-clamp-2">{diagnostico.descripcion}</p>
          )}

          {/* Metadatos: Áreas afectadas */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1 truncate">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="truncate">{diagnostico.areasafectadas?.join(', ') || 'N/A'}</span>
            </div>
          </div>

          {/* Superficies aplicadas */}
          <div className="flex items-start gap-1.5 mt-2">
            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-medium ${getSurfaceBadgeStyle()}`}>
              {superficiesDisplay}
              {diagnostico.superficies.length > 1 && (
                <span className="ml-1 text-xs opacity-70">({diagnostico.superficies.length})</span>
              )}
            </span>
          </div>
        </div>

        {/* Botón de eliminar */}
        <button
          onClick={handleRemove}
          disabled={isDeleting}
          className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-error-50 hover:text-error-600 text-gray-400 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Eliminar diagnóstico"
        >
          {isDeleting ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};