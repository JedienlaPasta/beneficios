"use client";
import { useState } from "react";
import { FiBriefcase, FiMail, FiShield, FiUser, FiLock } from "react-icons/fi";
import ChangePasswordModal from "./change-password-modal";

type UserProfileProps = {
  userData: {
    id: string;
    nombre_usuario: string;
    correo: string;
    cargo: string;
    rol: string;
    profilePicture?: string;
  };
};

export default function UserProfile({ userData }: UserProfileProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      {/* Header with background */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="absolute -bottom-16 left-8 flex items-end">
          <div className="group relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
            <div className="relative flex h-full w-full items-center justify-center bg-blue-100 text-4xl font-bold text-blue-600">
              {userData.nombre_usuario.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="mt-20 px-8 pb-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {userData.nombre_usuario}
            </h2>
            <p className="text-slate-500">{userData.correo}</p>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 sm:mt-0"
          >
            <FiLock size={16} />
            Cambiar contraseña
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-slate-200 bg-white px-6 py-4">
              <h3 className="font-medium text-slate-700">
                Información personal
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                  <FiUser size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Nombre</p>
                  <p className="font-medium text-slate-800">
                    {userData.nombre_usuario}
                  </p>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                  <FiMail size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Correo</p>
                  <p className="font-medium text-slate-800">
                    {userData.correo}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-slate-200 bg-white px-6 py-4">
              <h3 className="font-medium text-slate-700">
                Información laboral
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                  <FiBriefcase size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Cargo</p>
                  <p className="font-medium text-slate-800">{userData.cargo}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                  <FiShield size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Rol</p>
                  <p className="font-medium text-slate-800">{userData.rol}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password change modal */}
      {isPasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          userId={userData.id}
        />
      )}
    </div>
  );
}
