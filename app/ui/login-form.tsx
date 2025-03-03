import SubmitButton from "./submit-button";

export default function LoginForm() {
  return (
    <form className="flex flex-col gap-10">
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
          autoComplete="off"
          placeholder="tu@empresa.com"
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <div className="relative top-5 flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500">
        <label
          htmlFor="Contraseña"
          className="absolute left-0 top-[-1.25rem] text-xs text-slate-400"
        >
          Contraseña
        </label>
        <input
          id="Contraseña"
          name="Contraseña"
          autoComplete="off"
          placeholder="Contraseña"
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <div className="mt-3 flex">
        <SubmitButton disabled={true} />
      </div>
    </form>
  );
}
