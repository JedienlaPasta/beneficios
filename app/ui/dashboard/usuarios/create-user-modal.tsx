"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SubmitButton } from "../submit-button";
import { createUser } from "@/app/lib/actions/usuarios";
import { UserManagementModal } from "../modal";
import RolDropdown from "./roles-dropdown";

export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [rol, setRol] = useState<string>("");

  // Add form validation state
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    cargo: "",
    password: "",
  });

  // Track form validity
  const [isFormValid, setIsFormValid] = useState(false);

  // Update form data when inputs change and validate form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    // Validate form directly here
    const { nombre, correo, cargo, password } = updatedFormData;
    const isValid =
      nombre.trim() !== "" &&
      correo.trim() !== "" &&
      cargo.trim() !== "" &&
      password.trim() !== "" &&
      rol.trim() !== "";

    setIsFormValid(isValid);
  };

  // We can remove the useEffect since validation happens in handleInputChange
  // But we need to handle rol changes separately
  const handleRolChange = (newRol: string) => {
    setRol(newRol);

    // Re-validate the form when rol changes
    const { nombre, correo, cargo, password } = formData;
    const isValid =
      nombre.trim() !== "" &&
      correo.trim() !== "" &&
      cargo.trim() !== "" &&
      password.trim() !== "" &&
      newRol.trim() !== "";

    setIsFormValid(isValid);
  };

  const formAction = async (formData: FormData) => {
    setIsDisabled(true);

    const toastId = toast.loading("Creando usuario...");
    try {
      const response = await createUser(formData);

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
    <UserManagementModal title="Crear Nuevo Usuario" onClose={onClose}>
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
            autoComplete="off"
            required
            placeholder="Nombre y apellido"
            className={inputStyle}
            value={formData.nombre}
            onChange={handleInputChange}
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
            autoComplete="off"
            required
            placeholder="usuario@correo.com"
            className={inputStyle}
            value={formData.correo}
            onChange={handleInputChange}
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
            autoComplete="off"
            required
            placeholder="Cargo funcionario"
            className={inputStyle}
            value={formData.cargo}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <RolDropdown
            label="Rol"
            name="rol"
            rol={rol}
            setRol={handleRolChange}
            placeHolder="Rol dentro de la plataforma"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-slate-500"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            placeholder="Contraseña"
            className={inputStyle}
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <SubmitButton isDisabled={isDisabled || !isFormValid}>
            {isDisabled ? "Guardando..." : "Crear Usuario"}
          </SubmitButton>
        </div>
      </form>
    </UserManagementModal>
  );
}
