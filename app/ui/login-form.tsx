"use client";
import { loginAction } from "@/app/lib/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { SubmitButton } from "./dashboard/SubmitButton";

export default function LoginForm() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const formAction = async (formData: FormData) => {
    setIsDisabled(true);

    const toastId = toast.loading("Iniciando sesión...");
    try {
      const response = await loginAction(formData);
      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success(response.message, { id: toastId });
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      toast.error(message, { id: toastId });
      setIsDisabled(false);
      setError(message);
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Tus campos de formulario */}
      <div>
        <label
          htmlFor="email"
          className={`block text-xs ${error ? "text-red-500" : "text-slate-400"}`}
        >
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          name="correo"
          autoComplete="email"
          required
          placeholder="tu@empresa.com"
          className={`mt-1 block h-11 w-full rounded-md border px-3 py-2 text-sm outline-none ${error ? "border-red-500" : "border-gray-300 focus:border-blue-400"}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className={`block text-xs ${error ? "text-red-500" : "text-slate-400"}`}
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="contraseña"
            autoComplete="current-password"
            required
            placeholder="Contraseña"
            className={`mt-1 block h-11 w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none ${error ? "border-red-500" : "border-gray-300 focus:border-blue-400"}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="relative">
          <div className="absolute left-0 top-0 text-sm text-red-500">
            {error}
          </div>
        </div>
      )}
      <div className="mt-2 flex">
        <SubmitButton isDisabled={isDisabled || !email || !password}>
          {isDisabled ? "Verificando..." : "Iniciar sesión"}
        </SubmitButton>
      </div>
    </form>
  );
}
