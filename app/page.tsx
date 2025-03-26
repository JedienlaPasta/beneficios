// import { Suspense } from "react";
// import LoginForm from "@/app/ui/login-form";

// export default function LoginPage() {
//   return (
//     <main className="flex items-center justify-center bg-gray-200 md:h-screen">
//       <div className="flex w-full max-w-[360px] flex-col gap-5 rounded-lg bg-white px-8 py-12 md:-mt-32">
//         <div className="flex flex-col gap-1">
//           <h2 className="text-xl font-bold text-slate-700">Iniciar Sesión</h2>
//           <p className="text-sm font-normal text-slate-400">
//             Bienvenid@! ingresa tus credenciales.
//           </p>
//         </div>
//         <Suspense>
//           <LoginForm />
//         </Suspense>
//       </div>
//     </main>
//   );
// }

"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/ui/login-form";
import { SquaresLoader } from "./ui/dashboard/loaders";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        // First check localStorage
        const userSession = localStorage.getItem("userSession");

        if (userSession) {
          // Verify the session is valid by checking with the server
          const response = await fetch("/api/auth/check-session");
          const data = await response.json();

          if (data.authenticated) {
            router.push("/dashboard");
          } else {
            // If server says session is invalid, clear localStorage
            localStorage.removeItem("userSession");
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex items-center justify-center bg-gray-200 md:h-screen">
        <div className="relative w-full max-w-[360px] overflow-hidden rounded-xl border border-gray-200 bg-white px-8 py-10 shadow-lg md:-mt-32">
          <div className="flex flex-col gap-4 text-center">
            <h3 className="text-lg font-medium text-slate-700">
              Verificando sesión
            </h3>
            <SquaresLoader />
            <p className="animate-pulse text-sm text-slate-500">
              Por favor espere mientras lo redirigimos...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh min-h-screen items-center justify-center bg-gray-200 md:h-screen">
      <div className="flex w-full max-w-[360px] flex-col gap-5 rounded-lg bg-white px-8 py-12 md:-mt-32">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-slate-700">Iniciar Sesión</h2>
          <p className="text-sm font-normal text-slate-400">
            Bienvenid@! ingresa tus credenciales.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
