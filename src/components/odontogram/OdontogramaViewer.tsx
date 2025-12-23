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
import { useOdontogramaData } from "../../hooks/odontogram/useOdontogramaData";
import { DentalBackground } from "../../hooks/gradients/DentalGradient";
import { PanelPreviewDiente } from "./preview/ToothPreviewPanel";
import { toothTranslations } from "../../core/utils/toothTraslations";
import { DiagnosticoPanel } from "./diagnostic/DiagnosticoPanel";
import { DiagnosticosGrid } from "./diagnostic/DiagnosticosGrid";
import React from "react";

import { usePacienteActivo } from "../../context/PacienteContext";
import type { IPaciente } from "../../types/patient/IPatient";
import { NoPacienteOverlay } from "./patient/NoPacienteOverlay";
import { PacienteFloatingButton } from "./patient/PacienteFloatingButton";
import { PacienteInfoPanel } from "./patient/PacienteInfoPanel";

type OdontogramaViewerProps = {
  onSelectTooth: React.Dispatch<React.SetStateAction<string | null>>;
  freezeResize: boolean;
};

export const OdontogramaViewer = ({
  onSelectTooth,
  freezeResize,
}: OdontogramaViewerProps) => {
  // Estado de paciente
  const { pacienteActivo, setPacienteActivo } = usePacienteActivo();
  const [isPacientePanelCollapsed, setIsPacientePanelCollapsed] = React.useState(true);
  // Hooks odontograma
  const odontogramaDataHook = useOdontogramaData();
  const { getPreviewColor, getToothDiagnoses, getProcConfig, odontogramaData, removeDiagnostico } =
    odontogramaDataHook;

  const [selectedTooth, setSelectedTooth] = React.useState<string | null>(null);
  const [previewProcId, setPreviewProcId] = React.useState<string | null>(null);
  const [previewOptions, setPreviewOptions] = React.useState<Record<string, any>>({});

  const [currentView, setCurrentView] = React.useState<ViewPresetKey>("FRONT");
  const [isJawOpen, setIsJawOpen] = React.useState(false);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Handlers
  const handleSelectTooth = (tooth: string | null) => {
    if (!pacienteActivo) {
      console.warn("No se puede seleccionar diente sin paciente activo");
      return;
    }
    setSelectedTooth(tooth);
    onSelectTooth(tooth);
    setPreviewProcId(null);
    setPreviewOptions({});
  };

  const handleSelectPaciente = (paciente: IPaciente) => {
    console.log("✅ Paciente seleccionado:", paciente);
    setPacienteActivo(paciente);
    setSelectedTooth(null);
    onSelectTooth(null);
    setIsPacientePanelCollapsed(true);
  };

  const handleRemovePaciente = () => {
    console.log("❌ Paciente removido");
    setPacienteActivo(null);
    setSelectedTooth(null);
    onSelectTooth(null);
  };

  // Computed values
  const currentToothData: DatosDiente | null = useMemo(() => {
    if (!selectedTooth) return null;
    const diagnosticoEntries = getToothDiagnoses(selectedTooth);
    if (!diagnosticoEntries?.length) return null;

    const diagnosticos: Diagnostico[] = diagnosticoEntries
      .map((entry) => {
        const procConfig = getProcConfig(entry.procedimientoId);
        if (!procConfig) return null;
        return {
          id: entry.id,
          nombre: procConfig.nombre,
          prioridadKey: procConfig.prioridadKey,
          areas_afectadas: entry.areas_afectadas,
        };
      })
      .filter(Boolean) as Diagnostico[];

    return diagnosticos.length ? { diagnósticos: diagnosticos } : null;
  }, [selectedTooth, getToothDiagnoses, getProcConfig]);

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

              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 10, 5]} intensity={1.8} />
              <directionalLight position={[-5, -5, -5]} intensity={0.5} />

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
            <div
              style={{
                position: "absolute",
                bottom: 80,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 15,
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  padding: "12px 24px",
                  borderRadius: 9999,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  border: "1px solid rgb(191, 219, 254)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "rgb(55, 65, 81)",
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  Diente seleccionado{" "}
                  <span
                    style={{
                      fontWeight: 700,
                      color: "rgb(37, 99, 235)",
                    }}
                  >
                    {toothTranslations[selectedTooth]?.nombre || selectedTooth} (
                    #{toothTranslations[selectedTooth]?.numero || "?"})
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* GRID DE DIAGNÓSTICOS (bottom-left) */}
          {pacienteActivo && (
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                zIndex: 10,
              }}
            >
              <DiagnosticosGrid
                selectedTooth={selectedTooth}
                odontogramaData={odontogramaData}
                removeDiagnostico={removeDiagnostico}
              />
            </div>
          )}
        </div>

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