// src/components/odontogram/files/CameraCaptureButton.tsx
import React, { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCcw, Upload, Check } from "lucide-react";

interface CameraCaptureButtonProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export const CameraCaptureButton: React.FC<CameraCaptureButtonProps> = ({
  onCapture,
  disabled = false,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null); // Nuevo estado para guardar el archivo
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Iniciar cámara
  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Priorizar cámara trasera en dispositivos móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capturar foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Configurar canvas con las dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir a blob y luego a File
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const fileName = `captura_${new Date().getTime()}.jpg`;
      const file = new File([blob], fileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      
      // Guardar el archivo para usarlo después
      setCapturedFile(file);
      
      // Crear URL para previsualización
      const imageUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageUrl);
      
      // Detener la cámara después de capturar
      stopCamera();
    }, "image/jpeg", 0.95);
  };

  // Subir la foto capturada
  const uploadCapturedPhoto = () => {
    if (!capturedFile) {
      console.error("No hay archivo capturado para subir");
      return;
    }
    
    console.log("Subiendo archivo capturado:", capturedFile.name, capturedFile.size);
    onCapture(capturedFile);
    resetCamera();
  };

  // Tomar otra foto
  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    startCamera();
  };

  // Subir desde archivo (fallback)
  const uploadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith("image/")) {
      console.log("Subiendo archivo desde sistema:", file.name, file.size);
      onCapture(file);
      resetCamera();
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Resetear cámara
  const resetCamera = () => {
    stopCamera();
    setCapturedImage(null);
    setCapturedFile(null);
    setCameraError(null);
    setIsCameraOpen(false);
  };

  // Efecto para limpiar al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Iniciar cámara cuando se abre el modal
  useEffect(() => {
    if (isCameraOpen && !capturedImage) {
      startCamera();
    }
  }, [isCameraOpen, capturedImage]);

  return (
    <>
      {/* Botón principal para abrir la cámara */}
      <button
        type="button"
        onClick={() => setIsCameraOpen(true)}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Camera className="w-4 h-4" />
        <span className="text-sm">Tomar foto</span>
      </button>

      {/* Modal de la cámara */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100000] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {capturedImage ? "Vista previa" : "Tomar foto"}
              </h3>
              <button
                type="button"
                onClick={resetCamera}
                className="p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center bg-gray-900">
              {cameraError ? (
                <div className="text-center p-8">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-red-500 mb-4">{cameraError}</p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Reintentar
                    </button>
                    <p className="text-gray-500 text-sm">o</p>
                    <div>
                      <label className="cursor-pointer">
                        <div className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block">
                          Subir desde archivo
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={uploadFromFile}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : capturedImage ? (
                // Vista previa de la foto capturada
                <div className="space-y-4 w-full">
                  <div className="relative aspect-[4/3] w-full max-w-md mx-auto">
                    <img
                      src={capturedImage}
                      alt="Captura"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Tomar otra
                    </button>
                    <button
                      type="button"
                      onClick={uploadCapturedPhoto}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Usar esta foto
                    </button>
                  </div>
                </div>
              ) : (
                // Vista de la cámara activa
                <div className="space-y-4 w-full">
                  <div className="relative aspect-[4/3] w-full max-w-md mx-auto rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    {/* Canvas oculto para captura */}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  {/* Controles de la cámara */}
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:border-gray-400 flex items-center justify-center"
                      title="Capturar foto"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-500"></div>
                    </button>
                    
                    <div className="flex gap-3">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <Upload className="w-4 h-4" />
                          Subir archivo
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={uploadFromFile}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {capturedImage 
                  ? "Revisa la foto antes de subirla"
                  : "Posiciona el elemento y presiona el botón rojo para capturar"
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};