import { EntregasFiles } from "@/app/lib/definitions";
import React from "react";
import GetNewFileButton from "./NewFileButton";
import Files from "./Files";

export default function FilesList({
  folio,
  files,
}: {
  folio: string;
  files: EntregasFiles[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          Documentos Adjuntos
        </h3>
        <GetNewFileButton folio={folio} />
      </div>

      {files.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:grid-cols-2">
          {files.map((item: EntregasFiles, index) => (
            <Files key={index} item={item} folio={folio} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-sm text-gray-400">
          <svg
            className="h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No hay documentos adjuntos</p>
        </div>
      )}
    </div>
  );
}
