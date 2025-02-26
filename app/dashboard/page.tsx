import DatosGenerales from "@/app/ui/dashboard/inicio/datos-generales";
import TablaDatosDashboard from "@/app/ui/dashboard/tabla-datos-dashboard";
import TableroEntregasInicio from "../ui/dashboard/inicio/entregas-inicio";
export default function DashboardPage() {
  return (
    <div className="w-full px-6 py-8 text-slate-900 lg:px-10">
      {/* {abrirModal && <NuevaCampañaModal closeModal={toggleModal} />} */}
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Inicio</h2>
          <p className="text-sm text-slate-600/70">
            Datos generales y actividades personales.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <DatosGenerales />
        <div className="flex flex-col gap-4 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-800">
            Actividad de Entregas
          </h2>
          <TableroEntregasInicio />
        </div>
        <TablaDatosDashboard />
      </div>
    </div>
  );
}
