export default function TablaActividadesSkeleton() {
  return (
    <div className="overflow-x-auto rounded-b-xl bg-white shadow-sm">
      <table className="w-full min-w-[44rem]">
        <thead className="border-y border-slate-200/70 bg-slate-50 text-xs font-medium tracking-wider text-slate-600/70">
          <tr>
            <th className="py-4 pl-10 pr-6 text-left font-normal">ACTIVIDAD</th>
            <th className="w-[10%] py-4 pr-14 text-right font-normal">FECHA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/30">
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
    <tr className="w-full cursor-pointer text-nowrap text-sm tabular-nums transition-colors hover:bg-gray-200/90">
      <td className="flex gap-3 whitespace-nowrap py-4 pl-10 pr-6">
        <div className="h-7 w-7 animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-7 w-full animate-pulse rounded-md bg-gray-200"></div>
      </td>
      <td className="whitespace-nowrap py-4 text-right">
        <div className="w- relative h-7 w-3/4 animate-pulse self-end rounded-md bg-gray-200"></div>
      </td>
    </tr>
  );
}
