import { FiBox } from "react-icons/fi";
import NewButton from "./new-button";

export default function RSHGeneralInfo() {
  return (
    <div className="group relative flex min-w-64 flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300 transition-all hover:shadow-lg hover:shadow-slate-400/40">
      {/* <div className="z-1 absolute left-[calc(100%-1rem)] top-0 h-60 w-[20rem] bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-8rem)] group-hover:-rotate-[-25deg]"></div> */}
      <div className="z-10 flex flex-wrap items-center justify-between px-7 py-6">
        <div>
          <h3 className="text-sm font-medium text-slate-600">
            Ciudadanos Registrados
          </h3>
          <div className="flex items-center justify-start gap-2 pt-1 text-slate-700">
            <p className="text-2xl font-bold">1.429</p>
            <FiBox className="text-2xl text-blue-500" />
          </div>
        </div>
        <NewButton>Ingresar</NewButton>
      </div>
    </div>
  );
}
