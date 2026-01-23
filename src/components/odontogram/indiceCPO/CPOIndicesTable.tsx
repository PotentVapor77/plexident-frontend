// src/components/odontogram/CPOIndicesTable.tsx
import React, { useState } from 'react';
import { 
  Calculator, 
  Save, 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { OdontogramaData } from '../../../core/types/odontograma.types';
import type { CPOIndices } from '../../../services/odontogram/cpoService';
import { useCPOIndicesManager } from '../../../hooks/odontogram/indiceCPO/useCPOIndicesManager';

interface CPOIndicesTableProps {
  pacienteId: string | null;
  odontogramaData: OdontogramaData;
  savedIndices?: CPOIndices | null;
  isSaving?: boolean;
  showCalculatedOnly?: boolean;
  compact?: boolean;
  onRefresh?: () => Promise<void> | void;
  onIndicesCalculated?: (indices: CPOIndices) => void;
  defaultVisible?: boolean; 
  refreshTrigger?: number;
}
export interface CPOIndicesTableRef {
  refreshIndices: () => Promise<void>;
  getCurrentIndices: () => CPOIndices;
}
export const CPOIndicesTable: React.FC<CPOIndicesTableProps> = ({
  pacienteId,
  odontogramaData,
  isSaving = false,
  showCalculatedOnly = false,
  compact = false,
  onRefresh,
  defaultVisible = false, 
  refreshTrigger = 0,

}) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  // Usar el hook manager
  const {
    displayIndices,
    loadingSaved,
    isCalculating,
    isSaved,
    isCalculated,
    errors,
    refreshAll,
  } = useCPOIndicesManager(pacienteId, odontogramaData);

  // Usar savedIndices externos o del hook


  // Manejar refresco manual
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      await refreshAll();
    }
  };

