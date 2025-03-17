// "use client";
// import Link from "next/link";
// import { SubmitButton } from "./dashboard/submit-button";
// import { useState } from "react";

// export default function LoginForm() {
//   const [isDisabled, setIsDisabled] = useState(false);

//   return (
//     <form className="flex flex-col gap-10">
//       <div className="relative top-5 flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500">
//         <label
//           htmlFor="email"
//           className="absolute left-0 top-[-1.25rem] text-xs text-slate-400"
//         >
//           Correo
//         </label>
//         <input
//           id="email"
//           name="email"
//           autoComplete="off"
//           placeholder="tu@empresa.com"
//           className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
//         />
//       </div>
//       <div className="relative top-5 flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500">
//         <label
//           htmlFor="Contraseña"
//           className="absolute left-0 top-[-1.25rem] text-xs text-slate-400"
//         >
//           Contraseña
//         </label>
//         <input
//           id="Contraseña"
//           name="Contraseña"
//           autoComplete="off"
//           placeholder="Contraseña"
//           className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
//         />
//       </div>
//       <Link href={"/dashboard"} className="mt-3 flex">
//         <SubmitButton isDisabled={isDisabled} setIsDisabled={setIsDisabled}>
//           Verificando...
//         </SubmitButton>
//       </Link>
//     </form>
//   );
// }

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "./dashboard/submit-button";

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

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user session in localStorage for client-side access
        localStorage.setItem("userSession", JSON.stringify(data.user));

        // Set a cookie for server-side session validation
        document.cookie = `userSession=${encodeURIComponent(JSON.stringify(data.user))};path=/;max-age=86400`;

        router.push("/dashboard");
      } else {
        setError(data.error || "Error al iniciar sesión");
        setIsDisabled(false);
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      setError("Error de conexión");
      setIsDisabled(false);
    }
  };

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
          {error}
        </div>
      )}
      <div className="relative top-5 flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500">
        <label
          htmlFor="email"
          className="absolute left-0 top-[-1.25rem] text-xs text-slate-400"
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
      <div className="relative top-5 flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500">
        <label
          htmlFor="password"
          className="absolute left-0 top-[-1.25rem] text-xs text-slate-400"
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
      <div className="mt-3 flex">
        <SubmitButton isDisabled={isDisabled} setIsDisabled={setIsDisabled}>
          {isDisabled ? "Verificando..." : "Iniciar sesión"}
        </SubmitButton>
      </div>
    </form>
  );
}
