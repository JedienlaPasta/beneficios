import React, { useRef, useEffect, useState } from "react";

// Define the props interface
interface CamaraComponentProps {
  onPhotoTaken?: (dataUrl: string) => void;
}

const CamaraComponent: React.FC<CamaraComponentProps> = ({ onPhotoTaken }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
      }
    };

    startCamera();

    // Limpiar el stream cuando el componente se desmonte
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
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
    }
  };

  return (
    <div>
      <h2>Captura de Foto</h2>
      <video
        ref={videoRef}
        style={{ width: "100%", maxWidth: "600px" }}
      ></video>
      <button onClick={takePhoto}>Tomar Foto</button>
      {photoDataUrl && (
        <>
          <h3>Foto Capturada:</h3>
          <img
            src={photoDataUrl}
            alt="Foto capturada"
            style={{ maxWidth: "100%", border: "1px solid #ccc" }}
          />
        </>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

export default CamaraComponent;
