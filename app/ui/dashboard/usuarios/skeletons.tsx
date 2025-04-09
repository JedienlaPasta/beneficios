// Add this to your existing skeletons.tsx file

// Update the UserTableSkeleton to include the estado column

export function UserTableSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <div className="h-5 w-32 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-40 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200"></div>
                </td>
                <td className="px-4 py-3 text-right">
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