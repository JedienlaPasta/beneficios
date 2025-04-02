import { InfoCardWrapper } from "./general-info-wrapper";
import { Suspense } from "react";
import { RSHRegistrosCount } from "./rsh-registros-count";
import { RSHLastUpdated } from "./rsh-last-updated";
import { RSHGeneralInfoSkeleton } from "./rsh-info-skeleton";

export default async function RSHGeneralInfo() {
  return (
    <div className="flex flex-wrap gap-6">
      <InfoCardWrapper modal="newcitizen">
        {/* Decorative gradient element */}
        <div className="absolute left-[calc(100%-1rem)] top-0 h-60 w-[20rem] bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-8rem)] group-hover:-rotate-[-25deg]"></div>

        {/* Card content */}
        <div className="z-10 flex items-center justify-between px-7 py-5">
          <div>
            <div className="flex items-center gap-4 pt-1 text-slate-700">
              <span className="flex flex-col items-start">
                <h5 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Ciudadanos Registrados
                </h5>
                <Suspense fallback={<RSHGeneralInfoSkeleton />}>
                  <RSHRegistrosCount />
                </Suspense>
              </span>
            </div>
          </div>
          <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-500 transition-all duration-500 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        </div>

        {/* Action label */}
        <div className="mt-auto border-t border-slate-100 px-7 py-3">
          <p className="text-sm font-medium text-slate-700 transition-colors duration-300 group-hover:text-blue-600">
            Nuevo Registro
          </p>
        </div>
      </InfoCardWrapper>

      <InfoCardWrapper modal="importxlsx">
        {/* Decorative gradient element */}
        <div className="absolute left-[calc(100%-1rem)] top-0 h-60 w-[20rem] bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-8rem)] group-hover:-rotate-[-25deg]"></div>

        {/* Card content */}
        <div className="z-10 flex items-center justify-between px-7 py-5">
          <div>
            <div className="flex items-center gap-4 pt-1 text-slate-700">
              <div className="flex flex-col items-start">
                <h5 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Última Actualización
                </h5>
                <Suspense fallback={<RSHGeneralInfoSkeleton />}>
                  <RSHLastUpdated />
                </Suspense>
              </div>
            </div>
          </div>
          <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-500 transition-all duration-500 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>
          </div>
        </div>

        {/* Action label */}
        <div className="mt-auto border-t border-slate-100 px-7 py-3">
          <p className="text-sm font-medium text-slate-700 transition-colors duration-300 group-hover:text-blue-600">
            Importar XLSX
          </p>
        </div>
      </InfoCardWrapper>
    </div>
  );
}
