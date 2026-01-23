// src/hooks/useFilePreview.ts
import { useState } from 'react';

interface FilePreviewState {
    url: string;
    title: string;
    isOpen: boolean;
    isFullscreen: boolean;
}

// Función para detectar si un archivo es una imagen basada en URL o MIME type
export const isImageFile = (url: string, mimeType?: string): boolean => {
    // Verificar por extensión de archivo
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
        return true;
    }
    
    // Verificar por MIME type si está disponible
    if (mimeType) {
        return mimeType.startsWith('image/');
    }
    
    return false;
};

// Función para detectar si es PDF
export const isPdfFile = (url: string, mimeType?: string): boolean => {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('.pdf')) {
        return true;
    }
    
    if (mimeType) {
        return mimeType === 'application/pdf';
    }
    
    return false;
};

// Función para obtener el tipo de archivo
export const getFileType = (url: string, mimeType?: string): 'image' | 'pdf' | 'other' => {
    if (isImageFile(url, mimeType)) return 'image';
    if (isPdfFile(url, mimeType)) return 'pdf';
    return 'other';
};

export const useFilePreview = () => {
    const [imagePreview, setImagePreview] = useState<FilePreviewState>({
        url: '',
        title: '',
        isOpen: false,
        isFullscreen: false,
    });

    // Abrir vista previa de imagen/archivo
    const openFilePreview = (url: string, title: string) => {
        setImagePreview({
            url,
            title,
            isOpen: true,
            isFullscreen: false,
        });
    };

    // Cerrar vista previa
    const closeFilePreview = () => {
        setImagePreview(prev => ({ ...prev, isOpen: false }));
    };

    // Alternar pantalla completa
    const toggleFullscreen = () => {
        setImagePreview(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
    };

    // Abrir en nueva pestaña
    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Verificar si el archivo es visualizable
    const isFileViewable = (url: string, mimeType?: string): boolean => {
        return isImageFile(url, mimeType) || isPdfFile(url, mimeType);
    };

    return {
        imagePreview,
        openFilePreview,
        closeFilePreview,
        toggleFullscreen,
        openInNewTab,
        isFileViewable,
        getFileType,
    };
};