"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "./dashboard/submit-button";
import { toast } from "sonner";

export default function LoginForm() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisabled(true);
    setError("");

    const toastId = toast.loading("Verificando...");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error en la respuesta del servidor");
      }

      toast.success(data.message, { id: toastId });
      // Store user session in localStorage for client-side access
      localStorage.setItem("userSession", JSON.stringify(data.user));
      // Set a cookie for server-side session validation
      document.cookie = `userSession=${encodeURIComponent(JSON.stringify(data.user))};path=/;max-age=86400`;

      router.push("/dashboard");

      // if (data.success) {
      //   // Store user session in localStorage for client-side access
      //   localStorage.setItem("userSession", JSON.stringify(data.user));

      //   // Set a cookie for server-side session validation
      //   document.cookie = `userSession=${encodeURIComponent(JSON.stringify(data.user))};path=/;max-age=86400`;

      //   router.push("/dashboard");
      // } else {
      //   setError(data.error || "Error al iniciar sesión");
      //   setIsDisabled(false);
      // }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(message, { id: toastId });
      console.error("Error durante el login:", error);
      setError(message);
      setIsDisabled(false);
    }
  };

  return (
    <div>
      <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
        <div
          className={`relative top-5 flex h-10 items-center gap-3 rounded-md border bg-white px-4 shadow-sm transition-all focus-within:border-blue-500 ${error ? "border-red-500" : "border-slate-300"}`}
        >
          <label
            htmlFor="email"
            className={`absolute left-0 top-[-1.25rem] text-xs ${error ? "text-red-500" : "text-slate-400"}`}
          >
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div
          className={`relative top-5 flex h-10 items-center gap-3 rounded-md border bg-white px-4 shadow-sm transition-all focus-within:border-blue-500 ${error ? "border-red-500" : "border-slate-300"}`}
        >
          <label
            htmlFor="password"
            className={`absolute left-0 top-[-1.25rem] text-xs ${error ? "text-red-500" : "text-slate-400"}`}
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        {error && (
          <div className="relative">
            <div className="absolute left-0 top-0 text-sm text-red-500">
              {error}
            </div>
          </div>
        )}
        <div className="mt-2 flex">
          <SubmitButton
            isDisabled={isDisabled || !email || !password}
            setIsDisabled={setIsDisabled}
          >
            {isDisabled ? "Verificando..." : "Iniciar sesión"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
