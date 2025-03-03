// import img from "@/public/user-sample-100x67.jpg";
// import Image from "next/image";
import { HiChevronDown } from "react-icons/hi2";

export default function PerfilUsuario() {
  return (
    <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-800">
      <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="flex h-full w-full items-center justify-center text-lg font-medium text-white">
          KM
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-200">Kristina Meyers</p>
        <p className="text-xs text-slate-400">Administrador</p>
      </div>
      <HiChevronDown className="h-5 w-5 text-slate-400" />
    </button>
  );
}
