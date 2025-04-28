// Add this to your existing skeletons.tsx file

// Update the UserTableSkeleton to include the estado column

export function UserTableSkeleton() {
  const thStyle =
    "whitespace-nowrap  py-4 text-left text-xs font-normal uppercase tracking-wide";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-300/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[60rem] border-collapse divide-y divide-slate-200 text-sm">
          <thead className="text-slate-600/70">
            <tr className="grid grid-cols-26 bg-slate-50 px-6 pt-2">
              <th scope="col" className={`${thStyle} col-span-5`}>
                Nombre
              </th>
              <th scope="col" className={`${thStyle} col-span-6`}>
                Correo
              </th>
              <th scope="col" className={`${thStyle} col-span-5`}>
                Cargo
              </th>
              <th scope="col" className={`${thStyle} col-span-3`}>
                Rol
              </th>
              <th scope="col" className={`${thStyle} col-span-3`}>
                Estado
              </th>
              <th scope="col" className={`${thStyle} col-span-4 text-right`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white">
            {[...Array(5)].map((_, i) => (
              <tr
                key={i}
                className="group grid grid-cols-26 items-center gap-8 text-nowrap px-6 text-sm transition-colors hover:bg-slate-200/50"
              >
                <td className="col-span-5 whitespace-nowrap py-4 font-medium text-slate-700">
                  <div className="h-5 w-32 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="col-span-6 whitespace-nowrap py-4 text-slate-600">
                  <div className="h-5 w-40 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="col-span-5 whitespace-nowrap py-4 text-slate-600">
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="col-span-3 whitespace-nowrap py-4">
                  <div className="h-5 w-20 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="col-span-3 whitespace-nowrap py-4">
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="col-span-4 whitespace-nowrap py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 animate-pulse rounded bg-slate-200"></div>
                    <div className="h-8 w-8 animate-pulse rounded bg-slate-200"></div>
                    <div className="h-8 w-8 animate-pulse rounded bg-slate-200"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 h-7 w-48 animate-pulse rounded bg-slate-200"></div>
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded bg-slate-100"></div>
          <div className="h-10 animate-pulse rounded bg-slate-100"></div>
          <div className="h-10 animate-pulse rounded bg-slate-100"></div>
          <div className="flex justify-end gap-2">
            <div className="h-10 w-24 animate-pulse rounded bg-slate-200"></div>
            <div className="h-10 w-24 animate-pulse rounded bg-blue-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserFormSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-6 w-32 animate-pulse rounded bg-slate-200"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
            <div className="h-10 w-full animate-pulse rounded bg-slate-100"></div>
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <div className="h-10 w-32 animate-pulse rounded bg-blue-200"></div>
        </div>
      </div>
    </div>
  );
}
