"use client";
import { useState } from "react";
import Input from "../../campañas/new-campaign-modal/NewCampaignInput";
import { DynamicFieldSchema, FormValue } from "./NewModalForm";

const CHILD_SIZES = new Set(["RN", "P", "M", "G", "XG", "XXG"]);
const ADULT_SIZES = new Set(["S", "M", "L", "XL"]);

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

  // Lógica de filtrado
  const getVisibleOptions = (field: DynamicFieldSchema) => {
    // Si no es talla o no tiene opciones, devolvemos todo tal cual
    if (field.nombre !== "talla" || !field.opciones) {
      return field.opciones || [];
    }

    const categoria = values["categoria"]; // Leemos el valor actual del formulario

    // Si seleccionó Adulto, filtramos las tallas de niño
    if (categoria === "Adulto") {
      return field.opciones.filter(
        (option) =>
          ADULT_SIZES.has(option) ||
          option.includes("Adulto") ||
          !CHILD_SIZES.has(option),
      );
    }

    // Si seleccionó Infantil, filtramos las de adulto
    if (categoria === "Infantil") {
      return field.opciones.filter(
        (option) => CHILD_SIZES.has(option) || !ADULT_SIZES.has(option),
      );
    }

    // Si no hay categoría, mostramos todo
    return field.opciones;
  };

  if (schema.length === 0) {
    return (
      <p className="text-xs italic text-slate-500">Sin datos adicionales.</p>
    );
  }

  const handleSelect = (fieldName: string, option: string) => {
    console.log("Selected option:", option);
    onChange(fieldName, option);
    setFieldDropdownName(null);
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {schema.map((field) => {
        // Calculamos las opciones visibles para este campo específico
        const visibleOptions = getVisibleOptions(field);
        // console.log(visibleOptions);

        return (
          <div key={field.nombre}>
            {field.tipo === "select" ? (
              <div className="flex flex-col gap-1">
                <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
                  {field.label}{" "}
                  {field.requerido && (
                    <span className="text-xs font-normal text-red-500"> *</span>
                  )}
                </label>
                {/* Combobox: Input con sugerencias */}
                <div className="relative">
                  <input
                    type="text"
                    value={String(values[field.nombre] || "")}
                    readOnly={
                      field.nombre === "talla" || field.nombre === "categoria"
                    }
                    onChange={(e) =>
                      field.nombre !== "talla" &&
                      field.nombre !== "categoria" &&
                      onChange(field.nombre, e.target.value)
                    }
                    onClick={() =>
                      fieldDropdownName
                        ? setFieldDropdownName(null)
                        : setFieldDropdownName(field.nombre)
                    }
                    onBlur={() => setFieldDropdownName(null)}
                    placeholder={
                      field.nombre === "talla" && !values["categoria"]
                        ? "Seleccione categoría primero..."
                        : "Seleccione..."
                    }
                    className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-gray-700 shadow-sm outline-none transition-all placeholder:text-[13px] placeholder:text-gray-400 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 ${
                      field.nombre === "talla" || field.nombre === "categoria"
                        ? "cursor-pointer select-none"
                        : "cursor-text"
                    }`}
                  />

                  {/* Icono de chevron para indicar dropdown */}
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
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
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5">
                      {visibleOptions.length === 0 ? (
                        <p className="px-2 py-2 text-center text-xs text-slate-400">
                          {field.nombre === "talla" && !values["categoria"]
                            ? "Seleccione una categoría arriba"
                            : "No hay opciones disponibles"}
                        </p>
                      ) : field.nombre === "talla" ? (
                        // --- RENDERIZADO TIPO GRID (Para Talla) ---
                        <div className="grid grid-cols-2 gap-1">
                          {visibleOptions.map((opcion) => {
                            const isSelected =
                              String(values[field.nombre]) === opcion;
                            return (
                              <button
                                key={opcion}
                                type="button"
                                onMouseDown={() =>
                                  handleSelect(field.nombre, opcion)
                                }
                                className={`flex items-center justify-center rounded-md py-2 text-sm font-medium ring-2 ring-inset transition-all ${
                                  isSelected
                                    ? "bg-blue-50 text-blue-600 shadow-sm ring-blue-400"
                                    : "bg-slate-50 text-slate-600 ring-slate-50 hover:bg-white hover:ring-slate-200"
                                }`}
                              >
                                {opcion}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        // --- RENDERIZADO TIPO LISTA (Estándar) ---
                        <div className="flex flex-col gap-1">
                          {visibleOptions.map((opcion) => {
                            const isSelected =
                              String(values[field.nombre]) === opcion;
                            return (
                              <button
                                key={opcion}
                                type="button"
                                onMouseDown={() =>
                                  handleSelect(field.nombre, opcion)
                                }
                                className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "bg-blue-50 font-medium text-blue-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {opcion}
                              </button>
                            );
                          })}
                        </div>
                      )}
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
        );
      })}
    </div>
  );
};
