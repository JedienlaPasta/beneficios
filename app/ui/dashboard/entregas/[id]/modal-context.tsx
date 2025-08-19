import {
  fetchFilesByFolio,
  fetchEntregasGeneralInfoByFolio,
  fetchEntregasInfoByFolio,
} from "@/app/lib/data/entregas";
import ModalEntregasDetail from "./modal-entregas-detail";
import EditJustificationModal from "./edit-justification-modal";

type ModalContextProps = {
  folio: string;
  rut: string;
  isOnEditForJustification?: boolean;
};

export default async function ModalEntregasDetailContext({
  folio,
  rut,
  isOnEditForJustification,
}: ModalContextProps) {
  const [entregasResponse, entregaResponse, filesResponse] = await Promise.all([
    fetchEntregasGeneralInfoByFolio(folio),
    fetchEntregasInfoByFolio(folio),
    fetchFilesByFolio(folio),
  ]);

  const entregas = entregasResponse;
  const entrega = entregaResponse;
  const files = filesResponse;

  if (isOnEditForJustification) {
    return (
      <EditJustificationModal
        folio={folio}
        prevJustification={entregas.observacion}
      />
    );
  }

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
