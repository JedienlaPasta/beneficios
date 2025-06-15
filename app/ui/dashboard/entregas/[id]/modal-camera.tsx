"use client";
import { FaImage } from "react-icons/fa6";
import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type CameraDevice = {
  deviceId: string;
  label: string;
  kind: string;
};

export default function CamaraComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
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

          await new Promise((resolve) => setTimeout(resolve, 50));
          context.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);

          const compressedDataUrl = canvasRef.current.toDataURL(
            "image/jpeg",
            0.8,
          );

          if (isTakingFront) {
            setFrontIdPhoto(compressedDataUrl);
            setIsTakingFront(false);
            toast.success(
              "Foto frontal capturada. ¡Ahora toma la foto del reverso!",
              {
                id: "PHOTO_CAPTURE_TOAST_ID",
                duration: 3000,
              },
            );
          } else {
            setBackIdPhoto(compressedDataUrl);
            toast.success(
              "Ambas fotos capturadas exitosamente. ¡Puedes generar el PDF!",
              {
                id: "PHOTO_CAPTURE_TOAST_ID",
                duration: 4000,
              },
            );
          }
        }
      } catch (err) {
        console.error("Error al tomar la foto:", err);
        toast.error("Error al tomar la foto", { id: "PHOTO_CAPTURE_TOAST_ID" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearPhoto = () => {
    if (backIdPhoto) {
      setBackIdPhoto(null);
      setIsTakingFront(false);
      toast.success("Foto trasera eliminada exitosamente!", {
        id: "PHOTO_DELETE_TOAST_ID",
      });
      return;
    }
    if (frontIdPhoto) {
      setFrontIdPhoto(null);
      setIsTakingFront(true);
      toast.success("Foto frontal eliminada exitosamente!", {
        id: "PHOTO_DELETE_TOAST_ID",
      });
      return;
    }

    toast.error("No fotos para eliminar");
  };

  // const rotateCamera = () => {
  //   if (videoRef.current) {
  //     const currentRotation = videoRef.current.style.transform;

  //     const rotation = currentRotation
  //       ? parseFloat(currentRotation.replace("rotate(", "").replace("deg)", ""))
  //       : 0;
  //     const newRotation = rotation ? 0 : 90;
  //     videoRef.current.style.transform = `rotate(${newRotation}deg)`;
  //   }
  // };

  const generatePdf = async () => {
    if (!frontIdPhoto || !backIdPhoto) {
      let errorMessage = "";
      if (!frontIdPhoto) {
        errorMessage = "No has tomado la foto frontal.";
      } else if (!backIdPhoto) {
        errorMessage = "No has tomado la foto trasera.";
      } else {
        errorMessage = "No has tomado las fotos.";
      }
      toast.error(errorMessage);
      return;
    }

    setIsLoading(true);
    const pdfGenerationToastId = toast.loading("Generando PDF...");

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      // --- Embed Front Photo ---
      const base64FrontImage = frontIdPhoto.split(",")[1];
      const decodedBinaryFrontString = atob(base64FrontImage);
      const imageBytesFront = new Uint8Array(
        decodedBinaryFrontString.split("").map((char) => char.charCodeAt(0)),
      );
      const embeddedFrontImage = await pdfDoc.embedJpg(imageBytesFront);

      // --- Embed Back Photo ---
      const base64BackImage = backIdPhoto.split(",")[1];
      const decodedBinaryBackString = atob(base64BackImage);
      const imageBytesBack = new Uint8Array(
        decodedBinaryBackString.split("").map((char) => char.charCodeAt(0)),
      );
      const embeddedBackImage = await pdfDoc.embedJpg(imageBytesBack);

      // PDF Layout
      const margin = 110;
      const spaceBetweenImages = 0;

      const { width, height } = page.getSize();
      const contentWidth = width - margin * 2;
      const contentHeight = height - margin * 2;

      // Calculate maximum height for each image, splitting the available space
      const individualImageMaxHeight =
        (contentHeight - spaceBetweenImages) / 2.2;

      // Scale images to fit the available width and their allocated height
      const frontImageDimensions = embeddedFrontImage.scaleToFit(
        contentWidth,
        individualImageMaxHeight,
      );
      const backImageDimensions = embeddedBackImage.scaleToFit(
        contentWidth,
        individualImageMaxHeight,
      );

      // Calculate Y positions for vertical stacking (from bottom of the page upwards)
      const yPosBack =
        margin + (individualImageMaxHeight - backImageDimensions.height);
      const yPosFront =
        yPosBack + individualImageMaxHeight + spaceBetweenImages;
      // const yPosBack =
      //   margin + (individualImageMaxHeight - backImageDimensions.height);
      // const yPosFront =
      //   yPosBack + individualImageMaxHeight + spaceBetweenImages;

      // Calculate X positions to center horizontally
      const xPosFront =
        margin + (contentWidth - frontImageDimensions.width) / 2;
      const xPosBack = margin + (contentWidth - backImageDimensions.width) / 2;

      // Draw images
      page.drawImage(embeddedFrontImage, {
        x: xPosFront,
        y: yPosFront,
        width: frontImageDimensions.width,
        height: frontImageDimensions.height,
      });

      page.drawImage(embeddedBackImage, {
        x: xPosBack,
        y: yPosBack,
        width: backImageDimensions.width,
        height: backImageDimensions.height,
      });

      // Add a title to the PDF
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const titleText = "Cédula de Identidad (Frente y Reverso)";
      const titleFontSize = 18;
      const titleWidth = font.widthOfTextAtSize(titleText, titleFontSize);
      const xPosTitle = (width - titleWidth) / 2;
      const yPosTitle = height - margin - 0; // Place title closer to the top margin

      page.drawText(titleText, {
        x: xPosTitle,
        y: yPosTitle,
        font: font,
        size: titleFontSize,
        color: rgb(0, 0, 0),
      });

      // Comprimir el PDF y guardar en la base de datos <==========================================

      // Serialize the PDF to bytes and trigger download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "documento_cedula.pdf"; // More descriptive filename
      link.click();

      toast.success("PDF generado exitosamente", { id: pdfGenerationToastId });
    } catch (err) {
      console.error("Error al generar el PDF:", err);
      toast.error("Error al generar el PDF", { id: pdfGenerationToastId });
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

                {/* <div className="flex items-center gap-2">
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
                </div> */}
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
                  disabled={
                    isLoading ||
                    isCameraLoading ||
                    (backIdPhoto !== null && frontIdPhoto !== null)
                  }
                  className="flex h-10 grow items-center justify-center rounded-lg bg-blue-500 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-600 active:scale-95 disabled:bg-blue-300"
                >
                  {isLoading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      {isTakingFront
                        ? "Tomar foto frontal"
                        : "Tomar foto trasera"}
                    </>
                  )}
                </button>

                {(frontIdPhoto || backIdPhoto) && (
                  <>
                    <button
                      onClick={() => {
                        if (backIdPhoto) {
                          clearPhoto();
                        } else if (frontIdPhoto) {
                          clearPhoto();
                        }
                      }}
                      className="h-10 rounded-lg bg-gray-500 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-600"
                    >
                      Limpiar foto {backIdPhoto ? "trasera" : "frontal"}
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
                Imágenes Capturadas
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex min-h-48 items-center justify-center rounded-lg bg-gray-100 p-4">
                  {frontIdPhoto ? (
                    <div className="w-full space-y-2">
                      <h4 className="text-center text-sm font-medium text-slate-600">
                        Frente
                      </h4>
                      <img
                        src={frontIdPhoto}
                        alt="Foto frontal"
                        className="h-auto max-h-40 w-full rounded-lg object-contain shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="mb-1 text-3xl">
                        <FaImage className="place-self-center" />
                      </div>
                      <p className="text-sm text-slate-400">
                        Sin captura frontal
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex min-h-48 items-center justify-center rounded-lg bg-gray-100 p-4">
                  {backIdPhoto ? (
                    <div className="w-full space-y-2">
                      <h4 className="text-center text-sm font-medium text-slate-600">
                        Reverso
                      </h4>
                      <img
                        src={backIdPhoto}
                        alt="Foto trasera"
                        className="h-auto max-h-40 w-full rounded-lg object-contain shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="mb-1 text-3xl">
                        <FaImage className="place-self-center" />
                      </div>
                      <p className="text-sm text-slate-400">
                        Sin captura trasera
                      </p>
                    </div>
                  )}
                </div>
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
