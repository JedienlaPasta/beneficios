"use client";
import { FiBriefcase, FiMail, FiShield, FiUser } from "react-icons/fi";

type UserProfileProps = {
  userSession: {
    nombre: string;
    correo: string;
    cargo: string;
    rol: string;
  };
};

export default function UserProfile({ userSession }: UserProfileProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
          {userSession.nombre?.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            {userSession.nombre}
          </h2>
          <p className="text-slate-500">{userSession.correo}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-3 rounded-md border border-slate-200 p-4">
          <FiUser className="text-xl text-blue-500" />
          <div>
            <p className="text-xs text-slate-500">Nombre</p>
            <p className="font-medium text-slate-800">{userSession.nombre}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md border border-slate-200 p-4">
          <FiMail className="text-xl text-blue-500" />
          <div>
            <p className="text-xs text-slate-500">Correo</p>
            <p className="font-medium text-slate-800">{userSession.correo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md border border-slate-200 p-4">
          <FiBriefcase className="text-xl text-blue-500" />
          <div>
            <p className="text-xs text-slate-500">Cargo</p>
            <p className="font-medium text-slate-800">{userSession.cargo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md border border-slate-200 p-4">
          <FiShield className="text-xl text-blue-500" />
          <div>
            <p className="text-xs text-slate-500">Rol</p>
            <p className="font-medium text-slate-800">{userSession.rol}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
