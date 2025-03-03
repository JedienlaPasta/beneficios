export default function TablaCampañasSkeleton() {
  return (
    <div className="overflow-x-auto rounded-b-xl bg-white shadow-sm">
      <table className="w-full min-w-[44rem]">
        <thead className="border-y border-slate-200/70 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-600/70">
          <tr>
            <th className="py-4 pl-10 pr-6 text-left font-normal">Campaña</th>
            <th className="py-4 pr-14 text-right font-normal">Inicio</th>
            <th className="py-4 pr-14 text-right font-normal">Término</th>
            <th className="px-6 py-4 text-left font-normal">Estado</th>
            <th className="py-4 pl-6 pr-10 text-right font-normal">Entregas</th>
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
      {/* <Pagination paginas={paginas} /> */}
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="cursor-pointer whitespace-nowrap text-sm transition-colors hover:bg-gray-200/90">
      <td className="flex gap-3 py-4 pl-10 pr-6">
        <div className="h-7 w-7 animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-7 w-40 grow animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="py-4 pr-14 text-right">
        <div className="ml-auto h-7 w-32 animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="py-4 pr-14 text-right">
        <div className="ml-auto h-7 w-32 animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-7 w-28 animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="py-4 pl-6 pr-10 text-right">
        <div className="ml-auto h-7 w-16 animate-pulse rounded-md bg-gray-200"></div>
      </td>
    </tr>
  );
}
