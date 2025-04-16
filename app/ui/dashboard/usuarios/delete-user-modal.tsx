"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserManagementModal } from "../modal";
import { User } from "@/app/lib/data/users";
import { deleteUser } from "@/app/lib/actions/usuarios";

export function DeleteUserModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    const toastId = toast.loading("Eliminando usuario...");
    try {
      const response = await deleteUser(user.id);
      if (!response.success) {
        throw new Error("Error al eliminar el usuario");
      }

      toast.success(response.message, { id: toastId });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(message, { id: toastId });
      setIsDeleting(false);
    }
  };

  return (
    <UserManagementModal title="Eliminar Usuario" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg">
          <p className="text-sm text-slate-600">
            Esta acción no se puede deshacer. ¿Está seguro que desea eliminar
            este usuario?
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </UserManagementModal>
  );
}
