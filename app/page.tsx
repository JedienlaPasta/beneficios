"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/ui/login-form";
import { SquaresLoader } from "./ui/dashboard/loaders";
import Image from "next/image";
import { loginImages } from "@/public/login-images/quisco/index";
import sibasImg from "@/public/logo_S.svg";
import quiscoImg from "@/public/elquisco.svg";
import { anton_sc } from "./ui/fonts";
import { Toaster } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Move randomImage outside component or use useMemo to prevent recalculation on re-renders
  const currentImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * loginImages.length);
    return loginImages[randomIndex];
  }, []);

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
            return router.push("/dashboard");
          } else {
            // If server says session is invalid, clear localStorage
            localStorage.removeItem("userSession");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        // Use a shorter timeout for better UX
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300">
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm md:-mt-32">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">
                Verificando sesión
              </h3>
              <p className="animate-pulse text-sm text-slate-600">
                Por favor espere mientras lo redirigimos...
              </p>
            </div>
            <SquaresLoader />
          </div>
        </div>
      </main>
    );
  }

  // New Login Page Test
  return (
    <main className="relative flex h-svh overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200">
      <Toaster />
      {/* Animated background elements */}
      <div className="absolute -left-16 -top-16 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
      {/* <div className="absolute bottom-12 right-12 z-10 h-96 w-96 animate-pulse rounded-full bg-blue-600/10 blur-3xl"></div> */}
      <div className="absolute left-1/4 top-1/3 h-48 w-48 animate-pulse rounded-full bg-indigo-500/5 blur-2xl"></div>

      {/* Improved header with subtle glow */}
      <div className="absolute left-0 top-0 z-20 flex h-20 w-full items-center bg-gradient-to-r from-[#171a1f] to-[#1e2228] shadow-lg">
        <div className="flex w-full max-w-[32rem] items-center gap-1 px-8">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-blue-400/20 blur-sm"></div>
            <Image
              width={48}
              height={48}
              alt="SIBAS Logo"
              src={sibasImg}
              priority
              className="h-12 w-12 drop-shadow-lg"
            />
          </div>
          <div className="flex flex-col">
            <h1
              className={`${anton_sc.className} bg-gradient-to-br from-blue-100 via-slate-200 to-slate-500 bg-clip-text text-4xl tracking-wider text-transparent drop-shadow-md`}
            >
              IBAS
            </h1>
          </div>
        </div>
      </div>

      {/* Left side - Login form */}
      <div className="relative flex w-full flex-col items-center justify-center px-8 md:w-3/5 lg:w-2/5">
        <div className="w-full max-w-[30rem] overflow-hidden p-8 pb-4">
          <div className="mb-6 flex flex-col">
            <h1 className="mb-2 text-4xl font-bold text-slate-800">
              Bienvenido
            </h1>
            <p className="text-sm text-slate-500">
              Ingresa tu correo y contraseña para comenzar!
            </p>
          </div>

          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-lg bg-slate-100"></div>
            }
          >
            <LoginForm />
          </Suspense>

          {/* Decorative separator */}
          <div className="pt-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          </div>
        </div>
        <div className="py-3s flex items-center gap-1 px-4">
          <div
            className={`${anton_sc.className} text-md flex flex-col text-right leading-tight`}
          >
            <p className="text-blue-600">MUNICIPALIDAD</p>
            <p className="text-slate-600">EL QUISCO</p>
          </div>
          <Image
            width={70}
            // height={60}
            alt="El Quisco logo"
            src={quiscoImg}
            className="object-contain"
          />
        </div>
      </div>

      {/* Right side - Image with overlay */}
      <div className="relative hidden h-full w-2/5 md:block lg:w-3/5">
        {/* Gradient transitions */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-indigo-900/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/30"></div>

        <Image
          src={currentImage}
          alt="El Quisco"
          width={1400}
          height={1400}
          priority
          className="h-full w-full object-cover"
          quality={85} // Reduce quality slightly for smaller file size
          placeholder="blur" // Add blur placeholder while loading
          sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizing
        />

        {/* Improved content overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-12 text-white">
          <div className="max-w-lg">
            <h2 className="mb-3 bg-gradient-to-br from-slate-100 to-slate-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              <span>Plataforma </span>
              <span className={`${anton_sc.className}`}>SIBAS</span>
            </h2>
            <p className="max-w-md text-base font-light leading-relaxed text-slate-200">
              Sistema integrado de beneficios y asistencia social
            </p>
            <div className="mt-6 h-1 w-40 rounded-full bg-gradient-to-r from-blue-400 via-blue-300 to-sky-300"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
