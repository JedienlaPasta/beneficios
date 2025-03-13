"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RiCloseLine } from "react-icons/ri";
import { SubmitButton } from "../submit-button";
import { importXLSXFile } from "@/app/lib/actions/rsh";

export type FormState = {
  success?: boolean;
  message?: string;
};

export default function ImportXLSXModal() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, formAction] = useActionState<FormState, FormData>(
    importXLSXFile,
    {
      success: false,
      message: "",
    },
  );

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        setIsLoading(false);
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        toast.error(state.message);
        setIsLoading(false);
        setIsDisabled(false);
      }
    }
  }, [state, router]);

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    if (!selectedFile) {
      toast.error("No se ha seleccionado ningún archivo.");
      return;
    }
    setIsLoading(true);
    setIsDisabled(true);
    toast.info("Guardando...");
    formData.append("file", selectedFile);
    formAction(formData);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) setSelectedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <div className="grid max-h-dvh min-w-[26rem] max-w-[30rem] shrink-0 flex-col gap-4 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Importar Registro</h2>
          <RiCloseLine
            className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
            onClick={() => router.back()}
          />
        </div>
        <p className="text-xs text-gray-500">
          Selecciona el archivo que deseas importar.
        </p>
      </div>
      <form action={handleFormAction} className="flex flex-col gap-2">
        <div
          className="flex h-40 grow flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-400/60"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p className="text font-medium text-slate-700">
            Arrastra y Suelta Aquí
          </p>
          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={handleFileSelect}
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer text-xs text-slate-500"
          >
            Seleccionar Archivo
          </label>
        </div>
        <p className="text-xs text-slate-500">Solo archivos .pdf</p>
        {/* Import Status */}
        <div className="flex flex-col gap-2">
          <span className="flex justify-between">
            <p className="text-sm text-slate-600">RSH-2025.pdf</p>
            <p className="text-sm text-slate-600">56%</p>
          </span>
          <div className="h-2 w-full rounded bg-gray-200">
            <div
              className="h-full animate-pulse rounded bg-blue-500"
              style={{ width: "56%" }}
            ></div>
          </div>
        </div>
        <div className="flex pt-3">
          <SubmitButton isDisabled={isDisabled} setIsDisabled={setIsDisabled}>
            {isLoading ? "Procesando..." : "Importar"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
