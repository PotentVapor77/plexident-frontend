// src/components/odontogram/OdontogramaViewer.tsx

import { useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OdontogramaModel } from "./3d/OdontogramaModel";
import {
  CameraControls,
  VIEW_PRESETS,
  type ViewPresetKey,
  PerspectiveButtons,
} from "./3d/CameraControls";
import { type DatosDiente, type Diagnostico } from "./preview/ToothStatusDisplay";
import { DentalBackground } from "../../hooks/gradients/DentalGradient";
import { PanelPreviewDiente } from "./preview/ToothPreviewPanel";
import { getToothTranslationByFdi } from "../../core/utils/toothTraslations";
import { DiagnosticoPanel } from "./diagnostic/DiagnosticoPanel";
import React from "react";
import { usePacienteActivo } from "../../context/PacienteContext";
import type { IPaciente } from "../../types/patient/IPatient";
import { NoPacienteOverlay } from "./patient/NoPacienteOverlay";
import { PacienteFloatingButton } from "./patient/PacienteFloatingButton";
import { PacienteInfoPanel } from "./patient/PacienteInfoPanel";
import { useOdontogramaData } from "../../hooks/odontogram/useOdontogramaData";
import { useCargarOdontogramaCompleto } from "../../hooks/odontogram/useCargarOdontogramaCompleto";
import type { DiagnosticoEntry } from "../../core/types/odontograma.types";
import { useCatalogoDiagnosticos } from "../../hooks/odontogram/useCatalogoDiagnosticos";
import { getProcConfigFromCategories } from "../../core/domain/diagnostic/procConfig";
import { Upload } from "lucide-react";
import type { PendingFile } from "../../services/clinicalFiles/clinicalFilesService";

type FilePanelProps = {
  pendingFiles: PendingFile[];
  addPendingFile: (file: File) => void;
  removePendingFile: (tempId: string) => void;
  uploadAllPendingFiles: () => Promise<void>;
  isUploading: boolean;
  isOpen: boolean;
  onClose: () => void;
};
type OdontogramaViewerProps = {
  onSelectTooth: React.Dispatch<React.SetStateAction<string | null>>;
  freezeResize: boolean;

  // Carga de archivos odontograma
  onOpenFileUpload?: () => void;
  pendingFilesCount?: number;
  filePanelProps?: FilePanelProps;
};



