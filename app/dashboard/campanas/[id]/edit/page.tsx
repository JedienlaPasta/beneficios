import NuevaCampañaModal from "@/app/ui/dashboard/campañas/nueva-campaña-modal";
import Modal from "@/app/ui/dashboard/modal";
import { Toaster } from "sonner";

type ActualizarCampañaProps = {
  searchParams?: Promise<{ modal?: string }>;
};

export default async function ActualizarCampaña(props: ActualizarCampañaProps) {
  const searchParams = await props.searchParams;
  const modal = searchParams?.modal || "";

  return (
    <div className="h-fit w-full px-6 py-8 text-slate-900 lg:px-10">
      {modal === "open" && (
        <Modal>
          <NuevaCampañaModal />
        </Modal>
      )}
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
    </div>
  );
}
