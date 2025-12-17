export default function EntregasTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse">
          <thead className="border-y border-slate-200/80 bg-slate-50 text-xs uppercase tracking-wider text-slate-600/70">
            <tr className="grid grid-cols-26 items-center gap-8 px-5 text-left md:px-8">
              <th className="col-span-4 py-4 font-normal">RUT</th>
              <th className="col-span-9 py-4 font-normal">Nombre</th>
              <th className="col-span-5 py-4 font-normal">Folio</th>
              <th className="col-span-4 py-4 font-normal">Documentos</th>
              <th className="col-span-4 py-4 text-right font-normal">
                Entrega
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </tbody>
        </table>
      </div>
      {/* <Pagination paginas={paginas} /> */}
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="grid grid-cols-26 gap-8 text-nowrap px-5 text-sm tabular-nums transition-colors hover:bg-slate-200/50 md:px-8">
      <td className="col-span-4 flex items-center py-3 text-slate-600">
        <div className="h-7 max-w-40 grow animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="col-span-9 py-3 text-slate-600">
        <div className="h-7 max-w-60 grow animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="col-span-5 py-3 text-slate-600">
        <div className="h-7 max-w-32 animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="col-span-4 py-3 text-slate-600">
        <div className="h-7 max-w-32 animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="col-span-4 py-3 text-right text-slate-600">
        <div className="h-7 max-w-28 animate-pulse rounded-md bg-gray-200"></div>
      </td>
    </tr>
  );
}
