"use client";

import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";

// Define the props interface
interface CamaraComponentProps {
  onPhotoTaken?: (dataUrl: string) => void;
}

const CamaraComponent: React.FC<CamaraComponentProps> = ({ onPhotoTaken }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
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
      }
    };

    startCamera();

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
              <h2 className="text-lg font-semibold text-gray-800">
                Vista de la Cámara
              </h2>
              <div className="relative overflow-hidden rounded-lg bg-gray-100">
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
                  disabled={isLoading}
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
