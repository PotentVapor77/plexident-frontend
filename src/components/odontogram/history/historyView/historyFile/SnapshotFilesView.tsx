// src/components/odontogram/history/historyView/SnapshotFilesView.tsx
import { Paperclip, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useSnapshotFiles } from '../../../../../hooks/clinicalFiles/useSnapshotFiles';


interface SnapshotFilesViewProps {
    pacienteId: string;
    snapshotId: string;
}

const isImage = (mime: string, name: string) =>
    mime.startsWith('image/') || /\.(png|jpe?g|gif|bmp|webp)$/i.test(name);

const isPdf = (mime: string, name: string) =>
    mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf');

export const SnapshotFilesView: React.FC<SnapshotFilesViewProps> = ({
    pacienteId,
    snapshotId,
}) => {
    const { files, isLoading, error } = useSnapshotFiles({
        pacienteId,
        snapshotId,
        enabled: !!pacienteId && !!snapshotId,
    });

    if (isLoading) {
        return (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando archivos clínicos…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-3 text-sm text-red-500">
                Error al cargar archivos clínicos de este snapshot.
            </div>
        );
    }

    if (!files.length) {
        return (
            <div className="mt-3 text-sm text-gray-500">
                No hay archivos clínicos asociados a este snapshot.
            </div>
        );
    }

    const openFile = (file: any) => {
        // Si tienes un endpoint directo tipo /storage/{s3_key} o un presign GET, úsalo aquí
        window.open(file.presigned_url || file.public_url || '#', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/40">
            <div className="flex items-center gap-2 mb-2">
                <Paperclip className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold">Archivos clínicos del snapshot</span>
                <span className="ml-auto text-xs text-gray-500">
                    {files.length} archivo{files.length !== 1 ? 's' : ''}
                </span>
            </div>

            <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {files.map((f) => (
                    <li
                        key={f.id}
                        className="flex items-center justify-between gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => openFile(f)}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {isImage(f.mime_type, f.original_filename) ? (
                                <ImageIcon className="h-4 w-4 text-emerald-500" />
                            ) : isPdf(f.mime_type, f.original_filename) ? (
                                <FileText className="h-4 w-4 text-red-500" />
                            ) : (
                                <FileText className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="text-xs truncate">{f.original_filename}</span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                            {(f.file_size_bytes / 1024).toFixed(1)} KB
                        </span>
                    </li>
                ))}
            </ul>

            <p className="mt-2 text-[11px] text-gray-400">
                Haz clic en un archivo para abrirlo en una nueva pestaña.
            </p>
        </div>
    );
};
