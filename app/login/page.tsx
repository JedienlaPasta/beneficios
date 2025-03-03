import { Suspense } from "react";
import LoginForm from "../ui/login-form";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center bg-gray-200 md:h-screen">
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
