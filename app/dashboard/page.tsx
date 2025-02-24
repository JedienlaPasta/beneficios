"use client";
import DatosGenerales from "@/app/ui/dashboard/datos-generales";
import NuevaCampañaModal from "@/app/ui/dashboard/campañas/nueva-campaña-modal";
import TablaDatosDashboard from "@/app/ui/dashboard/tabla-datos-dashboard";
import { RiCloseLine } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";
import TableroEntregasInicio from "../ui/dashboard/inicio/entregas-inicio";
export default function DashboardPage() {
  const [abrirModal, setAbrirModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleModal = () => {
    setAbrirModal((prev) => !prev);
  };

  return (
    <div className="w-full px-6 py-8 text-slate-900 lg:px-10">
      {abrirModal && <NuevaCampañaModal closeModal={toggleModal} />}
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Inicio</h2>
          <p className="text-sm text-slate-600/70">
            Datos generales y actividades personales.
          </p>
          {/* <p className="text-sm text-slate-600/70">
            Aquí podras encontrar información sobre tus actividades, asi como
            datos generales.
          </p> */}
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <DatosGenerales />
        <div className="flex flex-col gap-4 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-800">
            Actividad de Entregas
          </h2>
          <TableroEntregasInicio />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Actividades Personales
            </h2>
            <div className="relative">
              <div className="flex h-11 w-72 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <FiSearch className="text-lg text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
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
          <TablaDatosDashboard searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
}
