"use client";

export function CampaignDetailSkeleton() {
  return (
    <div className="items-centers relative flex flex-col justify-center">
      <div className="grid gap-4 rounded-xl">
        {/* Header Section */}
        <div className="flex items-center justify-between rounded-xl bg-white px-10 py-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br from-blue-200 to-blue-300 text-base font-medium text-white shadow-sm">
              ##
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="h-7 w-48 animate-pulse rounded-md bg-slate-200"></div>
                <div
                  className={`h-4 w-16 animate-pulse rounded-md bg-slate-200`}
                ></div>
              </div>
              <div className="mt-1 h-5 w-32 animate-pulse rounded-md bg-slate-200"></div>
            </div>
          </div>
          <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200"></div>
        </div>

        {/* Details Grid */}
        <div className="mt-2 grid auto-rows-fr gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información General
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* ID */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Inicio */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Término */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
            </div>
          </div>
          {/* 2nd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Criterios de Entrega
            </h2>
            <div className="flex flex-col gap-2 rounded-xl px-6 py-2">
              {/* Skeleton requirement cards */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div>
                    <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  </div>
                  <div className="h-5 w-32 animate-pulse rounded-md bg-slate-200"></div>
                </div>
              ))}
            </div>
          </div>
          {/* 3rd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100 xl:col-span-2 2xl:col-span-1">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Resumen
            </h2>
            <div className="flex flex-col gap-2 rounded-xl px-6 py-2">
              {/* Skeleton summary cards */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-5"
                >
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-12 animate-pulse rounded-md bg-slate-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
