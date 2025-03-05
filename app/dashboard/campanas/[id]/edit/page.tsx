import { fetchCampaignById } from "@/app/lib/data";
import Input from "@/app/ui/dashboard/campañas/nueva-campaña-input";
import { Toaster } from "sonner";

export default async function UpdateCampaign(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const { data } = await fetchCampaignById(id);
  console.log(data);

  return (
    <div className="h-fit w-full px-6 py-8 text-slate-900 lg:px-10">
      <Toaster />
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            Actualizar Campaña
          </h2>
          <p className="text-sm text-slate-600/70">
            Gestionar datos de campaña y sus entregas asociadas.
          </p>
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-gray-200 bg-white p-6">
        <span className="flex items-center gap-1">
          <p className="font-medium text-slate-800">ID</p>
          <p className="text-sm font-medium text-blue-500">#{id}</p>
        </span>
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-sm text-white">
            {data[0].descripcion}
          </span>
          <p className="text-lg font-medium tracking-tight text-slate-800">
            {data[0].nombre}
          </p>
        </span>
        <form className="mt-5 grid grid-cols-2 gap-5 bg-white">
          <div className="col-span-2 flex gap-3">
            <RequirementsCard>Tramo</RequirementsCard>
            <RequirementsCard>Discapacidad</RequirementsCard>
            <RequirementsCard>Adulto Mayor</RequirementsCard>
            <RequirementsCard>Grupo Familiar</RequirementsCard>
          </div>
          <Input
            label="Nombre"
            nombre="nombre"
            defaultValue={data[0].nombre}
            type="text"
          />
          <Input
            label="Estado"
            nombre="estado"
            defaultValue={data[0].estado}
            type="text"
          />
          <Input
            label="Inicio"
            nombre="inicio"
            defaultValue={data[0].fecha_inicio.toString()}
            type="date"
          />
          <Input
            label="Termino"
            nombre="termino"
            defaultValue={data[0].fecha_termino.toString()}
            type="text"
          />
        </form>
      </div>
    </div>
  );
}

function RequirementsCard({ children }: { children: string }) {
  return (
    <div className="relative flex w-60 grow flex-col rounded-md border border-gray-100 bg-slate-100 px-6 py-5">
      <p className="text-xs uppercase tracking-wider text-slate-400">
        {children}
      </p>
    </div>
  );
}
