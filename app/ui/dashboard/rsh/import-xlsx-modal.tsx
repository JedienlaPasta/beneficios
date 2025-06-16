"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { RiCloseLine } from "react-icons/ri";
import { SubmitButton } from "../submit-button";
import { importXLSXFile } from "@/app/lib/actions/rsh";
import xlsxImg from "@/public/xlsx.svg";
import Image from "next/image";
import { RiCloseCircleFill } from "react-icons/ri";
import { Spinner } from "../loaders";

export type FormState = {
  success?: boolean;
  message?: string;
};

export default function ImportXLSXModal({ name }: { name: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(name, "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const formAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    if (!selectedFile) {
      toast.error("No se ha seleccionado ningún archivo.");
      return;
    }

    const myFormData = new FormData();
    myFormData.append("file", selectedFile);

    const toastId = toast.loading("Procesando archivo Excel...");
    try {
      const response = await importXLSXFile(myFormData);
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message, { id: toastId });
      setTimeout(() => {
        closeModal();
      }, 500);
      // return response.message;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al cargar los datos";
      toast.error(message, { id: toastId });
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isExcelFile(file)) {
        setSelectedFile(file);
        toast.success("Archivo Excel recibido.");
      } else {
        toast.error("Solo se permiten archivos Excel (.xlsx, .xls)");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isExcelFile(file)) {
        setSelectedFile(file);
      } else {
        toast.error("Solo se permiten archivos Excel (.xlsx, .xls)");
      }
    }
  };

  // Helper function to check if file is Excel
  const isExcelFile = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    return validTypes.includes(file.type);
  };

  return (
    <div className="grid max-h-dvh max-w-[30rem] shrink-0 flex-col gap-4 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Importar Registro Social de Hogares
          </h2>
          <RiCloseLine
            className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
            onClick={closeModal}
          />
        </div>
        <p className="text-xs text-gray-500">
          Selecciona el archivo Excel que deseas importar.
        </p>
      </div>
      <form onSubmit={formAction} className="flex flex-col gap-2">
        <div
          className="flex h-40 grow flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-400/60"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {isLoading ? (
            <>
              {/* <Loader /> */}
              <Spinner />
              <p className="mt-1 text-xs text-slate-500">
                Esto puede tardar 1 minuto...
              </p>
            </>
          ) : (
            <>
              <p className="text font-medium text-slate-700">
                Suelta aquí tu archivo
              </p>
              <input
                type="file"
                id="fileInput"
                name="file"
                className="hidden"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer text-xs text-slate-500"
              >
                Seleccionar archivo Excel
              </label>
            </>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Solo archivos Excel (.xlsx, .xls)
        </p>

        {/* Import Status */}
        {selectedFile ? (
          <div className="flex flex-col gap-2">
            <span className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-4 py-3">
              <span className="flex items-center justify-between gap-2">
                <Image className="h-6 w-6" src={xlsxImg} alt="xlsx.img" />
                <p className="text-sm text-slate-600">{selectedFile.name}</p>
              </span>
              {isLoading && (
                <p className="h-3 w-3 shrink-0 grow-0 animate-pulse rounded-full bg-blue-500 text-sm text-slate-600"></p>
              )}
              {!isLoading && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="rounded-full"
                >
                  <RiCloseCircleFill className="bg-slate-400s h-5 w-5 cursor-pointer rounded-full text-slate-500 hover:text-slate-600" />
                </button>
              )}
            </span>
          </div>
        ) : null}

        <div className="flex pt-3">
          <SubmitButton
            isDisabled={isDisabled || !selectedFile}
            isLoading={isLoading}
            setIsDisabled={setIsDisabled}
          >
            {isLoading ? "Procesando..." : "Importar"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

// function Loader() {
//   return (
//     <div className="relative mx-auto my-6 h-[40px] w-[40px]">
//       <div className='absolute left-[6px] top-0 block h-[5px] w-[5px] rotate-[70deg] rounded-[10px] before:absolute before:right-0 before:h-[5px] before:w-[5px] before:animate-loading before:rounded-[10px] before:bg-blue-400 before:content-[""]' />
//       <div className='absolute right-0 top-[6px] block h-[5px] w-[5px] rotate-[160deg] rounded-[10px] before:absolute before:right-0 before:h-[5px] before:w-[5px] before:animate-loading before:rounded-[10px] before:bg-blue-800 before:content-[""]' />
//       <div className='absolute bottom-0 right-[6px] block h-[5px] w-[5px] rotate-[-110deg] rounded-[10px] before:absolute before:right-0 before:h-[5px] before:w-[5px] before:animate-loading before:rounded-[10px] before:bg-blue-500 before:content-[""]' />
//       <div className='absolute bottom-[6px] left-0 block h-[5px] w-[5px] rotate-[-20deg] rounded-[10px] before:absolute before:right-0 before:h-[5px] before:w-[5px] before:animate-loading before:rounded-[10px] before:bg-blue-900 before:content-[""]' />
//     </div>
//   );
// }
