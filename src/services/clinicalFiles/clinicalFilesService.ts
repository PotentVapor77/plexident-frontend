// src/services/clinicalFiles/clinicalFilesService.ts

import axiosInstance from "../api/axiosInstance";

export interface FileCategory {
  XRAY: 'XRAY';
  LAB: 'LAB';
  PHOTO: 'PHOTO';
  MODEL_3D: '3D';
  OTHER: 'OTHER';
}

export interface ClinicalFile {
  uploadedByName: string;
  id: string;
  paciente: string;
  snapshot?: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  category: keyof FileCategory;
  created_at: string;
  file_url?: string;
  download_url?: string;
  is_Dicom: boolean;

}

export interface PendingFile {
  file: File;
  category: keyof FileCategory;
  tempId: string;
}

export interface InitUploadResponse {
  upload_url: string;
  s3_key: string;
  file_uuid: string;
}

// Limites de subida
export const FILE_UPLOAD_LIMITS = {
  MAX_FILES_PER_BATCH: 10,        // Máximo archivos por subida
} as const;

/**
 * PASO 1: Solicitar URL prefirmada para subir archivo
 */
export const initFileUpload = async (
  pacienteId: string,
  filename: string,
  contentType: string,
  snapshotId?: string,
  category: keyof FileCategory = 'OTHER'
): Promise<InitUploadResponse> => {
  console.log('[1/3] Iniciando solicitud de URL prefirmada...');
  
  const response = await axiosInstance.post(
    '/clinical-files/init-upload/',
    {
      paciente_id: pacienteId,
      filename,
      content_type: contentType,
      snapshot_id: snapshotId,
      category,
    },
  );
  
  const result = response.data.data;
  console.log('URL prefirmada obtenida:', {
    s3_key: result.s3_key,
    url_length: result.upload_url.length,
  });
  
  return result;
};

/**
 * PASO 2: Subir archivo directamente a S3/MinIO usando URL prefirmada
 * CRÍTICO: DEBE verificar que la respuesta sea exitosa
 */
export const uploadFileToStorage = async (
  uploadUrl: string,
  file: File,
  contentType: string
): Promise<void> => {
  console.log(' [2/3] Subiendo archivo a S3...', {
    filename: file.name,
    size: file.size,
    type: contentType,
  });

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
      },
      mode: 'cors',
    });

    console.log(' Respuesta de S3:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    //  VERIFICAR QUE LA SUBIDA FUE EXITOSA
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error('❌ Error en respuesta de S3:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      throw new Error(
        `Error subiendo archivo a S3: ${response.status} ${response.statusText}`
      );
    }

    console.log('Archivo subido exitosamente a S3');
  } catch (error) {
    console.error('Exception en uploadFileToStorage:', error);
    
    // Mejorar el mensaje de error para el usuario
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Error de red al subir archivo. Verifica la conexión y configuración de CORS.'
      );
    }
    
    throw error;
  }
};

/**
 * PASO 3: Confirmar subida y crear registro en BD
 */
export const confirmFileUpload = async (
  pacienteId: string,
  s3Key: string,
  filename: string,
  contentType: string,
  size: number,
  snapshotId?: string,
  category: keyof FileCategory = 'OTHER'
): Promise<ClinicalFile> => {
  console.log('📤 [3/3] Confirmando subida en backend...');
  
  const payload = {
    paciente_id: pacienteId,
    s3_key: s3Key,
    filename,
    content_type: contentType,
    size,
    snapshot_id: snapshotId,
    category,
  };
  
  console.log('[confirmFileUpload] payload:', payload);
  
  const response = await axiosInstance.post(
    '/clinical-files/confirm-upload/',
    payload,
  );
  
  console.log('Archivo confirmado en BD');
  return response.data;
};

/**
 * Flujo completo: init -> upload -> confirm
 */
export const uploadClinicalFile = async (
  pacienteId: string,
  file: File,
  category: keyof FileCategory = 'OTHER',
  snapshotId?: string
): Promise<ClinicalFile> => {
  console.log('═══════════════════════════════════════════════');
  console.log(' Iniciando subida de archivo clínico');
  console.log('═══════════════════════════════════════════════');
  console.log('Paciente:', pacienteId);
  console.log('Snapshot:', snapshotId);
  console.log('Archivo:', file.name);
  console.log('Tamaño:', (file.size / 1024).toFixed(2), 'KB');
  console.log('Tipo:', file.type);
  console.log('Categoría:', category);
  console.log('═══════════════════════════════════════════════');

  try {
    // 1. Iniciar subida (obtener URL prefirmada)
    const { upload_url, s3_key } = await initFileUpload(
      pacienteId,
      file.name,
      file.type,
      snapshotId,
      category
    );

    // 2. Subir a storage (S3/MinIO)
    await uploadFileToStorage(upload_url, file, file.type);

    // 3. Confirmar subida (crear registro en BD)
    const result = await confirmFileUpload(
      pacienteId,
      s3_key,
      file.name,
      file.type,
      file.size,
      snapshotId,
      category
    );

    console.log('═══════════════════════════════════════════════');
    console.log(' SUBIDA COMPLETA EXITOSA');
    console.log('═══════════════════════════════════════════════');
    
    return result;
  } catch (error) {
    console.error('═══════════════════════════════════════════════');
    console.error(' ERROR EN SUBIDA DE ARCHIVO');
    console.error('═══════════════════════════════════════════════');
    console.error('Archivo:', file.name);
    console.error('Error:', error);
    console.error('═══════════════════════════════════════════════');
    throw error;
  }
};

/**
 * Obtener archivos por paciente (opcionalmente filtrar por snapshot)
 */
export const getFilesByPaciente = async (
  pacienteId: string,
  snapshotId?: string
): Promise<ClinicalFile[]> => {
  const params = snapshotId ? { snapshot_id: snapshotId } : {};
  const response = await axiosInstance.get(
    `/clinical-files/by-patient/${pacienteId}/`,
    { params }
  );
  return response.data;
};

/**
 * Eliminar archivo
 */
export const deleteClinicalFile = async (fileId: string): Promise<void> => {
  await axiosInstance.delete(`/clinical-files/${fileId}/`);
};
