// "use client";
// import { useActionState, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { RiCloseLine } from "react-icons/ri";
// import { SubmitButton } from "../submit-button";
// import { importXLSXFile } from "@/app/lib/actions/rsh";

// export type FormState = {
//   success?: boolean;
//   message?: string;
// };

// export default function ImportXLSXModal() {
//   const router = useRouter();
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [state, formAction] = useActionState<FormState, FormData>(
//     importXLSXFile,
//     {
//       success: false,
//       message: "",
//     },
//   );

//   useEffect(() => {
//     if (state?.message) {
//       if (state.success) {
//         toast.success(state.message);
//         setIsLoading(false);
//         setTimeout(() => {
//           router.back();
//         }, 1500);
//       } else {
//         toast.error(state.message);
//         setIsLoading(false);
//         setIsDisabled(false);
//       }
//     }
//   }, [state, router]);

//   // Button handlers
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDisabled, setIsDisabled] = useState(false);

//   const handleFormAction = async (formData: FormData) => {
//     if (!selectedFile) {
//       toast.error("No se ha seleccionado ningún archivo.");
//       return;
//     }
//     setIsLoading(true);
//     setIsDisabled(true);
//     toast.info("Guardando...");
//     formData.append("file", selectedFile);
//     formAction(formData);
//   };

//   const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     const file = e.dataTransfer?.files[0];
//     if (file) setSelectedFile(file);
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) setSelectedFile(file);
//   };

//   return (
//     <div className="grid max-h-dvh min-w-[26rem] max-w-[30rem] shrink-0 flex-col gap-4 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
//       <div>
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">Importar Registro</h2>
//           <RiCloseLine
//             className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
//             onClick={() => router.back()}
//           />
//         </div>
//         <p className="text-xs text-gray-500">
//           Selecciona el archivo que deseas importar.
//         </p>
//       </div>
//       <form
//         action={handleFormAction}
//         className="flex flex-col gap-2"
//       >
//         <div
//           className="flex h-40 grow flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-400/60"
//           onDrop={handleFileDrop}
//           onDragOver={(e) => e.preventDefault()}
//         >
//           <p className="text font-medium text-slate-700">
//             Arrastra y Suelta Aquí
//           </p>
//           <input
//             type="file"
//             id="fileInput"
//             className="hidden"
//             accept=".xlsx,.xls"
//             onChange={handleFileSelect}
//           />
//           <label
//             htmlFor="fileInput"
//             className="cursor-pointer text-xs text-slate-500"
//           >
//             Seleccionar Archivo
//           </label>
//         </div>
//         <p className="text-xs text-slate-500">Solo archivos .xlsx,.xls</p>
//         {/* Import Status */}
//         <div className="flex flex-col gap-2">
//           <span className="flex justify-between">
//             <p className="text-sm text-slate-600">RSH-2025.pdf</p>
//             <p className="text-sm text-slate-600">56%</p>
//           </span>
//           <div className="h-2 w-full rounded bg-gray-200">
//             <div
//               className="h-full animate-pulse rounded bg-blue-500"
//               style={{ width: "56%" }}
//             ></div>
//           </div>
//         </div>
//         <div className="flex pt-3">
//           <SubmitButton isDisabled={isDisabled} setIsDisabled={setIsDisabled}>
//             {isLoading ? "Procesando..." : "Importar"}
//           </SubmitButton>
//         </div>
//       </form>
//     </div>
//   );
// }

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
    toast.info("Procesando archivo Excel...");
    formData.append("file", selectedFile);
    console.log(formData);
    // formAction(formData);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) {
      if (isExcelFile(file)) {
        setSelectedFile(file);
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
      <form action={handleFormAction} className="flex flex-col gap-2">
        <div
          className="flex h-40 grow flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-400/60"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <p className="text font-medium text-slate-700">
                Arrastra y Suelta Aquí
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
                Seleccionar Archivo Excel
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
            <span className="flex items-center justify-between">
              <p className="text-sm text-slate-600">{selectedFile.name}</p>
              {isLoading && (
                <p className="h-3 w-3 animate-pulse rounded-full bg-blue-500 text-sm text-slate-600"></p>
              )}
            </span>
            {isLoading && (
              <div className="h-2 w-full rounded bg-gray-200">
                <div
                  className="h-full animate-pulse rounded bg-blue-500"
                  style={{ width: "0%" }}
                ></div>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex pt-3">
          <SubmitButton
            isDisabled={isDisabled || !selectedFile}
            setIsDisabled={setIsDisabled}
          >
            {isLoading ? "Procesando..." : "Importar"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

function Loader() {
  return (
    <div className="relative mx-auto my-6 h-[40px] w-[40px]">
      <div className='before:animate-loading absolute left-[6px] top-0 block h-[5px] w-[5px] rotate-[70deg] rounded-[10px] before:absolute before:right-0 before:h-[5px] before:w-[5px] before:rounded-[10px] before:bg-blue-400 before:content-[""]' />
      <div className='before:animate-loading absolute right-0 top-[6px] block h-[5px] w-[5px] rotate-[160deg] rounded-[10px] before:absolute before:right-0 before:h-[5px] before:w-[5px] before:rounded-[10px] before:bg-blue-800 before:content-[""]' />
      <div className='before:animate-loading absolute bottom-0 right-[6px] block h-[5px] w-[5px] rotate-[-110deg] rounded-[10px] before:absolute before:right-0 before:h-[5px] before:w-[5px] before:rounded-[10px] before:bg-blue-500 before:content-[""]' />
      <div className='before:animate-loading absolute bottom-[6px] left-0 block h-[5px] w-[5px] rotate-[-20deg] rounded-[10px] before:absolute before:right-0 before:h-[5px] before:w-[5px] before:rounded-[10px] before:bg-blue-900 before:content-[""]' />
    </div>
  );
}
