import {
  fetchFilesByFolio,
  fetchSocialAidsGeneralInfoByFolio,
  fetchSocialAidsInfoByFolio,
} from "@/app/lib/data/entregas";
import ModalEntregasDetail from "./modal-entregas-detail";

type ModalContextProps = {
  folio: string;
};

export default async function ModalEntregasDetailContext({
  folio,
}: ModalContextProps) {
  const entregasResponse = await fetchSocialAidsGeneralInfoByFolio(folio);
  const entregaResponse = await fetchSocialAidsInfoByFolio(folio);
  const filesResponse = await fetchFilesByFolio(folio);

  const entregas = entregasResponse.data[0];
  const entrega = entregaResponse.data;
  const files = filesResponse.data;

  return (
    <div className="flex h-full items-center justify-center">
      <ModalEntregasDetail
        folio={folio}
        entregas={entregas}
        entrega={entrega}
        files={files}
      />
    </div>
  );
}
