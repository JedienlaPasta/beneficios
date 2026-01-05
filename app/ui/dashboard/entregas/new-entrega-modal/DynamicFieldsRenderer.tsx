"use client";
import { useState } from "react";
import Input from "../../campañas/new-campaign-modal/NewCampaignInput";
import { DynamicFieldSchema, FormValue } from "./NewModalForm";

// --- SUB-COMPONENTE RENDERIZADOR ---
export const DynamicFieldsRenderer = ({
  schemaString,
  values,
  onChange,
}: {
  schemaString: string;
  values: Record<string, FormValue>;
  onChange: (fieldName: string, value: FormValue) => void;
}) => {
  const [fieldDropdownName, setFieldDropdownName] = useState<string | null>(
    null,
  );
  let schema: DynamicFieldSchema[] = [];
  try {
    schema = JSON.parse(schemaString || "[]");
  } catch {
    return <p className="text-xs text-red-500">Error en esquema</p>;
  }

  if (schema.length === 0) {
    return (
      <p className="text-xs italic text-slate-400">Sin datos adicionales.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {schema.map((field) => (
        <div key={field.nombre}>
          {field.tipo === "select" ? (
            <div className="flex flex-col gap-1">
              <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                {field.label}{" "}
                {field.requerido && (
                  <span className="font-normal text-red-500"> *</span>
                )}
              </label>
              {/* Combobox: Input con sugerencias */}
              <div className="relative">
                <input
                  type="text"
                  value={String(values[field.nombre] || "")}
                  onChange={(e) => onChange(field.nombre, e.target.value)}
                  onClick={() =>
                    fieldDropdownName
                      ? setFieldDropdownName(null)
                      : setFieldDropdownName(field.nombre)
                  }
                  onBlur={() => setFieldDropdownName(null)}
                  placeholder="Escribe o selecciona..."
                  className="w-full border-b border-slate-200 bg-transparent py-1 pr-6 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500"
                />

                {/* Icono de chevron para indicar dropdown */}
                <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Lista desplegable */}
                {fieldDropdownName === field.nombre && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="border-t border-slate-100 bg-slate-50">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">
                        Sugerencias
                      </p>
                      {field.opciones ? (
                        field.opciones.map((opcion) => (
                          <button
                            key={opcion}
                            type="button"
                            onMouseDown={() => {
                              onChange(field.nombre, opcion);
                              setFieldDropdownName(null);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm text-slate-500 ${
                              field.nombre === opcion
                                ? "bg-slate-200/80 text-slate-800"
                                : "hover:bg-slate-100"
                            }`}
                          >
                            {opcion}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-[10px] font-semibold uppercase text-slate-400">
                          No hay opciones disponibles
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Input
              placeHolder={`Ingrese ${field.label.toLowerCase()}...`}
              label={field.label}
              type="text" // Text para todos los campos text/number
              nombre={field.nombre}
              value={String(values[field.nombre] || "")}
              setData={(val) => onChange(field.nombre, val)}
              required={field.requerido}
            />
          )}
        </div>
      ))}
    </div>
  );
  // return (
  //   <div className="grid grid-cols-1 gap-3">
  //     {schema.map((field) => (
  //       <div key={field.nombre}>
  //         {field.tipo === "select" ? (
  //           <div className="flex flex-col gap-1">
  //             <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
  //               {field.label} {field.requerido && "*"}
  //             </label>
  //             <select
  //               className="w-full border-b border-slate-200 bg-transparent py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
  //               value={String(values[field.nombre] || "")}
  //               onChange={(e) => onChange(field.nombre, e.target.value)}
  //             >
  //               <option value="" disabled>
  //                 Seleccione...
  //               </option>
  //               {field.opciones?.map((op) => (
  //                 <option key={op} value={op}>
  //                   {op}
  //                 </option>
  //               ))}
  //             </select>
  //           </div>
  //         ) : (
  //           <Input
  //             placeHolder={`Ingrese ${field.label.toLowerCase()}...`}
  //             label={field.label}
  //             type="text" // Text para todos los campos text/number
  //             nombre={field.nombre}
  //             value={String(values[field.nombre] || "")}
  //             setData={(val) => onChange(field.nombre, val)}
  //             required={field.requerido}
  //           />
  //         )}
  //       </div>
  //     ))}
  //   </div>
  // );
};
