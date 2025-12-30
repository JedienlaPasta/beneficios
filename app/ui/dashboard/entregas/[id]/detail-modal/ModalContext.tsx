import {
  fetchFilesByFolio,
  fetchEntregasGeneralInfoByFolio,
  fetchBeneficiosEntregadosByFolio,
} from "@/app/lib/data/entregas";
import ModalEntregasDetail from "./ModalEntregasDetail";
import EditJustificationModal from "../edit-modals/EditJustificationModal";
import EditSupervisorModal from "../edit-modals/EditSupervisorModal";

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
  const [entregasResponse, beneficiosEntregadosResponse, filesResponse] =
    await Promise.all([
      fetchEntregasGeneralInfoByFolio(folio),
      fetchBeneficiosEntregadosByFolio(folio),
      fetchFilesByFolio(folio),
    ]);

  const entregas = entregasResponse;
  const beneficiosEntregados = beneficiosEntregadosResponse;
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
      beneficiosEntregados={beneficiosEntregados}
      files={files}
    />
  );
}
