// src/components/odontogram/files/ClinicalFilesContainer.tsx
import React from "react";
import { FileUploadButton } from "./FileUploadButton";
import { usePacienteActivo } from "../../../context/PacienteContext";
import { useClinicalFilesContext } from "../../../context/ClinicalFilesContext";

interface ClinicalFilesContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  } = useClinicalFilesContext(); // estado compartido

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-y-4 right-4 z-40    /* ⬅️ lado derecho, separada del menú */
        flex flex-col
        w-64 max-w-[18rem]              /* ⬅️ más compacto que el panel principal */
        max-h-[calc(100vh-2rem)]
        rounded-lg shadow-lg
        border border-gray-200
        bg-white dark:bg-gray-900
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
            Archivos clínicos
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {pacienteActivo
              ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
              : "Selecciona un paciente para adjuntar archivos."}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[11px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cerrar
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {hasPendingFiles ? (
          <ul className="space-y-1.5">
            {pendingFiles.map((f) => (
              <li
                key={f.tempId}
                className="flex items-center justify-between text-[11px] px-2 py-1 rounded border border-gray-200 dark:border-gray-700"
              >
                <span className="truncate max-w-[70%] text-gray-700 dark:text-gray-200">
                  {f.file.name}
                </span>
                <button
                  onClick={() => removePendingFile(f.tempId)}
                  className="text-[11px] text-error-500 hover:text-error-700"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-gray-400">
            No hay archivos pendientes.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
        <FileUploadButton
          pendingFiles={pendingFiles}
          onAddFile={(file) => addPendingFile(file, "OTHER")}
          onRemoveFile={removePendingFile}
          disabled={!pacienteActivo || isUploading}
        />
      </div>
    </div>
  );
};
