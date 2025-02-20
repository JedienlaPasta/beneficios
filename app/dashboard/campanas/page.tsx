"use client";
import CampañasActivas from "@/app/ui/dashboard/campañas/campañas_activas";
import NuevaCampañaModal from "@/app/ui/dashboard/campañas/nueva-campaña-modal";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { RiCloseLine } from "react-icons/ri";

export default function Campanas() {
  const [abrirModal, setAbrirModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredTableRows = tableData
    .filter((item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .map((item, index) => <TableRow key={index} item={item} />);

  const toggleModal = () => {
    setAbrirModal((prev) => !prev);
  };

  return (
    <div className="w-full px-6 py-8 pr-0 text-slate-900 lg:px-10">
      {abrirModal && <NuevaCampañaModal closeModal={toggleModal} />}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Campañas</h2>
          <p className="mt-2 text-sm text-slate-600">
            Registro de todas las campañas creadas, puedes gestionar que hacer
            con ellas.
          </p>
        </div>
        <button
          onClick={toggleModal}
          className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-600 active:scale-95"
        >
          <span className="text-lg">+</span> Nueva Campaña
        </button>
      </div>

      <div className="flex flex-col gap-10 rounded-xl">
        <CampañasActivas />

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              Historial de Campañas
            </h2>
            <div className="relative">
              <div className="flex h-11 w-72 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <FiSearch className="text-lg text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar campaña..."
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                {searchTerm && (
                  <RiCloseLine
                    className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[44rem]">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left">Campaña</th>
                  <th className="px-6 py-4 text-left">Inicio</th>
                  <th className="px-6 py-4 text-left">Término</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-right">Entregas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTableRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const statusColor =
    estado === "En curso"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <tr className="group transition-colors hover:bg-slate-50/50">
      <td className="px-6 py-4">
        <span className="font-medium text-slate-700">{nombre}</span>
      </td>
      <td className="px-6 py-4 text-slate-600">{inicio}</td>
      <td className="px-6 py-4 text-slate-600">{termino}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}
        >
          {estado}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <span className="font-medium text-slate-700">{entregas}</span>
      </td>
    </tr>
  );
}
