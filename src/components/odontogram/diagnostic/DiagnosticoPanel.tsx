import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  SurfaceSelector,
  type SurfaceSelectorRef,
} from "../3d/SuperficieSelector";
import type {
  AreaAfectada,
  DiagnosticoEntry,
  OdontoColorKey,
} from "../../../core/types/typeOdontograma";
import type { PrincipalArea } from "../../../hooks/odontogram/useDiagnosticoSelect";
import { useCatalogoDiagnosticos } from "../../../hooks/odontogram/useCatalogoDiagnosticos";
import { useSurfaceSelection } from "../../../hooks/odontogram/useSurfaceSelection";

import { getToothTranslationByFdi } from "../../../core/utils/toothTraslations";
import type { useOdontogramaData } from "../../../hooks/odontogram/useOdontogramaData";
import { DiagnosticoSelect } from "..";
import { groupDentalSurfaces } from "../../../core/utils/groupDentalSurfaces";
import type { IPaciente } from "../../patients";
import { useGuardarOdontogramaCompleto } from "../../../hooks/odontogram/useGuardarOdontogramaCompleto";
import { getProcConfigFromCategories } from "../../../core/domain/diagnostic/procConfig";
import { eliminarDiagnostico } from "../../../services/odontogram/odontogramaService";
import { isToothBlockedByAbsence } from "../../../core/domain/diagnostic/blockingRules";
import { useToast } from "../../../hooks/useToast";
import { ToastContainer } from "../../ui/toast/ToastContainer";



type DiagnosticoPanelProps = {
  selectedTooth: string | null;
  odontogramaDataHook?: ReturnType<typeof useOdontogramaData>;
  pacienteActivoId?: IPaciente;
  onRootGroupChange?: (group: any) => void;
};

