"use client";
import React, { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import CampañaDropdown from "@/app/ui/dashboard/campañas/campaña-dropdown";
import { useRouter } from "next/navigation";
import Input from "@/app/ui/dashboard/campañas/nueva-campaña-input";
import { crearCampaña } from "@/app/lib/actions";

export default function NuevaCampañaModal() {
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
      <p className="text-xs text-gray-500">
        Elige el tipo de campaña que quieres ingresar y sus datos
        correspondientes.
      </p>
      <form action={crearCampaña} className="flex flex-col gap-8 pt-4">
        <CampañaDropdown label="Campaña..." nombre={"nombre"} />
        {/* <Input
          placeHolder="Tipo de dato..."
          label="Dato"
          type="text"
          nombre="tipo_dato"
        /> */}
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
        <button
          type="submit"
          // onClick={() => router.back()}
          className="flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 active:scale-95"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
