"use client";
import { createAndDownloadPDFByFolio } from "@/app/lib/actions/entregas";
import { toast } from "sonner";
import ActaEntrega from "./pdf/ActaEntrega";
import dynamic from "next/dynamic";

type Props = {
  children?: React.ReactNode;
  folio: string;
};

// Importar PDFDownloadLink dinámicamente para evitar errores de servidor en Next.js
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <p>Cargando módulo PDF...</p> },
);

export default function GetNewFileButton({ children, folio }: Props) {
  // const handleClick = async (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   const toastId = toast.loading("Generando documento...");

  //   try {
  //     const response = await createAndDownloadPDFByFolio(folio);

  //     if (!response.success) {
  //       toast.error(response.message || "Error al descargar documento", {
  //         id: toastId,
  //       });
  //       return;
  //     }

  //     if (!response.data) {
  //       toast.error("No se encontró el contenido del documento", {
  //         id: toastId,
  //       });
  //       return;
  //     }

  //     const base64Data = response.data.content;
  //     const byteArray = Uint8Array.from(atob(base64Data), (c) =>
  //       c.charCodeAt(0),
  //     );

  //     if (byteArray.length < 500) {
  //       throw new Error("Archivo PDF corrupto o inválido");
  //     }

  //     const footerRange = byteArray.slice(-1024);
  //     const footerText = new TextDecoder().decode(footerRange);
  //     if (!footerText.includes("%%EOF")) {
  //       throw new Error(
  //         "Invalid PDF structure (missing EOF marker in last 1KB)",
  //       );
  //     }

  //     const blob = new Blob([byteArray], { type: "application/pdf" });
  //     if (!blob.type.includes("pdf")) {
  //       throw new Error("Tipo de archivo inválido");
  //     }
  //     if (blob.size === 0) {
  //       throw new Error("Archivo PDF vacío recibido");
  //     }

  //     const pdfUrl = URL.createObjectURL(blob);

  //     const newWindow = window.open(pdfUrl, "_blank");

  //     if (!newWindow) {
  //       throw new Error(
  //         "Popup bloqueado - Por favor permite ventanas emergentes para este sitio",
  //       );
  //     }

  //     // Cleanup for when new tab closes
  //     newWindow.addEventListener("load", () => {
  //       // Delay revocation until window closes
  //       const checkClosed = setInterval(() => {
  //         if (newWindow.closed) {
  //           URL.revokeObjectURL(pdfUrl);
  //           clearInterval(checkClosed);
  //         }
  //       }, 1000);
  //     });

  //     // Boton de descarga en caso de que no se abra en una nueva pestaña
  //     toast.success("Documento abierto en nueva pestaña", {
  //       id: toastId,
  //       action: {
  //         label: "Descargar",
  //         onClick: () => {
  //           const a = document.createElement("a");
  //           a.href = pdfUrl;
  //           a.download = response.data.filename;
  //           a.click();
  //           URL.revokeObjectURL(pdfUrl);
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Error desconocido";
  //     toast.error(`Error al procesar documento: ${errorMessage}`, {
  //       id: toastId,
  //       duration: 5000,
  //     });
  //     console.error("PDF handling error:", error);
  //   }
  // };

  const datosActaCompleta = {
    folio: "2184-25-TA",
    receptor: {
      nombre: "Juan Pérez Gonzales",
      run: "12.345.678-9",
      domicilio: "Av. Isidoro Dubournais 123, El Quisco",
      tramo: "40%",
      folioRSH: "99887766",
      telefono: "+56 9 1234 5678",
      fechaSolicitud: "25/11/2025",
    },
    // SECCIÓN DINÁMICA (Mantenemos la lógica anterior)
    beneficios: {
      // Cambia a 'null' para probar cómo desaparece la fila compleja
      panales: { cantidad: 3, talla: "G", adulto: true },
      valeGas: { codigo: "VG-998877" },
      tarjetaComida: null,
      otros: { descripcion: "Kit de aseo personal básico" },
    },
    // NUEVAS SECCIONES
    justificacion:
      "Usuario se encuentra en situación de vulnerabilidad manifiesta debido a pérdida reciente de empleo y enfermedad de familiar a cargo. Se evalúa la necesidad urgente de los insumos.",
    profesional: {
      nombre: "María Rodríguez López",
      cargo: "Trabajadora Social",
      fecha: "25 de Noviembre de 2025",
    },
  };

  return (
    <div className="flex flex-col items-end">
      {/* <button
        onClick={handleClick}
        className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-100/70 active:scale-95"
      >
        {children}
      </button> */}
      <PDFDownloadLink
        document={<ActaEntrega data={datosActaCompleta} />}
        fileName={`acta_entrega.pdf`}
        className="btn btn-primary rounded bg-blue-600 p-2 text-white"
      >
        {({ blob, url, loading, error }) =>
          loading ? "Generando documento..." : "Descargar Acta PDF"
        }
      </PDFDownloadLink>
    </div>
  );
}
