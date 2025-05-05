export default function CampaignEntregasTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem]">
        <thead className="border-y border-slate-200/70 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600/70">
          <tr>
            <th className="py-4 pl-10 pr-6 text-left font-normal">Folio</th>
            <th className="py-4 pl-10 pr-6 font-normal">Beneficiario</th>
            <th className="py-4 pl-10 pr-6 font-normal"></th>
            <th className="py-4 pr-14 text-right font-normal">RUT</th>
            <th className="py-4 pr-14 text-right font-normal">Entrega</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/30">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </tbody>
      </table>
      {/* <Pagination paginas={paginas} /> */}
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="w-[10%] py-3 pl-10 pr-6 font-medium text-slate-700">
        <div className="flex gap-3">
          <div className="h-7 w-7 animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-7 w-40 grow animate-pulse rounded-md bg-gray-200"></div>
        </div>
      </td>
      <td className="w-[30%] py-3 pl-10 pr-6 text-slate-600">
        <div className="h-7 w-40 grow animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="w-[30%] py-3 pl-10 pr-6 text-slate-600">
        {/* <div className="ml-auto h-7 w-32 animate-pulse rounded-md bg-gray-200"></div> */}
      </td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">
        <div className="ml-auto h-7 w-32 animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="flex w-[15%] justify-start py-3 pr-14 text-right text-slate-600">
        <div className="h-7 w-28 shrink-0 animate-pulse rounded-md bg-gray-200"></div>
      </td>
    </tr>
  );
}
