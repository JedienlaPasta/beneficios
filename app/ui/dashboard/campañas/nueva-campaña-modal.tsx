import React, { useState } from "react";
import { RiCloseLine } from "react-icons/ri";

type NuevaCampañaModalProps = {
  closeModal: () => void;
};

export default function NuevaCampañaModal({
  closeModal,
}: NuevaCampañaModalProps) {
  return (
    <div className="fixed left-0 top-0 z-[1] flex h-dvh w-full items-center justify-center">
      <div
        onClick={() => closeModal()}
        className="fixed h-dvh w-full cursor-pointer bg-black/30"
      ></div>
      <div className="relative z-[10] flex w-96 flex-col gap-4 rounded-xl bg-white p-5">
        <RiCloseLine
          className="absolute right-4 top-4 cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          onClick={() => closeModal()}
        />
        <h2 className="text-lg font-bold">Crear Campaña</h2>
        <div className="border-t border-gray-200/70"></div>
        <p className="text-xs text-gray-500">
          Elige el tipo de campaña que quieres ingresar y sus datos
          correspondientes.
        </p>
        <Input placeHolder="Nombre campaña..." />
        <Input placeHolder="Código..." />
        <Input placeHolder="Descripción..." />
        <button className="flex h-11 w-fit items-center gap-2 self-end rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-10 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-600 active:scale-95">
          Guardar
        </button>
      </div>
    </div>
  );
}

function Input({ placeHolder }: { placeHolder: string }) {
  const [campo, setCampo] = useState("");
  return (
    <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500">
      <input
        type="text"
        value={campo}
        onChange={(e) => setCampo(e.target.value)}
        placeholder={placeHolder}
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      {campo && (
        <RiCloseLine
          className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          onClick={() => setCampo("")}
        />
      )}
    </div>
  );
}
