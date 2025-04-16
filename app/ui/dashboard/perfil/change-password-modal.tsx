"use client";

import { useState } from "react";
import { FiX, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

type ChangePasswordModalProps = {
  onClose: () => void;
  // userId: string;
};

export default function ChangePasswordModal({
  onClose,
  //  userId
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
    setError("");

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Here you would call your API to change the password
      // For example:
      // const response = await fetch('/api/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, currentPassword, newPassword })
      // });

      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || 'Error al cambiar la contraseña');
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar la contraseña",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-medium text-slate-800">
            Cambiar contraseña
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {success ? (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
              Contraseña actualizada correctamente.
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Contraseña actual
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiLock className="text-slate-400" size={16} />
                  </div>
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 pl-10 pr-10 text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-500"
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
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiLock className="text-slate-400" size={16} />
                  </div>
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 pl-10 pr-10 text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-500"
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

              <div className="mb-6">
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiLock className="text-slate-400" size={16} />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 pl-10 pr-10 text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-500"
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              disabled={loading || success}
            >
              Cancelar
            </button>
            {!success && (
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
