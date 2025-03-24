"use client";
import { RiCloseCircleFill } from "react-icons/ri";
import { SubmitButton } from "../../submit-button";
import pdf from "@/public/pdf.svg";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uploadPDFByFolio } from "@/app/lib/actions/entregas";

export default function ModalForm({
  folio,
  savedFiles,
}: {
  folio: string;
  savedFiles: number;
}) {
  const router = useRouter();
  // Change to array of files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const totalFiles = savedFiles + selectedFiles.length;

  // const searchParams = useSearchParams();

  // const closeModal = () => {
  //   const params = new URLSearchParams(searchParams);
  //   params.delete("detailsModal", "open");
  //   router.replace(`?${params.toString()}`, { scroll: false });
  // };

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const formAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    if (selectedFiles.length === 0) {
      toast.error("No se ha seleccionado ningún archivo.");
      return;
    }

    const myFormData = new FormData();
    // Append all files to the form data
    selectedFiles.forEach((file, index) => {
      myFormData.append(`file${index}`, file);
    });
    // Add the count of files
    myFormData.append("fileCount", selectedFiles.length.toString());

    toast.promise(
      uploadPDFByFolio(folio, myFormData).then((response) => {
        if (!response.success) {
          throw new Error(response.message);
        }
        setIsLoading(false);
        setIsDisabled(false);
        return response;
      }),
      {
        loading: "Procesando archivos PDF...",
        success: (response) => {
          setIsLoading(false);
          setSelectedFiles([]);
          router.refresh();
          // setTimeout(() => {
          //   closeModal();
          // }, 500);
          return response.message;
        },
        error: (err) => {
          setIsDisabled(false);
          return err.message;
        },
      },
    );
  };

  const handleFiles = (files: FileList | []) => {
    const remainingSlots = 3 - totalFiles;
    if (!files || files.length === 0) return;

    // Early return if already at max files
    if (totalFiles >= 3 || files.length > remainingSlots) {
      toast.error("No se pueden agregar más de 3 archivos.");
      return;
    }

    // Convert FileList to Array and filter for PDFs
    const fileArray = Array.from(files)
      .filter(isPDFFile)
      .slice(0, remainingSlots);

    if (fileArray.length === 0) {
      toast.error("Solo se permiten archivos PDF (.pdf)");
      return;
    }

    setSelectedFiles([...selectedFiles, ...fileArray]);
    toast.success(`${fileArray.length} archivo(s) PDF recibido(s).`);
  };

  // files + selectedFiles.length > 3?? // Se borro
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = e.target.files;
    handleFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Helper function to check if file is PDF
  const isPDFFile = (file: File): boolean => {
    const validTypes = ["application/pdf", "application/x-pdf"];
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
            <Spinner />
            <p className="mt-1 text-xs text-slate-500">
              Esto puede tardar 1 minuto...
            </p>
          </>
        ) : (
          <>
            <p className="text font-medium text-slate-700">
              Suelta aquí tus archivos
            </p>
            <input
              type="file"
              id="fileInput"
              name="file"
              className="hidden"
              accept=".pdf,application/pdf,application/x-pdf"
              onChange={handleFileSelect}
              multiple // Allow multiple file selection
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer text-xs text-slate-500"
            >
              Seleccionar archivos PDF
            </label>
            <p className="text-xs text-slate-500">({totalFiles}/3)</p>
          </>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Solo archivos PDF (.pdf) - Máximo 3 archivos
      </p>

      {/* Import Status - Show all selected files */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {selectedFiles.map((file, index) => (
            <span
              key={index}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-4 py-3"
            >
              <span className="flex items-center justify-between gap-2">
                <Image className="h-6 w-6" src={pdf} alt="pdf.img" />
                <p className="text-sm text-slate-600">{file.name}</p>
              </span>
              {isLoading && (
                <p className="h-3 w-3 shrink-0 grow-0 animate-pulse rounded-full bg-blue-500 text-sm text-slate-600"></p>
              )}
              {!isLoading && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="rounded-full"
                >
                  <RiCloseCircleFill className="h-5 w-5 cursor-pointer rounded-full text-slate-500 hover:text-slate-600" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex pt-3">
        <SubmitButton
          isDisabled={isDisabled || selectedFiles.length === 0}
          isLoading={isLoading}
          setIsDisabled={setIsDisabled}
        >
          {isLoading ? "Guardando..." : "Guardar"}
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
