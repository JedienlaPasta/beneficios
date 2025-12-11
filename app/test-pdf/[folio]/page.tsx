"use client";
import { getPdfBlobUrl } from "@/app/lib/pdf";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ActaData } from "@/app/lib/pdf/types";

// Datos dummy para probar el diseño (o usa tus datos reales)
// const datosPrueba = {
//   folio: "2184-25-TA",
//   numeroEntrega: 2,
//   profesional: {
//     nombre: "María Rodríguez López",
//     cargo: "Trabajadora Social",
//     fecha: "25 Noviembre, 2025",
//   },
//   beneficiario: {
//     nombre: "Junta de Vecinos Nº23 Los Pinos",
//     run: "65.432.109-0",
//     domicilio: "Av. Los Pinos 456, El Quisco",
//     tramo: "40%",
//     folioRSH: "9988 7766",
//     telefono: "+569 1234 5678",
//     edad: "7 años",
//   },
//   receptor: {
//     nombre: "Amawa Samadhi Sophia Dharma Abarca Torres",
//     run: "12.345.678-9",
//     domicilio: "Av. Isidoro Dubournais 123, El Quisco",
//     tramo: "40%",
//     folioRSH: "9988 7766",
//     telefono: "+569 1234 5678",
//     relacion: "Presidente Junta de Vecinos",
//   },
//   beneficios: [
//     {
//       nombre: "Pañales",
//       codigo: "PA",
//       detalles: [
//         { label: "Cantidad", value: "3 paquetes de 50 unidades" },
//         { label: "Talla", value: "G (Adulto)" },
//       ],
//     },
//     {
//       nombre: "Vale de Gas",
//       codigo: "GA",
//       detalles: [
//         { label: "Código", value: "00962" },
//         { label: "Cilindro", value: "15kg" },
//       ],
//     },
//     {
//       nombre: "Vale de Gas",
//       codigo: "GA",
//       detalles: [
//         { label: "Código", value: "00962" },
//         { label: "Cilindro", value: "15kg" },
//       ],
//     },
//   ],
//   // justificacion: "Usuaria posee RSH con su hijo, está sin trabajo...",
//   justificacion:
//     "Usuaria posee RSH con su hijo, está sin trabajo del mes de enero, recibió finiquito por 7 años de servicio y está con seguro de cesantía el cual termina en el mes de septiembre. Se encuentra inscrita en la OMIL y esta separada del padre de su hijo, quien paga el dividendo de su departamento. Debido a precariedad económica del momento, se hace entrega de Amipass de manera excepcional.",
// };

export default function PageDevPreview() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { folio } = useParams() as { folio: string };

  useEffect(() => {
    const generar = async () => {
      try {
        if (!folio) return;

        // Pide los datos al servidor
        const res = await fetch(`/api/acta/${folio}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No se pudo obtener el acta");
        }
        const data: ActaData = await res.json();
        console.log(data);

        // Genera el PDF en el cliente con pdfmake
        const url = await getPdfBlobUrl(data);
        setPdfUrl(url);
      } catch (e) {
        console.error(e);
        // Opcional: fallback a datos dummy si la API falla
        // const url = await getPdfBlobUrl(datosPrueba as ActaData);
        // setPdfUrl(url);
      }
    };
    generar();
  }, [folio]);

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
