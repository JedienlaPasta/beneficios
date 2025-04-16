"use client";
import { formatDate, formatRUT } from "@/app/lib/utils/format";
// import { useRouter } from "next/navigation";

export default function EntregasTableRow({
  item,
}: {
  item: {
    // rut: number;
    // dv: string;
    // nombres_rsh: string;
    // apellidos_rsh: string;
    // direccion: string;
    // sector: string;
    // tramo: number;
    // ultima_entrega: Date;

    rut: string;
    folio: string;
    estado_documentos: string;
    fecha_entrega: Date;
    nombres_rsh: string;
    apellidos_rsh: string;
  };
}) {
  const {
    rut,
    folio,
    estado_documentos,
    fecha_entrega,
    nombres_rsh,
    apellidos_rsh,
  } = item;
  // const router = useRouter();
  const formattedRut = formatRUT(rut);
  const fecha = formatDate(fecha_entrega);

  // const handleClick = () => {
  //   router.push(`/dashboard/entregas/${rut}`);
  // };

  return (
    <tr className="grid grid-cols-26 gap-8 text-nowrap px-6 text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="col-span-5 py-4 text-slate-700">{folio}</td>
      <td className="col-span-4 py-4 text-slate-600">{formattedRut}</td>
      <td className="col-span-9 py-4 text-slate-600">
        {nombres_rsh + " " + apellidos_rsh}
      </td>
      <td className="col-span-4 py-4 text-slate-600">{estado_documentos}</td>

      <td className="col-span-4 py-4 text-right text-slate-600">{fecha}</td>
    </tr>
  );
}
