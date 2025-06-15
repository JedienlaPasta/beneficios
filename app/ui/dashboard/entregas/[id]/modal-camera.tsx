"use client";
import { FaImage } from "react-icons/fa6";
import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

  const [frontIdPhoto, setFrontIdPhoto] = useState<string | null>(null);
  const [backIdPhoto, setBackIdPhoto] = useState<string | null>(null);
  const [isTakingFront, setIsTakingFront] = useState(true);

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
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
          ...(deviceId && { deviceId: { exact: deviceId } }),
        },
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);

      // Asegurarse de que no estamos intentando reproducir un video que ya no existe
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        try {
          await videoRef.current.play();
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

    await startCamera(cameras[nextIndex].deviceId);
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
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;

          const targetWidth = 1200;
          const scaleFactor = targetWidth / videoWidth;
          const targetHeight = videoHeight * scaleFactor;

          canvasRef.current.width = targetWidth;
          canvasRef.current.height = targetHeight;

          context.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);

          const compressedDataUrl = canvasRef.current.toDataURL(
            "image/jpeg",
            0.8,
          );
          setPhotoDataUrl(compressedDataUrl);

          if (onPhotoTaken) {
            onPhotoTaken(compressedDataUrl);
          }
          toast.success("Foto tomada exitosamente");
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

  const rotateCamera = () => {
    if (videoRef.current) {
      const currentRotation = videoRef.current.style.transform;

      const rotation = currentRotation
        ? parseFloat(currentRotation.replace("rotate(", "").replace("deg)", ""))
        : 0;
      const newRotation = rotation ? 0 : 90;
      videoRef.current.style.transform = `rotate(${newRotation}deg)`;
    }
  };

  const generatePdf = async () => {
    if (!photoDataUrl) {
      toast.error("No hay una foto para generar un PDF.");
      return;
    }

    setIsLoading(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      // Eliminar el prefijo 'data:image/jpeg;base64,' y decodificar
      const base64Image = photoDataUrl.split(",")[1];

      const decodedBinaryString = atob(base64Image);
      const imageBytes = new Uint8Array(
        decodedBinaryString.split("").map((char) => char.charCodeAt(0)),
      );

      // Incrustar la imagen en el documento PDF
      const image = await pdfDoc.embedJpg(imageBytes);

      // Calcular las dimensiones para dibujar la imagen en la página
      // Ajustar la imagen a la página manteniendo el aspecto
      const { width, height } = page.getSize();
      const imageDimensions = image.scaleToFit(width - 40, height - 40); // Margen de 20px a cada lado

      // Centrar la imagen en la página
      const xPos = (width - imageDimensions.width) / 2;
      const yPos = (height - imageDimensions.height) / 2;

      // Dibujar la imagen en la página
      page.drawImage(image, {
        x: xPos,
        y: yPos,
        width: imageDimensions.width,
        height: imageDimensions.height,
      });

      // Texto sobre la imagen (opcional)
      page.drawText("Cédula de Identidad", {
        x: 50,
        y: height - 50,
        font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
        size: 16,
        color: rgb(0, 0, 0), // Color del texto
      });

      // Comprimir el PDF y guardar en la base de datos <==========================================

      // Serializar el PDF a bytes
      const pdfBytes = await pdfDoc.save();
      // Descargar el PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "documento.pdf";
      link.click();

      toast.success("PDF generado exitosamente");
    } catch (err) {
      console.error("Error al generar el PDF:", err);
      toast.error("Error al generar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden">
        <div className="p-6s">
          <div className="space-y-4">
            {/* Vista de la cámara */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  Vista de la Cámara
                </h3>
                {/* {cameras.length > 1 && ( */}
                {true && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {/* {cameras[currentCameraIndex]?.label || "Cámara actual"} */}
                      {"Cámara " + (currentCameraIndex + 1)}
                    </span>
                    <button
                      onClick={switchCamera}
                      disabled={isCameraLoading}
                      className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      {isCameraLoading ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                      ) : (
                        "🔄 Cambiar"
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={rotateCamera}
                    disabled={isCameraLoading}
                    className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-gray-700 disabled:bg-gray-400"
                  >
                    {isCameraLoading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                    ) : (
                      "🔄 Girar"
                    )}
                  </button>
                </div>
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
                  <>
                    <button
                      onClick={clearPhoto}
                      className="h-10 rounded-lg bg-gray-500 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-600"
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={generatePdf} // Nuevo botón para generar PDF
                      disabled={isLoading}
                      className="flex h-10 items-center justify-center rounded-lg bg-green-500 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-600 active:scale-95 disabled:bg-green-300"
                    >
                      {isLoading ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        "Generar PDF"
                      )}
                    </button>
                  </>
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

      {/* <canvas ref={canvasRef} style={{ display: "none" }}></canvas> */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

export default function Camara() {
  const handlePhotoTaken = (dataUrl: string) => {
    console.log("Foto tomada:", dataUrl.substring(0, 50) + "...");
  };

  return <CamaraComponent onPhotoTaken={handlePhotoTaken} />;
}
