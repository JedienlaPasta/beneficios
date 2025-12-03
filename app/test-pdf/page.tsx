"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Reemplaza el import estático del documento por dinámico cliente
const ActaEntregaCompleta = dynamic(
  () =>
    import("../ui/dashboard/entregas/[id]/pdf/ActaEntrega").then(
      (m) => m.default,
    ),
  { ssr: false },
);

// Importamos el PDFViewer dinámicamente para evitar errores de servidor (SSR)
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <div className="p-10">Cargando visualizador de PDF...</div>,
  },
);

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // DATOS DE PRUEBA (MOCKS)
  // Modifica esto para probar casos extremos (textos largos, sin beneficios, etc.)
  const datosPrueba = {
    folio: "2184-25-TA",
    receptor: {
      nombre: "Amawa Samadhi Sophia Dharma Abarca Torres",
      run: "12.345.678-9",
      //   run: "",
      domicilio: "Av. Isidoro Dubournais 123, El Quisco",
      tramo: "40%",
      folioRSH: "9988 7766",
      telefono: "+569 1234 5678",
      fechaSolicitud: "25/11/2025",
      relacion: "Presidente Junta de Vecinos",
    },
    // Beneficiario distinto al receptor
    beneficiario: {
      nombre: "Junta de Vecinos N°23 Los Pinos",
      run: "65.432.109-0",
      domicilio: "Av. Los Pinos 456, El Quisco",
      tramo: "40%",
      folioRSH: "9988 7766",
      telefono: "",
      //   telefono: "+569 1234 5678",
      edad: "7 años",
      fechaSolicitud: "25/11/2025",
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

  if (!isClient) return null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* El Viewer ocupa toda la pantalla restante */}
      <PDFViewer
        style={{ width: "100%", flexGrow: 1, border: "none" }}
        showToolbar={true}
      >
        <ActaEntregaCompleta data={datosPrueba} />
      </PDFViewer>
    </div>
  );
}