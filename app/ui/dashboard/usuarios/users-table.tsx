"use client";

import { User } from "@/app/lib/data/users";
import { useState } from "react";
import { FiEdit2, FiTrash2, FiUserCheck, FiUserX } from "react-icons/fi";
import { EditUserModal } from "./edit-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { toggleUserStatus } from "@/app/lib/actions/usuarios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function UsersTable({ users }: { users: User[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleStatus = async (user: User) => {
    setIsProcessing(user.id);

    const newStatus =
      user.estado === "Habilitado" ? "Deshabilitado" : "Habilitado";
    user.estado = newStatus;
    const toastId = toast.loading("Cambiando estado del usuario...");
    try {
      const response = await toggleUserStatus(user.id, newStatus);
      if (!response.success) {
        throw new Error("Error al cambiar el estado del usuario");
      }
      toast.success(response.message, { id: toastId });
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(message, { id: toastId });
    } finally {
      setIsProcessing(null);
    }
  };

  const thStyle =
    "whitespace-nowrap  py-5 text-left text-xs font-normal uppercase tracking-wide";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-300/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[60rem] border-collapse divide-y divide-slate-200 text-sm">
          <thead className="text-slate-600/70">
            <tr className="grid grid-cols-26 gap-8 bg-slate-50 px-6 pt-2">
              <th scope="col" className={`${thStyle} col-span-5`}>
                Nombre
              </th>
              <th scope="col" className={`${thStyle} col-span-6`}>
                Correo
              </th>
              <th scope="col" className={`${thStyle} col-span-5`}>
                Cargo
              </th>
              <th scope="col" className={`${thStyle} col-span-3`}>
                Rol
              </th>
              <th scope="col" className={`${thStyle} col-span-3`}>
                Estado
              </th>
              <th scope="col" className={`${thStyle} col-span-4 text-right`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white">
            {users.map((user) => (
              <tr
                key={user.id}
                className="group grid grid-cols-26 items-center gap-8 text-nowrap px-6 text-sm transition-colors hover:bg-slate-200/50"
              >
                <td className="col-span-5 whitespace-nowrap py-4 font-medium text-slate-700">
                  {user.nombre_usuario}
                </td>
                <td className="col-span-6 whitespace-nowrap py-4 text-slate-500">
                  {user.correo}
                </td>
                <td className="col-span-5 whitespace-nowrap py-4 text-slate-500">
                  {user.cargo}
                </td>
                <td className="col-span-3 whitespace-nowrap py-4">
                  <span
                    className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${
                      user.rol === "Administrador"
                        ? "bg-purple-100 text-purple-600"
                        : user.rol === "Supervisor"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {user.rol}
                  </span>
                </td>
                <td className="col-span-3 whitespace-nowrap py-4">
                  <span
                    className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${
                      user.estado === "Habilitado"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.estado}
                  </span>
                </td>
                <td className="col-span-4 whitespace-nowrap text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                      title="Editar usuario"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={isProcessing === user.id}
                      className={`rounded-md p-1.5 transition-colors ${
                        isProcessing === user.id
                          ? "cursor-not-allowed text-slate-300"
                          : "text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                      }`}
                      title={
                        user.estado === "Habilitado"
                          ? "Deshabilitar usuario"
                          : "Habilitar usuario"
                      }
                    >
                      {user.estado === "Habilitado" ? (
                        <FiUserX className="h-4 w-4" />
                      ) : (
                        <FiUserCheck className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setDeletingUser(user)}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                      title="Eliminar usuario"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-sm text-slate-500"
                >
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals remain unchanged */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}
