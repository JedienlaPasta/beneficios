"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SubmitButton } from "../submit-button";
import { User } from "@/app/lib/data/users";
import { updateUser } from "@/app/lib/actions/usuarios";
import { UserManagementModal } from "../modal";
import RolDropdown from "./roles-dropdown";

type EditUserModalProps = {
  user: User;
  onClose: () => void;
};

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [rol, setRol] = useState<string>("");

  const formAction = async (formData: FormData) => {
    setIsDisabled(true);

    const toastId = toast.loading("Actualizando usuario...");
    try {
      const response = await updateUser(user.id, formData);
      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success(response.message, { id: toastId });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(message, { id: toastId });
      setIsDisabled(false);
    }
  };

  const inputStyle =
    "mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none";

  return (
    <UserManagementModal title="Editar Usuario" onClose={onClose}>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="nombre"
            className="block text-xs font-medium text-slate-500"
          >
            Nombre Completo
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            defaultValue={user.nombre_usuario}
            autoComplete="off"
            required
            placeholder="Nombre y apellido"
            className={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor="correo"
            className="block text-xs font-medium text-slate-500"
          >
            Correo Electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            defaultValue={user.correo}
            autoComplete="off"
            required
            placeholder="usuario@correo.com"
            className={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor="cargo"
            className="block text-xs font-medium text-slate-500"
          >
            Cargo
          </label>
          <input
            type="text"
            id="cargo"
            name="cargo"
            defaultValue={user.cargo}
            autoComplete="off"
            placeholder="Cargo funcionario"
            required
            className={inputStyle}
          />
        </div>

        <div>
          <RolDropdown
            label="Rol"
            name="rol"
            rol={rol}
            setRol={setRol}
            placeHolder="Rol dentro de la plataforma"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-slate-500"
          >
            Nueva Contraseña (dejar en blanco para mantener la actual)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={inputStyle}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <SubmitButton isDisabled={isDisabled} setIsDisabled={setIsDisabled}>
            Guardar Cambios
          </SubmitButton>
        </div>
      </form>
    </UserManagementModal>
  );
}
