"use client";
// import { createAndDownloadPDFByFolio } from "@/app/lib/actions/entregas";
// import { toast } from "sonner";
import ActaEntrega from "./pdf/ActaEntrega";
import dynamic from "next/dynamic";
import { useMemo } from "react";

type Props = {
  children?: React.ReactNode;
  folio: string;
  enabled?: boolean; // nuevo: controlar montaje
};

// Importar PDFDownloadLink dinámicamente para evitar errores de servidor en Next.js
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <p>Cargando módulo PDF...</p> },
);

export default function GetNewFileButton({
  children,
  folio,
  enabled = true,
}: Props) {
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

  const datosPrueba = {
    folio: "2184-25-TA",
    receptor: {
      nombre: "Amawa Samadhi Sophia Dharma Abarca Torres",
      run: "12.345.678-9",
      domicilio: "Av. Isidoro Dubournais 123, El Quisco",
      tramo: "40%",
      folioRSH: "9988 7766",
      telefono: "+569 1234 5678",
      fechaSolicitud: "25/11/2025",
      relacion: "Presidente Junta de Vecinos",
    },
    beneficiario: {
      nombre: "Junta de Vecinos N°23 Los Pinos",
      run: "65.432.109-0",
      domicilio: "Av. Los Pinos 456, El Quisco",
      tramo: "40%",
      folioRSH: "9988 7766",
      telefono: "+569 1234 5678",
      fechaSolicitud: "25/11/2025",
      edad: "7 años",
    },
    // Ordinal de entrega del año
    numeroEntrega: 2,
    beneficios: [
      {
        nombre: "Pañales",
        codigo: "PA",
        detalles: [
          { label: "Cantidad", value: "3 paquetes de 50 unidades" },
          { label: "Talla", value: "G (Adulto)" },
        ],
      },
      {
        nombre: "Vale de Gas",
        codigo: "GA",
        detalles: [
          { label: "Código", value: "00962" },
          // Puedes agregar más detalles aquí sin tocar el PDF
          { label: "Cilindro", value: "15kg" },
        ],
      },
      {
        nombre: "Tarjeta de Comida", // Ejemplo de un beneficio nuevo futuro
        codigo: "TA",
        detalles: [
          { label: "Código", value: "NN274659K" },
          //   "Posee un valor de $47.000 en compras, vence 10 días luego de la fecha de entrega.", // También soporta texto simple sin label
        ],
      },
    ],
    justificacion:
      "Usuaria posee RSH con su hijo, está sin trabajo del mes de enero, recibió finiquito por 7 años de servicio y está con seguro de cesantía el cual termina en el mes de septiembre. Se encuentra inscrita en la OMIL y esta separada del padre de su hijo, quien paga el dividendo de su departamento. Debido a precariedad económica del momento, se hace entrega de Amipass de manera excepcional.",
    profesional: {
      nombre: "María Rodríguez López",
      cargo: "Trabajadora Social",
      fecha: "25 Noviembre, 2025",
      fechaISO: "2025-11-25",
    },
  };

  // Mantener estable el nodo del documento entre renders de pestañas
  const docNode = useMemo(() => <ActaEntrega data={datosPrueba} />, []);

  // if (!enabled) {
  //   return (
  //     <button
  //       aria-disabled
  //       className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 opacity-60"
  //     >
  //       {children || "Nueva Acta"}
  //     </button>
  //   );
  // }

  return (
    <PDFDownloadLink
      key="pdf-stable" // evita residuos de reconciliación
      document={docNode}
      fileName={`acta_entrega.pdf`}
      className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-100/70 active:scale-95"
    >
      {({ loading }) => (loading ? "Cargando..." : children || "Nueva Acta")}
    </PDFDownloadLink>
  );
}
