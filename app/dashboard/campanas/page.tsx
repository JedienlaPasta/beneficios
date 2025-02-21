"use client";
import CampañasActivas from "@/app/ui/dashboard/campañas/campañas_activas";
import NuevaCampañaModal from "@/app/ui/dashboard/campañas/nueva-campaña-modal";
import TablaDatosDashboard from "@/app/ui/dashboard/tabla-datos-dashboard";
import { RiCloseLine } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";
export default function Campanas() {
  const [abrirModal, setAbrirModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
          <TablaDatosDashboard searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
}
