import {
  fetchFilesByFolio,
  fetchEntregasGeneralInfoByFolio,
  fetchEntregasInfoByFolio,
} from "@/app/lib/data/entregas";
import ModalEntregasDetail from "./modal-entregas-detail";
import EditJustificationModal from "./edit-justification-modal";
import EditSupervisorModal from "./edit-supervisor-modal";

type ModalContextProps = {
  folio: string;
  rut: string;
  isOnEditForJustification?: boolean;
  isOnEditForSupervisor?: boolean;
};

export default async function ModalEntregasDetailContext({
  folio,
  rut,
  isOnEditForJustification,
  isOnEditForSupervisor,
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

  if (isOnEditForSupervisor) {
    return (
      <EditSupervisorModal
        folio={folio}
        prevSupervisor={entregas.nombre_usuario}
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
