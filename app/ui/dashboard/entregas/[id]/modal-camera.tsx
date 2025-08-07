"use client";
import { FaCamera, FaImage } from "react-icons/fa6";
import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { uploadPDFByFolio } from "@/app/lib/actions/entregas";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import FileNameDropdown from "./file-name-dropdown";

const filesList = [
  {
    id: "1",
    name: "Cédula y Entregas",
  },
  {
    id: "2",
    name: "Cartola RSH",
  },
  {
    id: "3",
    name: "Acta de Entrega",
  },
  {
    id: "3",
    name: "Cédula",
  },
  {
    id: "3",
    name: "Entregas",
  },
];

const fileModeList = [
  {
    id: "1",
    name: "Documento Pequeño",
  },
  {
    id: "2",
    name: "Página Completa",
  },
];

type CameraDevice = {
  deviceId: string;
  label: string;
  kind: string;
};

// type PDFMode = "fullPage" | "smallDocument";

export default function CamaraComponent({
  folio,
  isActive = true,
  setTab,
}: {
  folio: string;
  isActive?: boolean;
  setTab: (tab: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Single photo state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // PDF mode and document name
  const [pdfMode, setPdfMode] = useState<string>(fileModeList[0].name);

  const [documentName, setDocumentName] = useState<string>(filesList[0].name);

  const router = useRouter();

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

      const rearCameraIndex = cameraDevices.findIndex((camera) => {
        const label = camera.label.toLowerCase();
        return (
          label.includes("back") ||
          label.includes("rear") ||
          label.includes("trasera") ||
          label.includes("principal")
        );
      });

      if (rearCameraIndex > 0) {
        const rearCamera = cameraDevices.splice(rearCameraIndex, 1)[0];
        cameraDevices.unshift(rearCamera);
      }

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
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30 },
          // Priorizar cámara trasera si no se especifica un deviceId
          facingMode: deviceId ? undefined : { ideal: "environment" },
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
      if (!isActive) return;

      const availableCameras = await getCameras();
      if (!mounted || !isActive) return;

      if (availableCameras.length > 0) {
        await startCamera(availableCameras[0].deviceId);
      } else {
        await startCamera();
      }
    };

    initializeCamera();

    return () => {
      mounted = false;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive]);

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsLoading(true);

      try {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;

          const isPortrait = videoHeight > videoWidth;

          let targetWidth, targetHeight;

          if (pdfMode === "Página Completa") {
            // For fullPage mode, use 3:4 aspect ratio (card/A4-like)
            targetWidth = 2400;
            targetHeight = Math.round(targetWidth * (4 / 3)); // 3:4 aspect ratio
          } else {
            // smallDocument mode: existing logic
            targetWidth = 2400;
            const scaleFactor =
              targetWidth / (isPortrait ? videoHeight : videoWidth);
            targetHeight =
              (isPortrait ? videoWidth : videoHeight) * scaleFactor;
          }

          canvasRef.current.width = targetWidth;
          canvasRef.current.height = targetHeight;

          await new Promise((resolve) => setTimeout(resolve, 50));

          context.save();

          if (isPortrait && pdfMode === "Documento Pequeño") {
            // Only rotate for smallDocument mode
            const scaleFactor = targetWidth / videoHeight;
            const rotatedWidth = videoHeight * scaleFactor;
            const rotatedHeight = videoWidth * scaleFactor;

            context.translate(targetWidth / 2, targetHeight / 2);
            context.rotate(-Math.PI / 2);

            context.drawImage(
              videoRef.current,
              0,
              0,
              videoWidth,
              videoHeight,
              -rotatedHeight / 2,
              -rotatedWidth / 2,
              rotatedHeight,
              rotatedWidth,
            );
          } else {
            // For fullPage mode or landscape, draw with cropping for 3:4 aspect ratio
            if (pdfMode === "Página Completa") {
              // Calculate source dimensions to crop from center with 3:4 ratio
              const sourceAspectRatio = videoWidth / videoHeight;
              const targetAspectRatio = 3 / 4;

              let sourceX = 0,
                sourceY = 0,
                sourceWidth = videoWidth,
                sourceHeight = videoHeight;

              if (sourceAspectRatio > targetAspectRatio) {
                // Video is wider than target, crop sides
                sourceWidth = videoHeight * targetAspectRatio;
                sourceX = (videoWidth - sourceWidth) / 2;
              } else {
                // Video is taller than target, crop top/bottom
                sourceHeight = videoWidth / targetAspectRatio;
                sourceY = (videoHeight - sourceHeight) / 2;
              }

              context.drawImage(
                videoRef.current,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                targetWidth,
                targetHeight,
              );
            } else {
              // Regular drawing for non-fullPage mode
              context.drawImage(
                videoRef.current,
                0,
                0,
                targetWidth,
                targetHeight,
              );
            }
          }

          context.restore();

          const compressedDataUrl = canvasRef.current.toDataURL(
            "image/jpeg",
            0.8,
          );

          setCapturedPhoto(compressedDataUrl);
          toast.success("Foto capturada exitosamente!", {
            id: "PHOTO_CAPTURE_TOAST_ID",
            duration: 3000,
          });
        }
      } catch (err) {
        console.error("Error al tomar la foto:", err);
        toast.error("Error al tomar la foto", { id: "PHOTO_CAPTURE_TOAST_ID" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const generatePdf = async () => {
    if (!capturedPhoto) {
      toast.error("No has tomado ninguna foto.");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Por favor ingresa un nombre para el documento.");
      return;
    }

    setIsLoading(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      // Embed the captured image
      const base64Image = capturedPhoto.split(",")[1];
      const decodedBinaryString = atob(base64Image);
      const imageBytes = new Uint8Array(
        decodedBinaryString.split("").map((char) => char.charCodeAt(0)),
      );
      const embeddedImage = await pdfDoc.embedJpg(imageBytes);

      const { width, height } = page.getSize();

      if (pdfMode === "Página Completa") {
        // Full page mode - image takes up the entire page
        const imageAspectRatio = embeddedImage.width / embeddedImage.height;
        const pageAspectRatio = width / height;

        let imageWidth, imageHeight;

        if (imageAspectRatio > pageAspectRatio) {
          // Image is wider than page
          imageWidth = width;
          imageHeight = width / imageAspectRatio;
        } else {
          // Image is taller than page
          imageHeight = height;
          imageWidth = height * imageAspectRatio;
        }

        const x = (width - imageWidth) / 2;
        const y = (height - imageHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: imageWidth,
          height: imageHeight,
        });
      } else {
        // Small document mode - image with margins and title
        const margin = 50;

        const contentWidth = width - margin * 2; // Subtract margin from both sides
        const contentHeight = height - margin * 2; // Subtract margin from top and bottom

        const imageDimensions = embeddedImage.scaleToFit(
          contentWidth,
          contentHeight,
        );

        const xPos = margin + (contentWidth - imageDimensions.width) / 2;
        const yPos = margin + (contentHeight - imageDimensions.height) / 2;

        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: imageDimensions.width,
          height: imageDimensions.height,
        });

        // Add title
        // const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        // const titleFontSize = 18;
        // const titleWidth = font.widthOfTextAtSize(documentName, titleFontSize);
        // const xPosTitle = (width - titleWidth) / 2;
        // const yPosTitle = height - margin;

        // page.drawText(documentName, {
        //   x: xPosTitle,
        //   y: yPosTitle,
        //   font: font,
        //   size: titleFontSize,
        //   color: rgb(0, 0, 0),
        // });
      }

      // Serialize the PDF to bytes and trigger download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      return blob;
    } catch (err) {
      console.error("Error al generar el PDF:", err);
      toast.error("Error al generar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const viewPdf = async () => {
    const pdfBlob = await generatePdf();
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(url, "_blank");

      if (!newWindow) {
        toast.error(
          "Ventana bloqueada - Por favor permite ventanas emergentes para este sitio",
        );
        return;
      }
    }
  };

  const uploadPdf = async () => {
    const pdfBlob = await generatePdf();
    setIsLoading(true);
    if (pdfBlob) {
      const fileName = `${documentName.trim().replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      const pdfNamedFile = new File([pdfBlob], fileName, {
        type: "application/pdf",
      });
      const formData = new FormData();
      formData.append("file0", pdfNamedFile);
      formData.append("fileCount", "1");
      const toastId = toast.loading("Guardando PDF...");
      try {
        const response = await uploadPDFByFolio(folio, formData);
        if (!response.success) {
          throw new Error(response.message);
        }
        toast.success("PDF guardado exitosamente", { id: toastId });
        setTab("Resumen");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error al crear la entrega";
        toast.error(message, { id: toastId });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="mx-auto w-full">
      <div className="overflow-hidden">
        <div className="space-y-4">
          {/* Document Configuration */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Configuración del Documento
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Document Name Input */}
              {/* <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Nombre del Documento
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Ingresa el nombre del documento"
                  className="h-10 w-full rounded-lg border border-gray-300 px-3.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                />
              </div> */}
              <FileNameDropdown
                placeHolder="Nombre archivo..."
                label="Nombre del Documento"
                name="nombre_documento"
                value={documentName}
                setValue={setDocumentName}
                valuesList={filesList}
              />

              <FileNameDropdown
                placeHolder="Modo pdf..."
                label="Modo de PDF"
                name="modo_pdf"
                value={pdfMode}
                setValue={setPdfMode}
                valuesList={fileModeList}
              />

              {/* PDF Mode Selection */}
              {/* <div>
                <label className="mb-1 block text-xs text-slate-500">
                  Modo de PDF
                </label>
                <select
                  value={pdfMode}
                  onChange={(e) => setPdfMode(e.target.value as PDFMode)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="smallDocument">Documento Pequeño</option>
                  <option value="fullPage">Página Completa</option>
                </select>
              </div> */}
            </div>
          </div>

          {/* Camera View */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                Vista Cámara
              </h3>
              {cameras.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={switchCamera}
                    disabled={isCameraLoading}
                    className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-gray-700 disabled:bg-gray-400"
                  >
                    {isCameraLoading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                    ) : (
                      "Cambiar cámara"
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <span className="absolute right-2 top-2 rounded-md bg-gray-800 bg-opacity-50 px-2 py-1 text-xs text-slate-200">
                {"Cámara " + (currentCameraIndex + 1)}
              </span>
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
                className="aspect-[3/4] h-auto w-full object-cover md:aspect-[16/9]"
                autoPlay
                playsInline
                muted
              />
              {/* Take photo button */}
              <button
                onClick={takePhoto}
                disabled={isLoading || isCameraLoading}
                className="absolute bottom-5 left-1/2 z-50 flex size-20 grow -translate-x-1/2 rotate-90 items-center justify-center rounded-full bg-slate-200/70 transition-all duration-200 active:scale-90 md:hidden"
              >
                <div className="flex size-16 items-center justify-center rounded-full border-4 border-slate-900/80 text-slate-900/80">
                  <FaCamera size={20} />
                </div>
              </button>
            </div>

            <div className="hidden gap-3 md:flex">
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
                  "Tomar Foto"
                )}
              </button>
            </div>
          </div>

          {/* Photo Preview */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Imagen Capturada
            </h3>
            <div>
              <div
                id="preview_image"
                className="flex min-h-40 w-full items-center justify-center rounded-lg bg-gray-100 p-2"
              >
                {capturedPhoto ? (
                  <div className="relative w-fit space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-600">
                        {documentName || "Documento"}
                      </h4>
                      <Trash2
                        onClick={() => setCapturedPhoto(null)}
                        className="size-5 cursor-pointer text-slate-600 hover:text-red-500"
                      />
                    </div>
                    <img
                      src={capturedPhoto}
                      alt="Foto capturada"
                      className="h-auto w-full max-w-md rounded-lg object-contain shadow-md"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="mb-1 text-3xl">
                      <FaImage className="place-self-center" />
                    </div>
                    <p className="text-sm text-slate-400">Sin captura</p>
                  </div>
                )}
              </div>

              {capturedPhoto && (
                <div className="mt-4 grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={viewPdf}
                      disabled={isLoading}
                      className="flex h-10 items-center justify-center rounded-lg border border-blue-500 text-sm font-medium text-blue-500 transition-all duration-200 hover:bg-blue-50 active:scale-95 disabled:border-blue-300 disabled:text-blue-300"
                    >
                      {isLoading ? (
                        <>
                          <div className="size-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                          Generando...
                        </>
                      ) : (
                        "Vista Previa"
                      )}
                    </button>
                    <button
                      onClick={uploadPdf}
                      disabled={isLoading}
                      className="flex h-10 items-center justify-center rounded-lg bg-emerald-500 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-600 active:scale-95 disabled:bg-emerald-600/50"
                    >
                      {isLoading ? (
                        <>
                          <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Guardando...
                        </>
                      ) : (
                        "Guardar PDF"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo processing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
