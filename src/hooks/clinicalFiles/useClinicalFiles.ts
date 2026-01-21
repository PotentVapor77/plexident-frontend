// src/hooks/clinicalFiles/useClinicalFiles.ts

import { useState, useCallback } from 'react';
import {
    uploadClinicalFile,
    type PendingFile,
    type ClinicalFile,
    type FileCategory,
    FILE_UPLOAD_LIMITS,
} from '../../services/clinicalFiles/clinicalFilesService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useClinicalFiles = () => {
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Agregar archivo pendiente con validación de límite
     */
    const addPendingFile = useCallback(
        (file: File, category: keyof FileCategory = 'OTHER') => {
            if (pendingFiles.length >= FILE_UPLOAD_LIMITS.MAX_FILES_PER_BATCH) {
                setError(`Solo se permiten ${FILE_UPLOAD_LIMITS.MAX_FILES_PER_BATCH} archivos por vez`);
                return null;
            }

            const tempId = `temp_${Date.now()}_${Math.random()}`;
            const newFile: PendingFile = {
                file,
                category,
                tempId,
            };

            setPendingFiles((prev) => [...prev, newFile]);
            setError(null);
            return tempId;
        },
        [pendingFiles.length]
    );

    /**
     * Eliminar archivo pendiente
     */
    const removePendingFile = useCallback((tempId: string) => {
        setPendingFiles((prev) => prev.filter((f) => f.tempId !== tempId));
        setError(null);
    }, []);

    /**
     * Limpiar todos los archivos pendientes
     */
    const clearPendingFiles = useCallback(() => {
        setPendingFiles([]);
        setUploadProgress({});
        setError(null); 
    }, []);

    /**
     * Subir todos los archivos pendientes secuencialmente CON DELAY
     */
    const uploadAllPendingFiles = useCallback(
        async (
            pacienteId: string,
            snapshotId: string
        ): Promise<ClinicalFile[]> => {
            if (!pendingFiles.length) return [];

            setIsUploading(true);
            setError(null);

            const uploadedFiles: ClinicalFile[] = [];
            let failedCount = 0;

            try {
                for (let i = 0; i < pendingFiles.length; i++) {
                    const pending = pendingFiles[i];
                    
                    console.log(`[${i + 1}/${pendingFiles.length}] Subiendo: ${pending.file.name}`);
                    
                    setUploadProgress((prev) => ({ ...prev, [pending.tempId]: 0 }));

                    try {
                        const uploadedFile = await uploadClinicalFile(
                            pacienteId,
                            pending.file,
                            pending.category,
                            snapshotId
                        );

                        setUploadProgress((prev) => ({ ...prev, [pending.tempId]: 100 }));
                        uploadedFiles.push(uploadedFile);
                        
                        console.log(`✅ [${i + 1}/${pendingFiles.length}] Subido: ${pending.file.name}`);

                        if (i < pendingFiles.length - 1) {
                            console.log(` Esperando 500ms antes del siguiente archivo...`);
                            await delay(500);
                        }
                    } catch (fileError) {
                        console.error(` Error subiendo ${pending.file.name}:`, fileError);
                        failedCount++;
                        
                        if (i < pendingFiles.length - 1) {
                            console.log(`⏳ Esperando 1s después del error...`);
                            await delay(1000);
                        }
                        // Continuar con el siguiente archivo
                    }
                }

                console.log('\n Resumen de subida:');
                console.log(` Exitosos: ${uploadedFiles.length}`);
                console.log(` Fallidos: ${failedCount}`);

                if (failedCount > 0) {
                    setError(`${failedCount} archivo(s) fallaron. Revisa la consola para más detalles.`);
                }

                if (uploadedFiles.length > 0) {
                    clearPendingFiles();
                }

                return uploadedFiles;
            } catch (error) {
                console.error('[useClinicalFiles] Error general:', error);
                setError('Error al subir archivos. Por favor, intenta nuevamente.');
                throw error;
            } finally {
                setIsUploading(false);
            }
        },
        [pendingFiles, clearPendingFiles]
    );

    /**
     * Limpiar mensajes de error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        pendingFiles,
        addPendingFile,
        removePendingFile,
        clearPendingFiles,
        uploadAllPendingFiles,
        uploadProgress,
        isUploading,
        hasPendingFiles: pendingFiles.length > 0,
        canAddMore: pendingFiles.length < FILE_UPLOAD_LIMITS.MAX_FILES_PER_BATCH,
        remainingSlots: FILE_UPLOAD_LIMITS.MAX_FILES_PER_BATCH - pendingFiles.length,
        error,
        clearError,
    };
};
