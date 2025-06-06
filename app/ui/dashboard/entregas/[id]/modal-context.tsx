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
  const [entregasResponse, entregaResponse, filesResponse] = await Promise.all([
    fetchEntregasGeneralInfoByFolio(folio),
    fetchEntregasInfoByFolio(folio),
    fetchFilesByFolio(folio),
  ]);

  const entregas = entregasResponse;
  const entrega = entregaResponse;
  const files = filesResponse;

  return (
    <ModalEntregasDetail
      rut={rut}
      folio={folio}
      entregas={entregas}
      entrega={entrega}
      files={files}
    />
  );
}
