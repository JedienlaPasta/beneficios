"use client";
import { FaImage } from "react-icons/fa6";
import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";

interface CamaraComponentProps {
  onPhotoTaken?: (dataUrl: string) => void;
}

interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

function CamaraComponent({ onPhotoTaken }: CamaraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      const cameraDevices: CameraDevice[] = videoDevices.map(
        (device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Cámara ${index + 1}`,
          kind: device.kind,
        }),
      );
      setCameras(cameraDevices);
      return cameraDevices;
    } catch (err) {
      console.error("Error al obtener las cámaras:", err);
      toast.error("Error al obtener las cámaras disponibles");
      return [];
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      setIsCameraLoading(true);

      // Detener cualquier stream existente antes de iniciar uno nuevo
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: 1280,
          height: 720,
          ...(deviceId && { deviceId: { exact: deviceId } }),
        },
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);

      // Asegurarse de que no estamos intentando reproducir un video que ya no existe
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Manejar correctamente la promesa de play()
        try {
          // Esperar a que la promesa de play() se resuelva antes de continuar
          await videoRef.current.play();
          // Solo establecer el stream después de que play() se haya completado
          setStream(mediaStream);
        } catch (playError) {
          console.error("Error al reproducir el video:", playError);
          toast.error("Error al iniciar la reproducción de video");

          // Limpiar el stream si hay un error en la reproducción
          mediaStream.getTracks().forEach((track) => track.stop());
        }
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      toast.error("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
    } finally {
      setIsCameraLoading(false);
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) {
      toast.info("Solo hay una cámara disponible");
      return;
    }

    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);

    // Esperar a que startCamera termine completamente
    await startCamera(cameras[nextIndex].deviceId);

    // Solo mostrar el mensaje de éxito después de que la cámara se haya iniciado correctamente
    toast.success(`Cambiado a: ${cameras[nextIndex].label}`);
  };

  useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      const availableCameras = await getCameras();

      // Verificar que el componente sigue montado antes de continuar
      if (!mounted) return;

      if (availableCameras.length > 0) {
        await startCamera(availableCameras[0].deviceId);
      } else {
        await startCamera();
      }
    };

    initializeCamera();

    // Función de limpieza
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-lg">
        <div className="p-6s">
          <div className="space-y-4">
            {/* Vista de la cámara */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {cameras.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {cameras[currentCameraIndex]?.label || "Cámara actual"}
                    </span>
                    <button
                      onClick={switchCamera}
                      disabled={isCameraLoading}
                      className="rounded-lg bg-gray-600 px-3 py-1 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      {isCameraLoading ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                      ) : (
                        "🔄 Cambiar"
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
                  className="flex h-10 grow items-center justify-center rounded-lg bg-blue-500 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-600 active:scale-95 disabled:bg-blue-300"
                >
                  {isLoading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Procesando...
                    </>
                  ) : (
                    <>Tomar foto</>
                  )}
                </button>

                {photoDataUrl && (
                  <button
                    onClick={clearPhoto}
                    className="h-10 rounded-lg bg-gray-500 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-600"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Vista previa de la foto */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                Imagen Capturada
              </h3>
              <div className="flex min-h-96 items-center justify-center rounded-lg bg-gray-100 p-4">
                {photoDataUrl ? (
                  <div className="w-full space-y-4">
                    <img
                      src={photoDataUrl}
                      alt="Foto capturada"
                      className="h-auto max-h-80 w-full rounded-lg object-contain shadow-md"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="mb-1 text-5xl">
                      <FaImage className="place-self-center" />
                    </div>
                    <p className="text-sm text-slate-400">Sin capturas aún</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
}

export default function Camara() {
  const handlePhotoTaken = (dataUrl: string) => {
    console.log("Foto tomada:", dataUrl.substring(0, 50) + "...");
  };

  return <CamaraComponent onPhotoTaken={handlePhotoTaken} />;
}
