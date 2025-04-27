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

  const entregas = entregasResponse.data[0];
  const entrega = entregaResponse.data;
  const files = filesResponse.data;

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
