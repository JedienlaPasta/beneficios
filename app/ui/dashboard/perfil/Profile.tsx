"use client";
import { useState } from "react";
import { FiBriefcase, FiMail, FiShield, FiUser, FiLock } from "react-icons/fi";
import ChangePasswordModal from "./ChangePasswordModal";

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
    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5">
      {/* Header with background pattern */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute -bottom-16 left-8 flex items-end">
          <div className="group relative h-32 w-32 overflow-hidden rounded-full border-[6px] border-white bg-white shadow-xl ring-1 ring-slate-900/5">
            {userData.profilePicture ? (
              <img
                src={userData.profilePicture}
                alt={userData.nombre_usuario}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-4xl font-bold text-blue-600">
                {userData.nombre_usuario.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User info header */}
      <div className="mt-20 px-8 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {userData.nombre_usuario}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                <FiBriefcase className="h-4 w-4" />
                {userData.cargo}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                <FiShield className="h-4 w-4" />
                {userData.rol}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-slate-500">
              <FiMail className="h-4 w-4" />
              {userData.correo}
            </p>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 transition-all hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-400 active:scale-95"
          >
            <FiLock className="text-slate-400 transition-colors group-hover:text-slate-600" />
            Cambiar contraseña
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50/50 px-8 py-8">
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Detalles de la Cuenta
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-600/10">
                <FiUser size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Nombre Completo
                </p>
                <p className="font-semibold text-slate-900">
                  {userData.nombre_usuario}
                </p>
              </div>
            </div>
          </div>

          {/* Email Info Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600/10">
                <FiMail size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Correo Electrónico
                </p>
                <p className="font-semibold text-slate-900">
                  {userData.correo}
                </p>
              </div>
            </div>
          </div>

          {/* Role Info Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-600/10">
                <FiShield size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Rol de Sistema
                </p>
                <p className="font-semibold text-slate-900">{userData.rol}</p>
              </div>
            </div>
          </div>

          {/* Cargo Info Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
                <FiBriefcase size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Cargo / Departamento
                </p>
                <p className="font-semibold text-slate-900">{userData.cargo}</p>
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
