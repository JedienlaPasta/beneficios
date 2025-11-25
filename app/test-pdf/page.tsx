"use client"; // Necesario para Next.js App Router

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ActaEntregaCompleta from "../ui/dashboard/entregas/[id]/pdf/ActaEntrega";

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
      domicilio: "Av. Isidoro Dubournais 123, El Quisco",
      tramo: "40%",
      folioRSH: "99887766",
      telefono: "9 1234 5678",
      fechaSolicitud: "25/11/2025",
    },
    beneficios: {
      panales: { cantidad: 3, talla: "G", adulto: true },
      valeGas: { codigo: "VG-998877" },
      tarjetaComida: { codigo: "TC-12345" }, // Prueba comentando esto para ver si desaparece
      otros: { descripcion: "Kit de aseo personal básico" },
    },
    justificacion:
      "Usuario se encuentra en situación de vulnerabilidad manifiesta debido a pérdida reciente de empleo y enfermedad de familiar a cargo.",
    profesional: {
      nombre: "María Rodríguez López",
      cargo: "Trabajadora Social",
      fecha: "25 Noviembre, 2025",
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
      {/* <div
        style={{
          padding: "10px",
          background: "#333",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>
          Modo Diseño: Acta de Entrega
        </h1>
        <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
          Visualizador de acta de entrega en tiempo real.
        </span>
      </div> */}

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
