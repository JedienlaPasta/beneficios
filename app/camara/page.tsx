import {
  fetchEntregasGeneralInfoByFolio,
  fetchEntregasInfoByFolio,
  fetchFilesByFolio,
} from "@/app/lib/data/entregas";
import ModalEntregasDetail from "@/app/ui/dashboard/entregas/[id]/modal-entregas-detail";
import React, { lazy, Suspense } from "react";
// import { Modal } from "../ui/dashboard/modal";
import ModalSkeleton from "../ui/modal-skeleton";

const LazyModal = lazy(() =>
  import("../ui/dashboard/modal").then((module) => ({ default: module.Modal })),
);

export default async function Test() {
  const folio = "1-25-TA";
  const rut = "12345678";
  const [entregasResponse, entregaResponse, filesResponse] = await Promise.all([
    fetchEntregasGeneralInfoByFolio(folio),
    fetchEntregasInfoByFolio(folio),
    fetchFilesByFolio(folio),
  ]);

  const entregas = entregasResponse;
  const entrega = entregaResponse;
  const files = filesResponse;

  return (
    <div className="flex h-screen w-full flex-col gap-6">
      <Suspense fallback={<ModalSkeleton name="detailsModal" />}>
        <LazyModal name="detailsModal" secondName="rut">
          <ModalEntregasDetail
            rut={rut}
            folio={folio}
            entregas={entregas}
            entrega={entrega}
            files={files}
          />
        </LazyModal>
      </Suspense>
    </div>
  );
}