export const DiagnosticoPanel = ({
  selectedTooth,
  odontogramaDataHook,
}: DiagnosticoPanelProps) => {
  const { toast, toasts, removeToast } = useToast();
  if (!odontogramaDataHook) {
    return (
      <div className="w-[420px] h-full flex items-center justify-center bg-white border-l border-gray-200">
        <div className="text-center space-y-3 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Error de inicialización
            </p>
            <p className="text-xs text-gray-500">
              El hook del odontograma no está disponible
            </p>
          </div>
        </div>
      </div>
    );
  }

  


  const {
    applyDiagnostico,
    removeDiagnostico,
    lastSaveTime,
    odontogramaData,
    getPermanentColorForSurface,
    tipoDiagnosticoSeleccionado,
  } = odontogramaDataHook



  const {
    guardarCompleto,
    isSavingComplete,
    lastCompleteSave,
    hasPacienteActivo,
  } = useGuardarOdontogramaCompleto()


  // HOOKS DE DATOS
  const { categorias, isLoading, error } = useCatalogoDiagnosticos();
  const {
    getSurfacesForTooth,
    setSurfacesForTooth,
    clearSurfacesForTooth,

  } = useSurfaceSelection();

  const [showDiagnosticoSelect, setShowDiagnosticoSelect] = useState(false);
  const [currentArea, setCurrentArea] = useState<PrincipalArea | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const surfaceSelectorRef = useRef<SurfaceSelectorRef | null>(null);

  const selectedSurfaces = getSurfacesForTooth(selectedTooth);
  const isBlocked = selectedTooth ? odontogramaDataHook?.isToothBlocked(selectedTooth) : false;

  const toothDiagnoses = useMemo(() => {
    if (!selectedTooth || !odontogramaDataHook) return [];

    // Ahora TS sabe que selectedTooth es string aquí
    const data = odontogramaDataHook.getToothDiagnoses(selectedTooth);
    return Object.values(data).flat();
  }, [selectedTooth, odontogramaDataHook]);


  const toothInfo = useMemo(() => {
    if (!selectedTooth) return null;
    const data = getToothTranslationByFdi(selectedTooth);
    return {
      nombre: data?.nombre || `Diente #${selectedTooth}`,
      numero: data?.numero || 0,
    };
  }, [selectedTooth]);
  const [currentRootGroup, setCurrentRootGroup] = useState<string | null>(null);
  // AGRUPACIÓN DE SUPERFICIES
  const groupedSurfaces = useMemo(() => {
    return groupDentalSurfaces(selectedSurfaces, currentRootGroup);
  }, [selectedSurfaces, currentRootGroup]);

  // Obtener diagnósticos aplicados del diente seleccionado
  const diagnosticosAplicados = useMemo(() => {
    if (!selectedTooth || !odontogramaData[selectedTooth]) return [];

    const toothData = odontogramaData[selectedTooth];
    const hasAbsence = toothData && isToothBlockedByAbsence(
      Object.values(toothData).flat() as DiagnosticoEntry[]
    );
    const diagnosticos: any[] = [];

    Object.entries(toothData).forEach(
      ([superficieId, diagsArray]: [string, any]) => {
        (diagsArray as any[]).forEach((diag) => {
          const procConfig = getProcConfigFromCategories(diag.procedimientoId, categorias);
          diagnosticos.push({
            ...diag,
            superficieId,
            nombre: procConfig?.nombre || diag.procedimientoId,
            prioridadKey: procConfig?.prioridadKey || "INFORMATIVA",
          });
        });
      },
    );

    return diagnosticos;
  }, [selectedTooth, odontogramaData, categorias]);

  const hasGeneralDiagnosis = useMemo(
    () =>
      diagnosticosAplicados.some((d) =>
        d.areasafectadas?.includes("general"),
      ),
    [diagnosticosAplicados],
  );

  // Limpiar selección al cambiar de diente
  useEffect(() => {
    setShowDiagnosticoSelect(false);
    setCurrentArea(null);
  }, [selectedTooth]);


  // Bloqueo de diagnóstico por ausencia
  const allDiagnosticosTooth = Object.values(toothDiagnoses || {}).flat() as DiagnosticoEntry[];
  const isBlockedByAbsence = isToothBlockedByAbsence(allDiagnosticosTooth);


  // 

  const handleGuardarCompleto = useCallback(async () => {
    if (!odontogramaDataHook || !hasPacienteActivo) return;

    try {
      const rawData = odontogramaDataHook.exportData();
      console.log('[GuardarCompleto] rawData', rawData);

      // NUEVO: enviar todo el estado al backend
      await guardarCompleto(rawData);
      console.log('Odontograma completo guardado (backend deduplica)');
    } catch (error) {
      console.error('Error al guardar odontograma completo', error);
    }
  }, [odontogramaDataHook, guardarCompleto, hasPacienteActivo]);



  const handleAddDiagnostico = useCallback(() => {
    if (!selectedTooth ) return;
    setShowDiagnosticoSelect(true);
  }, [selectedTooth]);

  const handleCancelDiagnostico = useCallback(() => {
    setShowDiagnosticoSelect(false);
    if (selectedTooth) {
      clearSurfacesForTooth(selectedTooth);
    }
    surfaceSelectorRef.current?.clearRequiredAreaWarning();
  }, [selectedTooth, clearSurfacesForTooth]);

  const handleApplyDiagnostico = useCallback(
    (
      diagnosticoId: string,
      colorKey: OdontoColorKey,
      atributosClinicosSeleccionados: Record<string, any>,
      descripcion: string,
      areasAfectadas: AreaAfectada[]
    ) => {
      console.log('[Panel] handleApplyDiagnostico', {
        selectedTooth,
        selectedSurfaces,
        diagnosticoId,
        colorKey,
        atributosClinicosSeleccionados,
        descripcion,
        areasAfectadas,
      });

      if (!selectedTooth || !odontogramaDataHook) return;
    const toothData = odontogramaData[selectedTooth];
    const hasAbsence = toothData && isToothBlockedByAbsence(
      Object.values(toothData).flat() as DiagnosticoEntry[]
    );
      const isGeneral = areasAfectadas.includes('general');
      let surfacesToApply: string[] = [];

      if (isGeneral) {
        surfacesToApply = ['general'];
      } else {
        if (selectedSurfaces.length === 0) {
          console.warn('[Panel] Sin superficies seleccionadas');
          surfaceSelectorRef.current?.showRequiredAreaWarning(
            areasAfectadas as PrincipalArea[]
          );
          return;
        }

        const requiresCorona = areasAfectadas.includes('corona');
        const requiresRaiz = areasAfectadas.includes('raiz');

        const hasCoronaSurface = selectedSurfaces.some(s => s.startsWith('cara_'));
        const hasRaizSurface = selectedSurfaces.some(s => s.startsWith('raiz:'));

        if (requiresCorona && !hasCoronaSurface) {
          surfaceSelectorRef.current?.showRequiredAreaWarning(['corona']);
          return;
        }

        if (requiresRaiz && !hasRaizSurface) {
          surfaceSelectorRef.current?.showRequiredAreaWarning(['raiz']);
          return;
        }

        surfacesToApply = [...selectedSurfaces];
      }
      console.log('[Panel] Llamando applyDiagnostico con', {
        toothId: selectedTooth,
        surfacesToApply,
      });
      odontogramaDataHook.applyDiagnostico(
        selectedTooth,
        surfacesToApply,
        diagnosticoId,
        colorKey,
        atributosClinicosSeleccionados,
        descripcion,
        areasAfectadas
      );

      if (hasAbsence) {
        toast.info(
          'Diagnóstico de ausencia eliminado',
          `Pieza ${toothInfo?.numero}: El estado de ausente fue removido automáticamente`
        );
      } else {
        toast.success(
          'Diagnóstico agregado',
          `Pieza ${toothInfo?.numero} actualizada correctamente`
        );
      }


      clearSurfacesForTooth(selectedTooth);
      surfaceSelectorRef.current?.clearRequiredAreaWarning();
      setShowDiagnosticoSelect(false);
    },
    [selectedTooth, selectedSurfaces, applyDiagnostico, clearSurfacesForTooth, odontogramaData, odontogramaDataHook, toast, toothInfo]
  );

  const handleRemoveDiagnostico = useCallback(
    (diagId: string, superficieId: string) => {
      if (!selectedTooth) return;
      removeDiagnostico(selectedTooth, superficieId, diagId);
    },
    [selectedTooth, removeDiagnostico],
  );

  const handleSurfaceSelect = useCallback(
    (surfaces: string[]) => {
      if (selectedTooth) {
        setSurfacesForTooth(selectedTooth, surfaces);
      }
    },
    [selectedTooth, setSurfacesForTooth],
  );

  const handleAreaChange = useCallback((area: PrincipalArea | null) => {
    setCurrentArea(area);
  }, []);

  // ESTADOS DE CARGA Y ERROR
  if (isLoading) {
    return (
      <div className="w-[420px] h-full flex items-center justify-center bg-white border-l border-gray-200 flex-shrink-0">
        <div className="text-center space-y-3 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50">
            <svg
              className="w-6 h-6 text-brand-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Cargando catálogo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Obteniendo datos del servidor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[420px] h-full flex items-center justify-center bg-white border-l border-gray-200 flex-shrink-0">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-50">
            <svg className="w-6 h-6 text-error-500" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Error de conexión
            </h3>
            <p className="text-xs text-gray-600">
              No se pudo conectar con el servidor. Verifica tu conexión e
              intenta nuevamente.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full max-w-full flex flex-col bg-white border-l border-gray-200 shadow-theme-lg">
      {/* HEADER FIJO */}
      <div className="flex-shrink-0 px-5 py-3.5 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-white">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-gray-900">
              Panel de Diagnóstico
            </h2>
            {selectedTooth && toothInfo ? (
              <div className="mt-0.5 space-y-0.5">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {toothInfo.nombre}
                </p>
                <p className="text-xs text-gray-500">
                  Pieza #{toothInfo.numero}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                Selecciona un diente
              </p>
            )}
          </div>

          {/* Boton para cerrar el panel */}
          {selectedTooth &&
            !showDiagnosticoSelect &&(
              <button
                onClick={handleAddDiagnostico}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-all hover:shadow-focus-ring"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Añadir
              </button>
            )}
        </div>

        {/* Indicador de guardado */}
        {lastSaveTime && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-success-600">
            {/* icono check */}
            <span className="truncate">
              Guardado {lastSaveTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

        <div className="flex-1 min-h-0 overflow-y-auto ">
          {!selectedTooth ? (
            <EmptyState
              title="Selecciona un diente"
              description="Haz clic en un diente del odontograma 3D para gestionar diagnósticos."
            />
          ) : showDiagnosticoSelect ? (
            <div className="p-4 space-y-4 pb-4">
              {/* SELECTOR DE SUPERFICIES */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 shadow-theme-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-gray-900">
                      Superficies Dentales
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Selecciona áreas afectadas
                    </p>
                  </div>
                  <SelectedSurfacesBadge count={selectedSurfaces.length} />
                </div>

                <div className="flex justify-center bg-white rounded-lg border border-gray-200 p-3">
                  <SurfaceSelector
                    ref={surfaceSelectorRef}
                    selectedSurfaces={selectedSurfaces}
                    onSurfaceSelect={handleSurfaceSelect}
                    selectedTooth={selectedTooth}
                    isBlocked={isBlocked}
                    onAreaChange={handleAreaChange}
                    onRootGroupChange={setCurrentRootGroup}
                    getPermanentColorForSurface={getPermanentColorForSurface}
                    activeDiagnosisColor={(tipoDiagnosticoSeleccionado as any)?.colorHex ?? null}

                  />
                </div>

                {/* LISTA DE SUPERFICIES SELECCIONADAS CON AGRUPACIÓN */}
                {selectedSurfaces.length > 0 && (
                  <div className="mt-3">
                    <div className="p-2.5 bg-brand-50 rounded-lg border border-brand-100">
                      <p className="text-xs font-medium text-brand-700 mb-1.5">
                        Seleccionadas:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {groupedSurfaces.map((item, idx) => (
                          <SurfaceChip
                            key={`${item.type}-${idx}`}
                            surface={item.label}
                            isGroup={item.type === "group"}
                            isRoot={item.isRoot}
                            onRemove={() => {
                              if (item.type === "group") {
                                const remaining = selectedSurfaces.filter(
                                  (s) => !item.surfaces.includes(s),
                                );
                                handleSurfaceSelect(remaining);
                              } else {
                                handleSurfaceSelect(
                                  selectedSurfaces.filter((s) => s !== item.surface),
                                );
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SELECTOR DE DIAGNÓSTICO */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-theme-sm">
                <DiagnosticoSelect
                  onApply={handleApplyDiagnostico}
                  onCancel={handleCancelDiagnostico}
                  onPreviewChange={() => { }}
                  onPreviewOptionsChange={() => { }}
                  onFormValidChange={setIsFormValid}
                  currentArea={currentArea}
                  categorias={categorias}
                />
              </div>
            </div>
          ) : (
            <DiagnosticosListView
              diagnosticos={diagnosticosAplicados}
              onRemove={handleRemoveDiagnostico}
              toast={toast}
            />
          )}
        </div>

        {/* FOOTER STICKY CON BOTONES */}
        {selectedTooth && (
          <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-gray-50 p-4 shadow-lg">
            <div className="flex gap-3">
              {/* Botón principal: Añadir / Cancelar diagnóstico */}
              <button
                onClick={showDiagnosticoSelect ? handleCancelDiagnostico : handleAddDiagnostico}
                disabled={isBlockedByAbsence}
                className={
                  `flex-1 py-2.5 px-4 rounded-lg border font-medium transition-colors ` 
                }
              >
                {showDiagnosticoSelect ? 'Cancelar' : 'Añadir diagnóstico'}
              </button>
              {/* Botón secundario: Guardar odontograma completo */}
              <button
                onClick={handleGuardarCompleto}
                disabled={!hasPacienteActivo || isSavingComplete}
                className={
                  `flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white shadow-theme-sm transition-all ` +
                  (!hasPacienteActivo || isSavingComplete
                    ? 'bg-gray-300 cursor-not-allowed shadow-none text-gray-600'
                    : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800')
                }
              >
                {isSavingComplete ? 'Guardando…' : 'Guardar odontograma'}
              </button>
            </div>

            {/* Indicador de último guardado completo */}
            {lastCompleteSave && (
              <p className="mt-2 text-xs text-gray-500">
                Último guardado completo: {lastCompleteSave.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// COMPONENTES AUXILIARES

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="h-full flex items-center justify-center p-4">
    <div className="text-center space-y-2.5 max-w-xs">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth={1.5}
          />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </div>
);

const SelectedSurfacesBadge = ({ count }: { count: number }) => (
  <div
    className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${count > 0
      ? "bg-brand-100 text-brand-700"
      : "bg-gray-100 text-gray-600"
      }`}
  >
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>{count}</span>
  </div>
);

const SurfaceChip = ({
  surface,
  isGroup = false,
  isRoot = false,
  onRemove,
}: {
  surface: string;
  isGroup?: boolean;
  isRoot?: boolean;
  onRemove: () => void;
}) => {
  const displayName = isGroup
    ? surface
    : surface
      .replace("cara-", "")
      .replace("raiz-", "R ")
      .replace("-", " ")
      .replace("-g", "");

  // Estilos diferenciados para corona y raíz
  const getChipStyles = () => {
    if (isGroup) {
      if (isRoot) {
        // Raíz completa - estilo púrpura
        return "bg-purple-100 border border-purple-300 text-purple-800";
      }
      // Corona completa - estilo brand
      return "bg-brand-100 border border-brand-300 text-brand-800";
    }

    if (isRoot) {
      // Raíz individual - estilo morado claro
      return "bg-purple-50 border border-purple-200 text-purple-700";
    }

    // Corona individual - estilo brand claro
    return "bg-white border border-brand-200 text-brand-700";
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getChipStyles()}`}
    >
      <span className="capitalize truncate max-w-[120px]">{displayName}</span>
      <button
        onClick={onRemove}
        className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${isRoot ? "hover:bg-purple-200" : "hover:bg-brand-200"
          }`}
        aria-label="Remover"
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const DiagnosticosListView = ({
  diagnosticos,
  onRemove,
  toast,

}: {
  diagnosticos: any[];
  onRemove: (id: string, superficieId: string) => void;
  toast: ReturnType<typeof useToast>['toast'];
}) => {
  if (diagnosticos.length === 0) {
    return (
      <EmptyState
        title="Sin diagnósticos"
        description="Haz clic en Añadir para comenzar."
      />
    );
  }

  return (
    <div className="p-4 space-y-2.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Diagnósticos</h3>
        <span className="text-xs font-medium text-gray-500">
          {diagnosticos.length}
        </span>
      </div>
      {diagnosticos.map((diag) => (
        <DiagnosticoCard
          key={`${diag.id}-${diag.superficieId}`}
          diagnostico={diag}
          onRemove={onRemove}
          toast={toast}
        />
      ))}
    </div>
  );
};

const DiagnosticoCard = ({
  diagnostico,
  onRemove,
  toast,
}: {
  diagnostico: any;
  onRemove: (id: string, superficieId: string) => void;
  toast: ReturnType<typeof useToast>['toast'];
}) => {
  const priorityColors: Record<string, string> = {
    ALTA: "bg-error-50 border-error-200 text-error-700",
    MEDIA: "bg-warning-50 border-warning-200 text-warning-700",
    BAJA: "bg-success-50 border-success-200 text-success-700",
    ESTRUCTURAL: "bg-blue-light-50 border-blue-light-200 text-blue-light-700",
    INFORMATIVA: "bg-gray-50 border-gray-200 text-gray-700",
  };

  const priorityClass =
    priorityColors[diagnostico.prioridadKey] || priorityColors["INFORMATIVA"];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-theme-md transition-shadow">
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: diagnostico.colorHex }}
            />
            <h4 className="text-sm font-semibold text-gray-900 truncate flex-1 min-w-0">
              {diagnostico.nombre}
            </h4>
            <span className={`flex-shrink-0 inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${priorityClass}`}>
              {diagnostico.prioridadKey}
            </span>
          </div>
          {diagnostico.descripcion && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {diagnostico.descripcion}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1 truncate">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="truncate">
                {diagnostico.areasafectadas?.join(", ") || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-1 truncate">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="capitalize truncate">
                {diagnostico.superficieId
                  ?.replace("cara-", "")
                  .replace("raiz-", "R ")
                  .replace("-g", "") || "General"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            const superficie = diagnostico.superficieId || 'general';
            const ok = window.confirm(
              `¿Deseas eliminar el diagnóstico en superficie ${superficie}?`
            );
            if (!ok) return;

            try {
              await eliminarDiagnostico(diagnostico.id);
              onRemove(diagnostico.id, superficie);
              
              // ✅ Mostrar toast de éxito
              toast.success(
                'Diagnóstico eliminado',
                `Superficie ${superficie} actualizada`
              );
            } catch (e) {
              console.error('Error eliminando diagnóstico', e);
              // ✅ Mostrar toast de error
              toast.error(
                'Error al eliminar',
                'No se pudo eliminar el diagnóstico. Intenta nuevamente.'
              );
            }
          }}
          className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-error-50 hover:text-error-600 text-gray-400 flex items-center justify-center transition-colors"
          title="Eliminar"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

    </div>
  );
};
