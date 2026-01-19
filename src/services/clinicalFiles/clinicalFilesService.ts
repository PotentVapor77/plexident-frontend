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

  return response.data.data;  
};
/**
 * PASO 2: Subir archivo directamente a S3/MinIO usando URL prefirmada
 */
export const uploadFileToStorage = async (
  uploadUrl: string,
  file: File,
  contentType: string
): Promise<void> => {
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': contentType,
    },
    mode: 'cors',
  });
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
): Promise<any> => {
  const payload = {
    paciente_id: pacienteId,
    s3_key: s3Key,
    filename,
    content_type: contentType,
    size,
    snapshot_id: snapshotId,
    category,
  };

  console.log('[confirmFileUpload] payload =', payload);

  const response = await axiosInstance.post(
    '/clinical-files/confirm-upload/',
    payload,
  );

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
    console.log('[uploadClinicalFile] pacienteId', pacienteId, 'snapshotId', snapshotId, 'category', category);
  // 1. Iniciar subida
  const { upload_url, s3_key } = await initFileUpload(
    pacienteId,
    file.name,
    file.type,
    snapshotId,
    category
  );
console.log('[uploadClinicalFile] init response s3_key =', s3_key);

  // 2. Subir a storage
  await uploadFileToStorage(upload_url, file, file.type);

  // 3. Confirmar subida
  return await confirmFileUpload(
    pacienteId,
    s3_key,
    file.name,
    file.type,
    file.size,
    snapshotId,
    category
  );
};

/**
 * Obtener archivos por paciente (opcionalmente filtrar por snapshot)
 */
export const getFilesByPaciente = async (
  pacienteId: string,
  snapshotId?: string
): Promise<ClinicalFile[]> => {
  const params = snapshotId ? { snapshot_id: snapshotId } : {};
  const response = await axiosInstance.get<ClinicalFile[]>(
    `/api/clinical-files/by-patient/${pacienteId}/`,
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
