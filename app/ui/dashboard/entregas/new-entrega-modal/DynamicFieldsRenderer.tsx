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
                {field.label} {field.requerido && "*"}
              </label>
              <select
                className="w-full border-b border-slate-200 bg-transparent py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                value={String(values[field.nombre] || "")}
                onChange={(e) => onChange(field.nombre, e.target.value)}
              >
                <option value="" disabled>
                  Seleccione...
                </option>
                {field.opciones?.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
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
};
