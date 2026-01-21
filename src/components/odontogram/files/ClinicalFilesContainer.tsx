// src/components/odontogram/files/ClinicalFilesContainer.tsx
import React, { useEffect, useRef, useState } from "react";
import { X, File as FileIcon, FileText, Image as ImageIcon, Eye, AlertCircle } from "lucide-react";
import { FileUploadButton } from "./FileUploadButton";
import { usePacienteActivo } from "../../../context/PacienteContext";
import { useClinicalFilesContext } from "../../../context/ClinicalFilesContext";

interface ClinicalFilesContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const isImageFile = (file: File) =>
  file.type.startsWith("image/") ||
  /\.(png|jpe?g|gif|bmp|webp)$/i.test(file.name);

const PendingFilePreview: React.FC<{ file: File }> = ({ file }) => {
  const img = isImageFile(file);
  const pdf = isPdfFile(file);

  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!img) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, img]);

  // Mini preview (imagen) o fallback (pdf/otros)
  return (
    <div className="h-11 w-11 shrink-0 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
      {img && imgUrl ? (
        <img src={imgUrl} alt={file.name} className="h-full w-full object-cover" />
      ) : pdf ? (
        <FileText className="h-5 w-5 text-red-500" />
      ) : (
        <FileIcon className="h-5 w-5 text-gray-500" />
      )}
    </div>
  );
};

export const ClinicalFilesContainer: React.FC<ClinicalFilesContainerProps> = ({
  isOpen,
  onClose,
}) => {
  const { pacienteActivo } = usePacienteActivo();
  const {
    pendingFiles,
    addPendingFile,
    removePendingFile,
    isUploading,
    hasPendingFiles,
    canAddMore,
    remainingSlots,
    error,
    clearError,
  } = useClinicalFilesContext();

  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape + click fuera (manteniendo click en el botón verde)
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const panel = panelRef.current;
      const toggleBtn = document.getElementById("clinical-files-toggle-btn");

      if (panel && panel.contains(target)) return;
      if (toggleBtn && toggleBtn.contains(target)) return;

      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const patientLabel = pacienteActivo
    ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
    : "Selecciona un paciente para adjuntar archivos.";

  return (
    <div
      ref={panelRef}
      className="
        absolute bottom-4 left-16 z-[70]
        w-[22rem] max-w-[calc(100vw-2rem)]
        max-h-[calc(100%-2rem)]
        rounded-xl border border-gray-200 bg-white shadow-theme-xl
        flex flex-col overflow-hidden
      "
      role="dialog"
      aria-label="Archivos clínicos"
    >
      {/* “Flechita” hacia el botón */}
      <div
        className="
          absolute left-[-6px] bottom-5
          h-3 w-3 rotate-45
          border-l border-b border-gray-200 bg-white
        "
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Archivos clínicos</p>
          <p className="text-xs text-gray-500 truncate">{patientLabel}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          title="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="p-1 rounded text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {pendingFiles.length > 0 && (
          <div className="mx-4 mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              {pendingFiles.length} / 10 archivos
              {remainingSlots > 0 && ` (puedes agregar ${remainingSlots} más)`}
            </p>
          </div>
        )}


      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar">
        {!hasPendingFiles ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-3">
            <div className="flex items-center gap-2 text-gray-600">
              <ImageIcon className="h-4 w-4" />
              <p className="text-xs">No hay archivos pendientes.</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {pendingFiles.map((f) => {
              const pdf = isPdfFile(f.file);
              return (
                <li
                  key={f.tempId}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                >
                  <PendingFilePreview file={f.file} />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {f.file.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {formatFileSize(f.file.size)}
                      {pdf ? " • PDF" : isImageFile(f.file) ? " • Imagen" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {pdf && (
                      <button
                        type="button"
                        className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        title="Ver PDF"
                        onClick={() => {
                          const url = URL.createObjectURL(f.file);
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removePendingFile(f.tempId)}
                      className="p-1 rounded-md text-error-500 hover:text-error-700 hover:bg-error-50"
                      title="Quitar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {hasPendingFiles && (
          <p className="text-[11px] text-gray-500">
            Los archivos se subirán al presionar “Guardar todo”.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <FileUploadButton
            pendingFiles={pendingFiles}
            onAddFile={(file) => addPendingFile(file, "OTHER")}
            onRemoveFile={removePendingFile}
            disabled={!pacienteActivo || isUploading || !canAddMore}
          />
        {!canAddMore && (
            <p className="text-xs text-orange-600 mt-2 text-center">
              Límite de 10 archivos alcanzado
            </p>
          )}

      </div>
    </div>
  );
};
