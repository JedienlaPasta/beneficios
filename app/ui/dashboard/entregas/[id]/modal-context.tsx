import {
  fetchFilesByFolio,
  fetchEntregasGeneralInfoByFolio,
  fetchEntregasInfoByFolio,
} from "@/app/lib/data/entregas";
import ModalEntregasDetail from "./modal-entregas-detail";

type ModalContextProps = {
  folio: string;
  rut: string;
};

export default async function ModalEntregasDetailContext({
  folio,
  rut,
}: ModalContextProps) {
  // Option 1: Keep fetching here but add Suspense for better UX
  const [entregasResponse, entregaResponse, filesResponse] = await Promise.all([
    fetchEntregasGeneralInfoByFolio(folio),
    fetchEntregasInfoByFolio(folio),
    fetchFilesByFolio(folio),
  ]);

  const entregas = entregasResponse.data[0];
  const entrega = entregaResponse.data;
  const files = filesResponse.data;

  return (
    <div className="flex h-full items-start justify-center">
      <div className="relative top-[5%]">
        <ModalEntregasDetail
          rut={rut}
          folio={folio}
          entregas={entregas}
          entrega={entrega}
          files={files}
        />
      </div>
    </div>
  );
}
