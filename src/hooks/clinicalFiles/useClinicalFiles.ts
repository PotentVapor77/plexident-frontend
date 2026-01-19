// src/hooks/clinicalFiles/useClinicalFiles.ts

import { useState, useCallback } from 'react';
import {
    uploadClinicalFile,
    type PendingFile,
    type ClinicalFile,
    type FileCategory,
} from '../../services/clinicalFiles/clinicalFilesService';

export const useClinicalFiles = () => {
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Agregar archivo pendiente (no se sube hasta presionar "Guardar Todo")
     */
    const addPendingFile = useCallback(
        (file: File, category: keyof FileCategory = 'OTHER') => {
            const tempId = `temp_${Date.now()}_${Math.random()}`;
            const newFile: PendingFile = {
                file,
                category,
                tempId,
            };
            setPendingFiles((prev) => [...prev, newFile]);
            return tempId;
        },
        []
    );

    /**
     * Eliminar archivo pendiente
     */
    const removePendingFile = useCallback((tempId: string) => {
        setPendingFiles((prev) => prev.filter((f) => f.tempId !== tempId));
    }, []);

    /**
     * Limpiar todos los archivos pendientes
     */
    const clearPendingFiles = useCallback(() => {
        setPendingFiles([]);
        setUploadProgress({});
    }, []);

    /**
     * Subir todos los archivos pendientes con snapshot_id
     */
    const uploadAllPendingFiles = useCallback(
        async (
            pacienteId: string,
            snapshotId: string
        ): Promise<ClinicalFile[]> => {
            if (!pendingFiles.length) return [];

            setIsUploading(true);
            const uploadedFiles: ClinicalFile[] = [];

            try {
                for (const pending of pendingFiles) {
                    setUploadProgress((prev) => ({ ...prev, [pending.tempId]: 0 }));

                    const uploadedFile = await uploadClinicalFile(
                        pacienteId,
                        pending.file,
                        pending.category,
                        snapshotId
                    );

                    setUploadProgress((prev) => ({ ...prev, [pending.tempId]: 100 }));
                    uploadedFiles.push(uploadedFile);
                }

                // Limpiar archivos pendientes tras subida exitosa
                clearPendingFiles();
                return uploadedFiles;
            } catch (error) {
                console.error('[useClinicalFiles] Error uploading files:', error);
                throw error;
            } finally {
                setIsUploading(false);
            }
        },
        [pendingFiles, clearPendingFiles]
    );

    return {
        pendingFiles,
        addPendingFile,
        removePendingFile,
        clearPendingFiles,
        uploadAllPendingFiles,
        uploadProgress,
        isUploading,
        hasPendingFiles: pendingFiles.length > 0,
    };
};