if (!isVisible && !showCalculatedOnly) {
    return (
      <div className="absolute bottom-4 right-4 z-99 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsVisible(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 group"
            title="Mostrar índice CPO"
          >
            <Calculator className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-gray-700">CPO</span>
            {displayIndices.total > 0 && (
              <span className="text-xs font-bold text-brand-600 animate-pulse">
                {displayIndices.total}
              </span>
            )}
            <Eye className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
        </div>
      </div>
    );
  }

  // Si está oculto pero showCalculatedOnly es true, mostrar versión minimalista
  if (!isVisible && showCalculatedOnly) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
        <Calculator className="w-3.5 h-3.5 text-brand-600" />
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-red-600">C:{displayIndices.C}</span>
          <span className="text-xs font-semibold text-gray-600">P:{displayIndices.P}</span>
          <span className="text-xs font-semibold text-blue-600">O:{displayIndices.O}</span>
          <span className="text-xs font-bold text-gray-900">Σ:{displayIndices.total}</span>
        </div>
      </div>
    );
  }

  // Si hay error y no hay datos, mostrar mensaje simple
  if (errors.saved && errors.calculation && displayIndices.total === 0) {
    if (showCalculatedOnly) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/90 rounded-lg border border-gray-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-gray-600">Error calculando CPO</span>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Índice CPO</h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ocultar"
          >
            <EyeOff className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="text-center py-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No se pudieron calcular los índices</p>
        </div>
      </div>
    );
  }

  if (showCalculatedOnly) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
        <Calculator className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-medium text-gray-700">CPO:</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-red-600">C: {displayIndices.C}</span>
          <span className="text-sm font-semibold text-gray-600">P: {displayIndices.P}</span>
          <span className="text-sm font-semibold text-blue-600">O: {displayIndices.O}</span>
          <span className="text-sm font-bold text-gray-900">Total: {displayIndices.total}</span>
          {isCalculated && (
            <span className="text-xs text-amber-600 animate-pulse">*</span>
          )}
        </div>
      </div>
    );
  }

  const isLoading = loadingSaved || isCalculating;

  return (
    <div className={`absolute bottom-4 right-4 z-[99] pointer-events-none ${compact ? '' : ''} flex flex-col items-end gap-2`}>
      
      <div className="pointer-events-auto bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden transition-all duration-300 animate-slide-in-right w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
        
        {/* Header con botón de ocultar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isLoading ? 'bg-gray-100' : 'bg-gradient-to-br from-brand-50 to-blue-light-50'}`}>
              <Calculator className={`w-5 h-5 transition-colors ${isLoading ? 'text-gray-400' : 'text-brand-600'}`} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-gray-900 whitespace-nowrap">Índice CPO</h3>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500 truncate">
                  {isLoading ? 'Calculando...' : isSaved ? 'Guardado' : isCalculated ? 'Calculado' : 'Listo'}
                </p>
                {isCalculated && !isLoading && (
                  <span className="text-xs text-amber-600 animate-pulse flex-shrink-0">●</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isCalculated && !isLoading && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-full border border-amber-200 animate-pulse whitespace-nowrap">
                <AlertTriangle className="w-3 h-3" />
                <span>Cambios</span>
              </div>
            )}

            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              title="Ocultar índice CPO"
            >
              <EyeOff className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contenido colapsable */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {/* CAMBIO 3: Estabilización de las tarjetas internas
               Se extrajo la lógica visual a un patrón repetible pero estable.
               h-full asegura que llenen la grilla, min-h ayuda a mantener estructura.
            */}
            
            {/* Caries (C) */}
            <div className="flex flex-col items-center justify-between p-2 rounded-lg bg-gradient-to-b from-red-50 to-white border border-red-100 transition-all hover:border-red-200 min-h-[100px]">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${isSaved ? 'bg-red-100' : 'bg-red-50'}`}>
                <span className="text-sm font-bold text-red-600">C</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center">
                <span className={`text-2xl font-bold transition-colors ${isSaved ? 'text-red-700' : 'text-red-600/70'}`}>
                  {displayIndices.C}
                </span>
                {!isSaved && !isLoading && (
                  <div className="absolute -top-1 -right-3 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                    <TrendingUp className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Cariados</span>
            </div>

            {/* Perdidos (P) */}
            <div className="flex flex-col items-center justify-between p-2 rounded-lg bg-gradient-to-b from-gray-50 to-white border border-gray-200 transition-all hover:border-gray-300 min-h-[100px]">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${isSaved ? 'bg-gray-100' : 'bg-gray-50'}`}>
                <span className="text-sm font-bold text-gray-700">P</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center">
                <span className={`text-2xl font-bold transition-colors ${isSaved ? 'text-gray-800' : 'text-gray-600/70'}`}>
                  {displayIndices.P}
                </span>
                {!isSaved && !isLoading && (
                  <div className="absolute -top-1 -right-3 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                    <TrendingUp className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Perdidos</span>
            </div>

            {/* Obturados (O) */}
            <div className="flex flex-col items-center justify-between p-2 rounded-lg bg-gradient-to-b from-blue-50 to-white border border-blue-100 transition-all hover:border-blue-200 min-h-[100px]">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${isSaved ? 'bg-blue-100' : 'bg-blue-50'}`}>
                <span className="text-sm font-bold text-blue-600">O</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center">
                <span className={`text-2xl font-bold transition-colors ${isSaved ? 'text-blue-700' : 'text-blue-600/70'}`}>
                  {displayIndices.O}
                </span>
                {!isSaved && !isLoading && (
                  <div className="absolute -top-1 -right-3 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                    <TrendingUp className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Obturad.</span>
            </div>

            {/* Total */}
            <div className="flex flex-col items-center justify-between p-2 rounded-lg bg-gradient-to-b from-brand-50 to-white border border-brand-100 transition-all hover:border-brand-200 min-h-[100px]">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${isSaved ? 'bg-brand-100' : 'bg-brand-50'}`}>
                <span className="text-sm font-bold text-brand-600">Σ</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center">
                <span className={`text-2xl font-bold transition-colors ${isSaved ? 'text-brand-700' : 'text-brand-600/70'}`}>
                  {displayIndices.total}
                </span>
                {!isSaved && !isLoading && (
                  <div className="absolute -top-1 -right-3 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                    <TrendingUp className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Total</span>
            </div>
          </div>

          {/* Estado y leyenda */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            {isSaving ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg animate-pulse w-full">
                <Save className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Guardando...</span>
              </div>
            ) : errors.saved ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-error-50 rounded-lg w-full">
                <AlertTriangle className="w-4 h-4 text-error-600 flex-shrink-0" />
                <span className="text-sm text-error-700 truncate">{errors.saved}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isSaved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isSaved ? 'Sincronizado' : 'Pendiente'}
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  <RefreshCw className={`w-3 h-3 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="text-xs text-gray-700 font-medium">
                    {isLoading ? 'Actualizando...' : 'Actualizar índices'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};