"use client";
import { useState } from "react";
import { DynamicField } from "./NewCampaignModal";

const PREDEFINED_LABELS = [
  "Código",
  "Monto",
  "Talla",
  "Cantidad",
  "Observación",
  "Empresa",
  "N° de Vale",
];

const PREDEFINED_TYPES = ["text", "number", "select", "boolean"];
const TYPE_META: Record<string, { display: string }> = {
  text: { display: "Texto" },
  number: { display: "Número" },
  select: { display: "Selección" },
  boolean: { display: "Sí/No" },
};

type Props = {
  dynamicFields: DynamicField[];
  setDynamicFields: React.Dispatch<React.SetStateAction<DynamicField[]>>;
};

export default function DynamicFieldsConfig({
  dynamicFields,
  setDynamicFields,
}: Props) {
  const [labelDropdownId, setlabelDropdownId] = useState<number | null>(null);
  const [typeDropdownId, setTypeDropdownId] = useState<number | null>(null);

  // Genera un nombre técnico (slug) automáticamente al escribir el Label
  const generateNameFromLabel = (label: string) => {
    return label
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const addEmptyField = () => {
    setDynamicFields([
      ...dynamicFields,
      {
        id: Date.now(),
        label: "",
        nombre: "",
        tipo: "text",
        opciones: "",
        requerido: true,
      },
    ]);
  };

  // console.log(dynamicFields);

  const removeField = (id: number) => {
    setDynamicFields(dynamicFields.filter((field) => field.id !== id));
  };

  const updateField = <K extends keyof DynamicField>(
    id: number,
    field: K,
    value: DynamicField[K],
  ) => {
    setDynamicFields((prev: DynamicField[]) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === "label" && typeof value === "string") {
            updatedItem.nombre = generateNameFromLabel(value);
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">
          Configuración del Formulario de Entrega
        </p>
        <button
          type="button"
          onClick={addEmptyField}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          + Agregar Campo
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {dynamicFields.length === 0 && (
          <p className="py-2 text-center text-xs italic text-slate-400">
            No hay campos definidos.
          </p>
        )}

        {dynamicFields.map((field) => {
          return (
            <div
              key={field.id}
              className="group relative flex flex-col gap-2 rounded border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Etiqueta
                  </label>

                  {/* Combobox: Input con sugerencias */}
                  <div className="relative">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(field.id, "label", e.target.value)
                      }
                      onClick={() =>
                        labelDropdownId
                          ? setlabelDropdownId(null)
                          : setlabelDropdownId(field.id)
                      }
                      onBlur={() => setlabelDropdownId(null)}
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
                    {labelDropdownId === field.id && (
                      <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="border-t border-slate-100 bg-slate-50">
                          <p className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">
                            Sugerencias
                          </p>
                          {PREDEFINED_LABELS.map((lbl) => (
                            <button
                              key={lbl}
                              type="button"
                              onMouseDown={() => {
                                updateField(field.id, "label", lbl);
                                setlabelDropdownId(null);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm text-slate-500 ${
                                field.label === lbl
                                  ? "bg-slate-200/80 text-slate-800"
                                  : "hover:bg-slate-100"
                              }`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Tipo
                  </label>
                  {/* Combobox: Input con sugerencias */}
                  <div className="relative">
                    <input
                      type="text"
                      value={TYPE_META[field.tipo]?.display || field.tipo}
                      // onChange={(e) =>
                      //   updateField(
                      //     field.id,
                      //     "tipo",
                      //     e.target.value as DynamicField["tipo"],
                      //   )
                      // }
                      readOnly
                      onClick={() =>
                        typeDropdownId
                          ? setTypeDropdownId(null)
                          : setTypeDropdownId(field.id)
                      }
                      onBlur={() => setTypeDropdownId(null)}
                      placeholder="Escribe o selecciona..."
                      className="w-full cursor-pointer border-b border-slate-200 bg-transparent py-1 pr-6 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500"
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
                    {typeDropdownId === field.id && (
                      <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="border-t border-slate-100 bg-slate-50">
                          <p className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">
                            Sugerencias
                          </p>
                          {PREDEFINED_TYPES.map((type) => {
                            const meta = TYPE_META[type] ?? { display: type };
                            const selected = field.tipo === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onMouseDown={() => {
                                  updateField(
                                    field.id,
                                    "tipo",
                                    type as DynamicField["tipo"],
                                  );
                                  setTypeDropdownId(null);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm ${
                                  selected
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {meta.display}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* <div className="w-1/3">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Tipo
                  </label>
                  <select
                    value={field.tipo}
                    onChange={(e) =>
                      updateField(
                        field.id,
                        "tipo",
                        e.target.value as DynamicField["tipo"],
                      )
                    }
                    className="w-full border-b border-slate-200 bg-transparent py-1 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="select">Selección</option>
                    <option value="boolean">Si/No</option>
                  </select>
                </div> */}
              </div>

              {/* Opciones extra para Select */}
              {field.tipo === "select" && (
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Opciones (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={field.opciones}
                    onChange={(e) =>
                      updateField(field.id, "opciones", e.target.value)
                    }
                    placeholder="Ej: S, M, L, XL"
                    className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
                  />
                </div>
              )}

              <div className="mt-1 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-1">
                  <input
                    type="checkbox"
                    checked={field.requerido}
                    onChange={(e) =>
                      updateField(field.id, "requerido", e.target.checked)
                    }
                    className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-500">Obligatorio</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="text-xs text-red-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