export const OdontogramaViewer = ({
  onSelectTooth,
  freezeResize,
  onOpenFileUpload,
  pendingFilesCount = 0,
}: OdontogramaViewerProps) => {
  // Estado de paciente
  const { pacienteActivo, setPacienteActivo } = usePacienteActivo();


  const [isPacientePanelCollapsed, setIsPacientePanelCollapsed] = React.useState(true);
  // Hooks odontograma
  const odontogramaDataHook = useOdontogramaData();
  const { getPreviewColor, getToothDiagnoses, odontogramaData } =
    odontogramaDataHook;
  const { loadFromBackend } = odontogramaDataHook;
  const { categorias } = useCatalogoDiagnosticos();
  const [selectedTooth, setSelectedTooth] = React.useState<string | null>(null);
  const [previewProcId, setPreviewProcId] = React.useState<string | null>(null);
  const [previewOptions, setPreviewOptions] = React.useState<Record<string, any>>({});

  //const [selectedToothFdiId, setSelectedToothFdiId] = React.useState<string | null>(null);

  const [currentView, setCurrentView] = React.useState<ViewPresetKey>("FRONT");
  const [isJawOpen, setIsJawOpen] = React.useState(false);
  const { cargarOdontograma } = useCargarOdontogramaCompleto();
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!pacienteActivo) {
      console.log('[VIEWER] No hay pacienteActivo, no cargo odontograma');
      return;
    }

    console.log('[VIEWER] useEffect cargar odontograma para paciente', pacienteActivo.id);

    (async () => {
      const data = await cargarOdontograma(pacienteActivo.id);
      //console.log('[VIEWER] Resultado cargarOdontograma:', data);

      if (data) {
        //console.log('[VIEWER] Llamando loadFromBackend con data');
        loadFromBackend(data);
        //console.log('[VIEWER] Estado odontogramaData tras loadFromBackend:', odontogramaData);
      } else {
        //console.warn('[VIEWER] cargarOdontograma devolvió null, no se carga');
      }
    })();
  }, [pacienteActivo, cargarOdontograma, loadFromBackend]);

  // Handlers
  const handleSelectTooth = (tooth: string | null) => {
    if (!pacienteActivo) {
      console.warn("No se puede seleccionar diente sin paciente activo");
      return;
    }
    console.log("[VIEWER] handleSelectTooth llamado con:", tooth);

    setSelectedTooth(tooth);

    onSelectTooth(tooth);
    setPreviewProcId(null);
    setPreviewOptions({});
  };

  const handleSelectPaciente = (paciente: IPaciente) => {
    //console.log("Paciente seleccionado:", paciente);
    setPacienteActivo(paciente);
    setSelectedTooth(null);
    onSelectTooth(null);
    setIsPacientePanelCollapsed(true);
  };

  const handleRemovePaciente = () => {
    console.log("Paciente removido");
    setPacienteActivo(null);
    setSelectedTooth(null);
    onSelectTooth(null);
  };

  // Computed values
  const currentToothData: DatosDiente | null = useMemo(() => {
  if (!selectedTooth || !categorias) return null;

  const toothData = getToothDiagnoses(selectedTooth);
  const allEntries = Object.values(toothData).flat() as DiagnosticoEntry[];
  if (!allEntries.length) return null;

  const diagnosticos: Diagnostico[] = allEntries
    .map((entry) => {
      const procConfig = getProcConfigFromCategories(entry.procedimientoId, categorias);
      if (!procConfig) return null;

      return {
        id: entry.id,
        key: entry.key || entry.procedimientoId,           
        procedimientoId: entry.procedimientoId,            
        siglas: entry.siglas || procConfig.siglas || '?',  
        nombre: entry.nombre || procConfig.nombre,
        prioridadKey: entry.prioridadKey || procConfig.prioridadKey,
        areasafectadas: entry.areasafectadas,
        categoria: procConfig.categoria,                  
      } as Diagnostico;
    })
    .filter((d): d is Diagnostico => d !== null);

  return diagnosticos.length ? { diagnósticos: diagnosticos } : null;
}, [selectedTooth, getToothDiagnoses, categorias]);

  const previewColorHex = useMemo(() => {
    if (!selectedTooth || !previewProcId) return null;
    return getPreviewColor(previewProcId, previewOptions);
  }, [selectedTooth, previewProcId, previewOptions, getPreviewColor]);

  // ===============================
  // RESIZE OBSERVER ESTABLE
  // ===============================
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;

    let animationFrame: number | null = null;

    const handleResize = () => {
      if (freezeResize) return;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      container.classList.add("is-resizing");
      animationFrame = requestAnimationFrame(() => {
        container.classList.remove("is-resizing");
      });
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [freezeResize]);

  

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* COLUMNA IZQUIERDA: Canvas + overlays internos */}
      <div
        style={{
          position: "relative",
          flex: 1,
          height: "100%",
        }}
      >
        {/* OVERLAY: Bloqueo cuando no hay paciente */}
        {!pacienteActivo && <NoPacienteOverlay />}

        {/* PANEL DE INFORMACIÓN DEL PACIENTE (top-left) */}
        {pacienteActivo && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 50,
            }}
          >
            <PacienteInfoPanel
              paciente={pacienteActivo}
              onRemovePaciente={handleRemovePaciente}
              collapsed={isPacientePanelCollapsed}
              onToggleCollapsed={() =>
                setIsPacientePanelCollapsed((prev) => !prev)
              }
            />
          </div>
        )}

        {/* CONTENEDOR DEL CANVAS - ocupa toda la columna izquierda */}
        <div
          ref={canvasContainerRef}
          style={{
            position: "absolute",
            inset: 0,
            transition: "opacity 300ms",
            opacity: !pacienteActivo ? 0.3 : 1,
            pointerEvents: !pacienteActivo ? "none" : "auto",
            overflow: "hidden",
            zIndex: 0,
          }}
          className="flex w-full h-full bg-gray-100"
        >
          <div className="relative flex-grow h-full overflow-hidden">
            {/* Canvas 3D */}
            <Canvas
              camera={{
                position: VIEW_PRESETS.FRONT.position,
                fov: 15,
              }}
              dpr={[1, 1.5]}
              frameloop="demand"
              resize={{ debounce: 0 }}
              gl={{
                antialias: true,
                powerPreference: "high-performance",
              }}
            >
              <DentalBackground />

              <ambientLight intensity={0.9} />{/* Antes: 1.5 → Ahora: 0.6 */}
              <directionalLight position={[5, 10, 5]} intensity={1.5} />{/* Antes: 1.8 → Ahora: 0.8 */}
              <directionalLight position={[-5, -5, -5]} intensity={0.2} />{/* Antes: 0.5 → Ahora: 0.3 */}

              <CameraControls
                currentView={currentView}
                setJawOpenState={setIsJawOpen}
              />

              <OdontogramaModel
                selectedTooth={selectedTooth}
                setSelectedTooth={handleSelectTooth}
                previewColorHex={previewColorHex}
                odontogramaDataHook={odontogramaDataHook}
                isJawOpen={isJawOpen}
              />
            </Canvas>

            {/* Botones de perspectiva */}
            <PerspectiveButtons
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          </div>

          {/* PANEL DE PREVIEW (top-right dentro del canvas container) */}
          {pacienteActivo && (
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 30,
                width: 360,
              }}
            >
              <PanelPreviewDiente
                dienteSeleccionado={selectedTooth}
                datosDiente={currentToothData}
              />
            </div>
          )}

          {/* INFO DIENTE SELECCIONADO (bottom-center) */}
          {pacienteActivo && selectedTooth && (
            <div className="absolute bottom-4 left-1/2 z-99 -translate-x-1/2 pointer-events-none">
              <div
                className="
        flex items-center gap-3
        rounded-full
        border border-brand-200
        bg-white/70
        px-5 py-3
        shadow-theme-lg
        backdrop-blur-md
        animate-pulse-soft
        dark:border-brand-500/30
        dark:bg-gray-900/70
      "
              >
                {/* Indicador visual */}
                <span
                  className="
          h-2.5 w-2.5 rounded-full
          bg-brand-500
          shadow-[0_0_0_4px_rgba(70,95,255,0.15)]
        "
                />

                {/* Texto */}
                <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  <span className="text-gray-500 dark:text-gray-400">
                    Diente seleccionado:
                  </span>{" "}
                  {(() => {
                    const { nombre, numero } = getToothTranslationByFdi(selectedTooth);
                    return (
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        {nombre} <span className="text-gray-400">#{numero}</span>
                      </span>
                    );
                  })()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTÓN FLOTANTE: Carga de archivos */}

        {pacienteActivo && onOpenFileUpload && (
            <button
              onClick={onOpenFileUpload}
              className="absolute bottom-4 left-4 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 group"
              title="Adjuntar archivos clínicos"
            >
              <Upload className="w-5 h-5" />
              {pendingFilesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {pendingFilesCount}
                </span>
              )}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {pendingFilesCount > 0
                  ? `${pendingFilesCount} archivo(s) pendiente(s)`
                  : "Adjuntar archivos"}
              </span>
            </button>
          )}

        {/* BOTÓN FLOTANTE: Selector de paciente */}
        <PacienteFloatingButton onSelectPaciente={handleSelectPaciente} />
      </div>

      {/* COLUMNA DERECHA: Panel de diagnóstico fijo, sin flotante */}
      {pacienteActivo && (
        <div
          style={{
            width: 360,
            maxWidth: "100%",
            height: "100%",
            borderLeft: "1px solid rgb(229,231,235)",
            background: "white",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <DiagnosticoPanel
            selectedTooth={selectedTooth}
            odontogramaDataHook={odontogramaDataHook}
          />
        </div>
      )}
    </div>
  );
};

