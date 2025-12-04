"use client";
import React, { useEffect, useState } from "react";
import { getPdfBlobUrl } from "../lib/pdf";

// Datos dummy para probar el diseño (o usa tus datos reales)
const datosPrueba = {
  folio: "2184-25-TA",
  numeroEntrega: 2,
  profesional: {
    nombre: "María Rodríguez López",
    cargo: "Trabajadora Social",
    fecha: "25 Noviembre, 2025",
  },
  beneficiario: {
    nombre: "Junta de Vecinos Nº23 Los Pinos",
    run: "65.432.109-0",
    domicilio: "Av. Los Pinos 456, El Quisco",
    tramo: "40%",
    folioRSH: "9988 7766",
    telefono: "+569 1234 5678",
    edad: "7 años",
  },
  receptor: {
    nombre: "Amawa Samadhi Sophia Dharma Abarca Torres",
    run: "12.345.678-9",
    domicilio: "Av. Isidoro Dubournais 123, El Quisco",
    tramo: "40%",
    folioRSH: "9988 7766",
    telefono: "+569 1234 5678",
    relacion: "Presidente Junta de Vecinos",
  },
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
  ],
  justificacion: "Usuaria posee RSH con su hijo, está sin trabajo...",
};

export default function PageDevPreview() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generar el PDF al montar el componente
    const generar = async () => {
      const url = await getPdfBlobUrl(datosPrueba);
      setPdfUrl(url);
    };
    generar();
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="h-full w-full"
            title="Vista Previa PDF"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Generando vista previa...
          </div>
        )}
      </div>
    </div>
  );
}
