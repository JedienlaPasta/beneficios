"use client";
import CampañasActivas from "@/app/ui/dashboard/campañas/campañas_activas";
import NuevaCampañaModal from "@/app/ui/dashboard/campañas/nueva-campaña-modal";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
// import { RiCloseCircleFill } from "react-icons/ri";
import { RiCloseLine } from "react-icons/ri";
// import NuevaCampañaForm from "@/app/ui/dashboard/campañas/nueva_campaña_form";

export default function Campanas() {
  const [abrirModal, setAbrirModal] = useState(false);

  const tableData = [
    {
      nombre: "Materiales de Construcción",
      entregas: 76,
      estado: "En curso",
      inicio: "21 / 05 / 2025",
      termino: "21 / 05 / 2025",
    },
    {
      nombre: "Balones de Gas",
      entregas: 241,
      estado: "En curso",
      inicio: "12 / 02 / 2024",
      termino: "12 / 02 / 2024",
    },
    {
      nombre: "Pack de Pañales",
      entregas: 12,
      estado: "Terminado",
      inicio: "27 / 08 / 2021",
      termino: "27 / 08 / 2021",
    },
    {
      nombre: "Desratización",
      entregas: 3,
      estado: "Terminado",
      inicio: "04 / 09 / 2020",
      termino: "04 / 09 / 2020",
    },
    {
      nombre: "Tarjeta de Comida",
      entregas: 127,
      estado: "Terminado",
      inicio: "09 / 12 / 2019",
      termino: "09 / 12 / 2019",
    },
    {
      nombre: "Materiales de Construcción",
      entregas: 76,
      estado: "En curso",
      inicio: "21 / 05 / 2025",
      termino: "21 / 05 / 2025",
    },
    {
      nombre: "Balones de Gas",
      entregas: 241,
      estado: "En curso",
      inicio: "12 / 02 / 2024",
      termino: "12 / 02 / 2024",
    },
    {
      nombre: "Pack de Pañales",
      entregas: 12,
      estado: "Terminado",
      inicio: "27 / 08 / 2021",
      termino: "27 / 08 / 2021",
    },
    {
      nombre: "Desratización",
      entregas: 3,
      estado: "Terminado",
      inicio: "04 / 09 / 2020",
      termino: "04 / 09 / 2020",
    },
    {
      nombre: "Tarjeta de Comida",
      entregas: 127,
      estado: "Terminado",
      inicio: "09 / 12 / 2019",
      termino: "09 / 12 / 2019",
    },
    {
      nombre: "Materiales de Construcción",
      entregas: 76,
      estado: "En curso",
      inicio: "21 / 05 / 2025",
      termino: "21 / 05 / 2025",
    },
    {
      nombre: "Balones de Gas",
      entregas: 241,
      estado: "En curso",
      inicio: "12 / 02 / 2024",
      termino: "12 / 02 / 2024",
    },
    {
      nombre: "Pack de Pañales",
      entregas: 12,
      estado: "Terminado",
      inicio: "27 / 08 / 2021",
      termino: "27 / 08 / 2021",
    },
    {
      nombre: "Desratización",
      entregas: 3,
      estado: "Terminado",
      inicio: "04 / 09 / 2020",
      termino: "04 / 09 / 2020",
    },
    {
      nombre: "Tarjeta de Comida",
      entregas: 127,
      estado: "Terminado",
      inicio: "09 / 12 / 2019",
      termino: "09 / 12 / 2019",
    },
  ];
  const tableRows = tableData.map((item, index) => (
    <TableRow key={index} item={item} />
  ));

  const toggleModal = () => {
    setAbrirModal((prev) => !prev);
  };

  return (
    <div className="w-full overflow-hidden p-4 text-slate-900">
      <NuevaCampañaModal closeModal={toggleModal} />
      <div className="flex items-center justify-between px-6">
        <h2 className="text-2xl font-bold">Campañas</h2>
        <button
          onClick={toggleModal}
          className="h-10 rounded-md bg-slate-800 px-6 text-sm text-white"
        >
          Nueva Campaña
        </button>
      </div>
      <p className="px-6 text-xs text-slate-900/60">
        Registro de todas las campañas creadas, puedes gestionar que hacer con
        ellas.
      </p>
      {/* Form para ingresar nueva campaña */}
      {/* <NuevaCampañaForm /> */}
      <div className="flex flex-col gap-8 rounded-xl p-6">
        {/* Campañas Activas */}
        <CampañasActivas />
        {/* tabla campañas */}
        <div className="flex flex-col gap-4">
          <h2 className={`text-lg font-bold text-slate-900/90`}>
            Historial de Campañas Creadas
          </h2>
          <div>
            <div className="flex h-9 max-w-96 items-center gap-2 overflow-hidden rounded-lg border border-gray-900/15 bg-white px-4 text-gray-600 shadow-md shadow-slate-800/20">
              <FiSearch className="text-xl" />
              <input
                type="text"
                placeholder="Buscar"
                className="w-full bg-transparent text-sm text-gray-700 outline-none"
              />
              <RiCloseLine className="text-xl" />
            </div>
          </div>
          <div className="overflow-x-auto rounded-md shadow-lg shadow-slate-800/20">
            <table className="flex min-w-[44rem] grow flex-col overflow-hidden bg-white text-slate-900/90">
              <thead className="bg-slate-800 py-1 text-xs text-white">
                <tr className="grid grid-cols-24 text-left">
                  <th className="col-span-9 px-6 py-3">CAMPAÑA</th>
                  <th className="col-span-4 px-6 py-3">INICIO</th>
                  <th className="col-span-4 px-6 py-3">TÉRMINO</th>
                  <th className="col-span-4 px-6 py-3">ESTADO</th>
                  <th className="col-span-3 px-6 py-3 text-right">ENTREGAS</th>
                </tr>
              </thead>
              <tbody className="border border-gray-900/15">{tableRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tabla
function TableRow({
  item,
}: {
  item: {
    nombre: string;
    entregas: number;
    estado: string;
    inicio: string;
    termino: string;
  };
}) {
  const { nombre, entregas, estado, inicio, termino } = item;

  return (
    <tr className="grid grid-cols-24 text-sm odd:bg-gray-800/10 hover:bg-gray-800/20">
      <CustomRow col_span="col-span-9">{nombre}</CustomRow>
      <CustomRow col_span="col-span-4">{inicio}</CustomRow>
      <CustomRow col_span="col-span-4">{termino}</CustomRow>
      <CustomRow col_span="col-span-4">{estado}</CustomRow>
      <CustomRow col_span="col-span-3">{entregas}</CustomRow>
    </tr>
  );
}

function CustomRow({
  children,
  col_span,
  font,
}: {
  children: string | number;
  col_span: string;
  font?: string;
}) {
  const numberFont = typeof children === "string" ? font : font + " text-right";
  const rowStyle = col_span + " px-6 py-3 text-sm tabular-nums " + numberFont;

  return <td className={rowStyle}>{children}</td>;
}
