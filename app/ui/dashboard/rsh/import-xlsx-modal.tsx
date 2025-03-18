"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RiCloseLine } from "react-icons/ri";
import { SubmitButton } from "../submit-button";
import { importXLSXFile } from "@/app/lib/actions/rsh";
import xlsxImg from "@/public/xlsx.svg";
import Image from "next/image";
import { RiCloseCircleFill } from "react-icons/ri";

export type FormState = {
  success?: boolean;
  message?: string;
};

export default function ImportXLSXModal() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);
    setUploadProgress(0);

    if (!selectedFile) {
      toast.error("No se ha seleccionado ningún archivo.");
      return;
    }

    try {
      // Chunk size: 2MB
      const CHUNK_SIZE = 2 * 1024 * 1024;
      const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
      let currentChunk = 0;
      let start = 0;
      let end = CHUNK_SIZE;

      // Create a toast that we'll update with progress
      const toastId = toast.loading(`Subiendo archivo... (0/${totalChunks})`, {
        duration: Infinity,
      });

      let finalResponse: FormState | null = null;

      while (start < selectedFile.size) {
        // Slice the file into chunks
        const chunk = selectedFile.slice(start, end);
        const formData = new FormData();

        // Add chunk metadata
        formData.append("file", chunk);
        formData.append("fileName", selectedFile.name);
        formData.append("chunkIndex", currentChunk.toString());
        formData.append("totalChunks", totalChunks.toString());

        // Send the chunk
        const response = await importXLSXFile(formData);

        if (!response.success) {
          throw new Error(response.message);
        }

        // Update progress
        currentChunk++;
        const progressPercent = Math.round((currentChunk / totalChunks) * 100);
        setUploadProgress(progressPercent);

        // Update toast message
        toast.loading(`Subiendo archivo... (${currentChunk}/${totalChunks})`, {
          id: toastId,
        });

        // If this is the last chunk, save the final response
        if (currentChunk === totalChunks) {
          finalResponse = response;
        }

        // Move to next chunk
        start = end;
        end = Math.min(start + CHUNK_SIZE, selectedFile.size);
      }

      // Dismiss the loading toast
      toast.dismiss(toastId);

      // Show success message
      if (finalResponse) {
        toast.success(finalResponse.message);
        setIsLoading(false);
        setTimeout(() => {
          router.back();
        }, 500);
      }
    } catch (err) {
      setIsDisabled(false);
      setIsLoading(false);
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  useEffect(() => {
    console.log("isLoading: " + isLoading);
    console.log("isDisabled: " + isDisabled);
  }, [isLoading, isDisabled]);

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
    <div className="grid max-h-dvh min-w-[26rem] max-w-[30rem] shrink-0 flex-col gap-4 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Importar Registro Social de Hogares
          </h2>
          <RiCloseLine
            className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
            onClick={() => router.back()}
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
              <Spinner />
              <p className="mt-1 text-xs text-slate-500">
                Esto puede tardar 1 minuto...
              </p>
              {uploadProgress > 0 && (
                <div className="mt-2 w-full max-w-[80%]">
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-center text-xs text-slate-500">
                    {uploadProgress}%
                  </p>
                </div>
              )}
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

export function Spinner() {
  return (
    <div className="animate-cspin h-5 w-5 rounded-full border-4 border-blue-200 border-t-blue-400 bg-white"></div>
  );
}
