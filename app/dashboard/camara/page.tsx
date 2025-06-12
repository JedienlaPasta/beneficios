"use client";

import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";

// Define the props interface
interface CamaraComponentProps {
  onPhotoTaken?: (dataUrl: string) => void;
}

interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

const CamaraComponent: React.FC<CamaraComponentProps> = ({ onPhotoTaken }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Función para obtener todas las cámaras disponibles
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const cameraDevices: CameraDevice[] = videoDevices.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Cámara ${index + 1}`,
        kind: device.kind
      }));
      setCameras(cameraDevices);
      return cameraDevices;
    } catch (err) {
      console.error("Error al obtener las cámaras:", err);
      toast.error("Error al obtener las cámaras disponibles");
      return [];
    }
  };

  // Función para iniciar la cámara con un dispositivo específico
  const startCamera = async (deviceId?: string) => {
    try {
      setIsCameraLoading(true);
      
      // Detener el stream anterior si existe
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: 1280,
          height: 720,
          ...(deviceId && { deviceId: { exact: deviceId } })
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      toast.error(
        "No se pudo acceder a la cámara. Asegúrate de dar permisos.",
      );
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Función para cambiar a la siguiente cámara
  const switchCamera = async () => {
    if (cameras.length <= 1) {
      toast.info("Solo hay una cámara disponible");
      return;
    }

    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    await startCamera(cameras[nextIndex].deviceId);
    toast.success(`Cambiado a: ${cameras[nextIndex].label}`);
  };

  useEffect(() => {
    const initializeCamera = async () => {
      // Primero obtener las cámaras disponibles
      const availableCameras = await getCameras();
      
      // Luego iniciar la primera cámara
      if (availableCameras.length > 0) {
        await startCamera(availableCameras[0].deviceId);
      } else {
        await startCamera(); // Usar cámara por defecto
      }
    };

    initializeCamera();

    // Limpiar el stream cuando el componente se desmonte
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Función para copiar imagen al clipboard
  const copyToClipboard = async (dataUrl: string) => {
    try {
      // Convertir data URL a blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Copiar al clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      toast.success("Foto copiada al clipboard exitosamente");
    } catch (err) {
      console.error("Error al copiar al clipboard:", err);
      toast.error("Error al copiar la foto al clipboard");
    }
  };

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsLoading(true);

      try {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
          const dataUrl = canvasRef.current.toDataURL("image/png");
          setPhotoDataUrl(dataUrl);

          // Copiar automáticamente al clipboard
          await copyToClipboard(dataUrl);

          if (onPhotoTaken) {
            onPhotoTaken(dataUrl);
          }
        }
      } catch (err) {
        console.error("Error al tomar la foto:", err);
        toast.error("Error al tomar la foto");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearPhoto = () => {
    setPhotoDataUrl(null);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="bg-blue-600 p-4 text-white">
          <h1 className="text-2xl font-bold">Captura de Fotos</h1>
          <p className="mt-1 text-blue-100">
            Toma fotos que se guardarán automáticamente en el clipboard
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Vista de la cámara */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Vista de la Cámara
                </h2>
                {cameras.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {cameras[currentCameraIndex]?.label || 'Cámara actual'}
                    </span>
                    <button
                      onClick={switchCamera}
                      disabled={isCameraLoading}
                      className="rounded-lg bg-gray-600 px-3 py-1 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      {isCameraLoading ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                      ) : (
                        '🔄 Cambiar'
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="relative overflow-hidden rounded-lg bg-gray-100">
                {isCameraLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="flex items-center gap-2 text-white">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Cambiando cámara...</span>
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="h-auto max-h-96 w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={takePhoto}
                  disabled={isLoading || isCameraLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Procesando...
                    </>
                  ) : (
                    <>📸 Tomar Foto</>
                  )}
                </button>

                {photoDataUrl && (
                  <button
                    onClick={clearPhoto}
                    className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-600"
                  >
                    🗑️ Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Vista previa de la foto */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Foto Capturada
              </h2>
              <div className="flex min-h-96 items-center justify-center rounded-lg bg-gray-100 p-4">
                {photoDataUrl ? (
                  <div className="w-full space-y-4">
                    <img
                      src={photoDataUrl}
                      alt="Foto capturada"
                      className="h-auto max-h-80 w-full rounded-lg object-contain shadow-md"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(photoDataUrl)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700"
                      >
                        📋 Copiar al Clipboard
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="mb-4 text-6xl">📷</div>
                    <p className="text-lg">No hay foto capturada</p>
                    <p className="mt-2 text-sm">
                      Haz clic en Tomar Foto para capturar una imagen
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-800">ℹ️ Información</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • Las fotos se copian automáticamente al clipboard al tomarlas
              </li>
              <li>
                • Puedes pegar las fotos en cualquier aplicación usando Ctrl+V
              </li>
              <li>
                • La calidad de la imagen es de alta resolución (1280x720)
              </li>
              <li>
                • Asegúrate de permitir el acceso a la cámara cuando se solicite
              </li>
              {cameras.length > 1 && (
                <li>
                  • Usa el botón "Cambiar" para alternar entre las {cameras.length} cámaras disponibles
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

export default function Camara() {
  const handlePhotoTaken = (dataUrl: string) => {
    console.log("Foto tomada:", dataUrl.substring(0, 50) + "...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CamaraComponent onPhotoTaken={handlePhotoTaken} />
    </div>
  );
}
