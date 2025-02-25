"use client";
import NuevaCampañaModal from "@/app/ui/dashboard/campañas/nueva-campaña-modal";
import TablaDatosDashboard from "@/app/ui/dashboard/tabla-datos-dashboard";
import { RiCloseLine } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";
import CampañasActivas from "@/app/ui/dashboard/campañas/campañas-activas";
import { IoCardOutline, IoTicketOutline } from "react-icons/io5";
import { TbDiaper } from "react-icons/tb";
export default function Campanas() {
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
          <h2 className="text-3xl font-bold text-slate-800">Campañas</h2>
          <p className="text-sm text-slate-600/70">
            Gestionar campañas activas y historial de campañas.
          </p>
        </div>
        <button
          onClick={toggleModal}
          className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-600 active:scale-95"
        >
          <span className="text-lg">+</span> Nueva Campaña
        </button>
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        {/* <DatosGenerales /> */}
        <div className="flex gap-4">
          <CampañasActivas
            nombre="Vale de Gas"
            termina="27 Abr, 2025"
            icono={<IoTicketOutline className="text-4xl" />}
          />
          <CampañasActivas
            nombre="Tarjeta de Comida"
            termina="04 Jun, 2025"
            icono={<IoCardOutline className="text-4xl" />}
          />
          <CampañasActivas
            nombre="Pañales"
            termina="12 Sep, 2025"
            icono={<TbDiaper className="text-4xl" />}
          />
        </div>
        <div className="flex flex-col gap-4 rounded-xl bg-slate-50">
          <div className="flex items-center justify-between px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
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
