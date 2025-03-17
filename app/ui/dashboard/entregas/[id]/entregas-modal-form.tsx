"use client";
import { RiCloseCircleFill } from "react-icons/ri";
import { SubmitButton } from "../../submit-button";
import xlsxImg from "@/public/xlsx.svg";
import { toast } from "sonner";
import { importXLSXFile } from "@/app/lib/actions/rsh";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ModalForm() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    toast.promise(
      importXLSXFile(myFormData).then((response) => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response;
      }),
      {
        loading: "Procesando archivo Excel...",
        success: (response) => {
          setIsLoading(false);
          setTimeout(() => {
            router.back();
          }, 500);
          return response.message;
        },
        error: (err) => {
          setIsDisabled(false);
          return err.message;
        },
      },
    );
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
  );
}

export function Spinner() {
  return (
    <div className="animate-cspin h-5 w-5 rounded-full border-4 border-blue-200 border-t-blue-400 bg-white"></div>
  );
}
