"use client";
import React, { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import CampañaDropdown from "@/app/ui/dashboard/campañas/campaña-dropdown";
import { useRouter } from "next/navigation";
import Input from "@/app/ui/dashboard/campañas/n-campaña-input";
import { crearCampaña } from "@/app/lib/actions";

export default function NuevaCampañaModal() {
  const [nombreCampaña, setNombreCampaña] = useState("");
  const router = useRouter();

  return (
    <div className="flex w-96 flex-col gap-3 rounded-xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Crear Campaña</h2>
        <RiCloseLine
          className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          onClick={() => router.back()}
        />
      </div>
      {/* <div className="border-t border-gray-200/80"></div> */}
      <p className="text-xs text-gray-500">
        Elige el tipo de campaña que quieres ingresar y sus datos
        correspondientes.
      </p>
      <form action={crearCampaña} className="flex flex-col gap-8 pt-4">
        <CampañaDropdown
          label="Nombre Campaña"
          nombreCampaña={nombreCampaña}
          setNombreCampaña={setNombreCampaña}
        />
        <Input
          placeHolder="Término..."
          label="Término"
          type="date"
          nombre="termino"
        />
        <Input
          placeHolder="Descripción..."
          label="Descripción"
          type="text"
          nombre="descripcion"
        />
      </form>
      <button className="mt-5 flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 active:scale-95">
        Guardar
      </button>
    </div>
  );
}
