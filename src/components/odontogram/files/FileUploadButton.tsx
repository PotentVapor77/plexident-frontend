// src/components/odontogram/files/FileUploadButton.tsx
import React, { useRef } from "react";
import { Upload, X, File, Image, FileText } from "lucide-react";
import type { PendingFile } from "../../../services/clinicalFiles/clinicalFilesService";

interface FileUploadButtonProps {
  pendingFiles: PendingFile[];
  onAddFile: (file: File) => void;
  onRemoveFile: (tempId: string) => void;
  disabled?: boolean;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  pendingFiles,
  onAddFile,
  onRemoveFile,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      onAddFile(file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext || "")) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    if (["pdf", "doc", "docx"].includes(ext || "")) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-2">
      {/* Botón para abrir selector */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Upload className="w-4 h-4" />
        <span className="text-sm">Adjuntar archivos</span>
        {pendingFiles.length > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-[11px] rounded-full bg-white/20">
            {pendingFiles.length}
          </span>
        )}
      </button>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Lista de archivos pendientes */}
      {pendingFiles.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-auto">
          {pendingFiles.map((pending) => (
            <div
              key={pending.tempId}
              className="flex items-center justify-between gap-2 text-xs bg-gray-50 rounded-md px-2 py-1"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(pending.file.name)}
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{pending.file.name}</span>
                  <span className="text-[10px] text-gray-500">
                    {formatFileSize(pending.file.size)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(pending.tempId)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Eliminar"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingFiles.length > 0 && (
        <p className="text-[10px] text-gray-500">
          Los archivos se subirán al presionar &quot;Guardar todo&quot;.
        </p>
      )}
    </div>
  );
};
