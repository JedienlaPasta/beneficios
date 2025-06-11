"use client";

import { changePassword } from "@/app/lib/actions/perfil";
import { useState } from "react";
import { FiX, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";

type ChangePasswordModalProps = {
  onClose: () => void;
  userId: string;
};

export default function ChangePasswordModal({
  onClose,
  userId,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError("");

    setLoading(true);

    const myFormData = new FormData();
    myFormData.append("currentPassword", currentPassword);
    myFormData.append("newPassword", newPassword);
    myFormData.append("confirmPassword", confirmPassword);

    const toastId = toast.loading("Guardando...");
    try {
      const response = await changePassword(userId, myFormData);
      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success(response.message, { id: toastId });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(message, { id: toastId });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-[400px] overflow-hidden rounded-lg bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-slate-700">
            Cambiar Contraseña
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          {success ? (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
              Contraseña actualizada correctamente.
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="current-password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Contraseña actual
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full rounded-md border border-slate-200 p-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="new-password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-md border border-slate-200 p-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ingresa tu nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-7">
                <label
                  htmlFor="confirm-password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border border-slate-200 p-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Confirma tu nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
              disabled={loading || success}
            >
              {loading
                ? "Guardando..."
                : success
                  ? "Cancelar"
                  : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
