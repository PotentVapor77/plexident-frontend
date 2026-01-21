// src/components/odontogram/files/FileUploadButton.tsx
import React, { useRef } from "react";
import { Upload, X, File as FileIcon, Image, FileText } from "lucide-react";
import type { PendingFile } from "../../../services/clinicalFiles/clinicalFilesService";

interface FileUploadButtonProps {
  pendingFiles: PendingFile[];
  onAddFile: (file: File) => void;
  onRemoveFile: (tempId: string) => void;
  disabled?: boolean;

  // NUEVO
  showList?: boolean;
  label?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  pendingFiles,
  onAddFile,
  onRemoveFile,
  disabled = false,
  showList = true,
  label = "Adjuntar archivos",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => onAddFile(file));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext || "")) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    if (["pdf", "doc", "docx"].includes(ext || "")) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <FileIcon className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Upload className="w-4 h-4" />
        <span className="text-sm">{label}</span>
        {pendingFiles.length > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-[11px] rounded-full bg-white/20">
            {pendingFiles.length}
          </span>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

    </div>
  );
};
