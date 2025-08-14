import { Suspense } from "react";
import { Modal } from "../../modal";
import Pagination from "../../pagination";
import TableRow from "./entregas-table-row";

type Props = {
  rut: string;
  query: string;
  currentPage: number;
  isModalOpen: boolean;
};

// Update the EntregasTable component to fetch its own data
import { fetchEntregasByRUT } from "@/app/lib/data/entregas";
import ModalSkeleton from "@/app/ui/modal-skeleton";
import NewEntregaModalContext from "../modal-context";

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
          <table className="w-full min-w-[44rem]">
            <thead className="border-y border-slate-200/70 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-600/70">
              <tr className="grid grid-cols-26 gap-8 px-5 md:px-8">
                <th className="col-span-7 py-4 text-left font-normal">Folio</th>
                <th className="col-span-10 py-4 text-left font-normal">
                  Encargado
                </th>
                <th className="col-span-5 py-4 font-normal">Documentos</th>
                <th className="col-span-4 py-4 text-right font-normal">
                  Entrega
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/30">
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
