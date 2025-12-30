import { Suspense } from "react";
import { Modal } from "../../Modal";
import Pagination from "../../Pagination";
import TableRow from "./EntregasTableRow";

type Props = {
  rut: string;
  query: string;
  currentPage: number;
  isModalOpen: boolean;
};

// Update the EntregasTable component to fetch its own data
import { fetchEntregasByRUT } from "@/app/lib/data/entregas";
import ModalSkeleton from "@/app/ui/modal-skeleton";
import NewEntregaModalContext from "../new-entrega-modal/NewEntregaModalContext";

export default async function EntregasTable({
  rut,
  query,
  currentPage,
  isModalOpen,
}: Props) {
  const entregasData = await fetchEntregasByRUT(rut, query, currentPage, 10);
  const { data, pages } = entregasData;

  return (
    <>
      {isModalOpen && (
        <Modal name="newsocialaid">
          <Suspense fallback={<ModalSkeleton name="newsocialaid" />}>
            <NewEntregaModalContext rut={rut} />
          </Suspense>
        </Modal>
      )}
      <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse">
            <thead className="border-y border-slate-200/80 bg-slate-50 text-xs uppercase tracking-wider text-slate-600/70">
              <tr className="grid min-w-[1000px] grid-cols-26 items-center gap-4 px-5 text-left md:px-6">
                <th className="col-span-6 py-4 font-normal">Folio</th>
                <th className="col-span-9 py-4 font-normal">Encargado</th>
                <th className="col-span-4 py-4 text-right font-normal">
                  Documentos
                </th>
                <th className="col-span-3 py-4 font-normal">Estado</th>
                <th className="col-span-4 py-4 text-right font-normal">
                  Entrega
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {data?.map((item, index: number) => (
                <TableRow key={index} item={item} />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pages={pages} />
      </div>
    </>
  );
}
