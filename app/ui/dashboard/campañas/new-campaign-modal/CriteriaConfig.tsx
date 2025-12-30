// import { Criteria } from "./NewCampaignModal";

// const PREDEFINED_LABELS = [
//   "Código",
//   "Monto",
//   "Talla",
//   "Cantidad",
//   "Observación",
//   "Empresa",
//   "N° de Vale",
// ];

// type Props = {
//   criteriaConfig: Criteria[];
//   setCriteriaConfig: React.Dispatch<React.SetStateAction<Criteria[]>>;
// };

// export default function CriteriaConfig({
//   criteriaConfig,
//   setCriteriaConfig,
// }: Props) {
//   // Genera un nombre técnico (slug) automáticamente al escribir el Label
//   const generateNameFromLabel = (label: string) => {
//     return label
//       .trim()
//       .toLowerCase()
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/[^a-z0-9]+/g, "_")
//       .replace(/^_+|_+$/g, "");
//   };

//   const addEmptyField = () => {
//     setCriteriaConfig([
//       ...criteriaConfig,
//       {
//         id: Date.now(),
//         label: "",
//         nombre: "",
//         tipo: "text",
//         opciones: "",
//         requerido: true,
//       },
//     ]);
//   };

//   const removeField = (id: number) => {
//     setCriteriaConfig(criteriaConfig.filter((field) => field.id !== id));
//   };

//   const updateField = <K extends keyof DynamicField>(
//     id: number,
//     field: K,
//     value: DynamicField[K],
//   ) => {
//     setCriteriaConfig((prev: DynamicField[]) =>
//       prev.map((item) => {
//         if (item.id === id) {
//           const updatedItem = { ...item, [field]: value };

//           if (field === "label" && typeof value === "string") {
//             updatedItem.nombre = generateNameFromLabel(value);
//           }

//           return updatedItem;
//         }
//         return item;
//       }),
//     );
//   };

//   return (
//     <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
//       <div className="flex items-center justify-between">
//         <p className="text-xs font-semibold text-slate-600">
//           Configuración del Formulario de Entrega
//         </p>
//         <button
//           type="button"
//           onClick={addEmptyField}
//           className="text-xs font-medium text-blue-600 hover:text-blue-800"
//         >
//           + Agregar Campo
//         </button>
//       </div>

//       <div className="mt-2 flex flex-col gap-2">
//         {criteriaConfig.length === 0 && (
//           <p className="py-2 text-center text-xs italic text-slate-400">
//             No hay campos definidos.
//           </p>
//         )}

//         {criteriaConfig.map((field) => (
//           <div
//             key={field.id}
//             className="group relative flex flex-col gap-2 rounded border border-slate-200 bg-white p-3 shadow-sm"
//           >
//             <div className="flex gap-2">
//               <div className="flex-1">
//                 <label className="text-[10px] font-bold uppercase text-slate-400">
//                   Etiqueta
//                 </label>

//                 {/* CONDICIONAL: ¿Es Custom o es Select? */}
//                 {field.isCustomLabel ? (
//                   // MODO MANUAL (INPUT)
//                   <div className="relative">
//                     <input
//                       type="text"
//                       value={field.label}
//                       autoFocus // Para que escriban de inmediato al cambiar
//                       onChange={(e) =>
//                         updateField(field.id, "label", e.target.value)
//                       }
//                       placeholder="Escribe el nombre del campo..."
//                       className="w-full border-b border-blue-500 bg-blue-50/50 py-1 pr-6 text-sm text-blue-900 outline-none transition-colors placeholder:text-blue-300"
//                     />
//                     {/* Botón para volver al Select (X) */}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         // Limpiamos el valor y desactivamos modo custom
//                         updateField(field.id, "label", "Código");
//                         updateField(field.id, "isCustomLabel", false);
//                       }}
//                       className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent p-1 text-xs text-blue-400 hover:text-blue-600"
//                       title="Volver a lista predeterminada"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ) : (
//                   // MODO LISTA (SELECT) - Visualmente igual al de "Tipo"
//                   <select
//                     value={
//                       PREDEFINED_LABELS.includes(field.label)
//                         ? field.label
//                         : "custom_option"
//                     }
//                     onChange={(e) => {
//                       if (e.target.value === "custom_option") {
//                         // Activar modo manual
//                         updateField(field.id, "label", "");
//                         updateField(field.id, "isCustomLabel", true);
//                       } else {
//                         // Seleccionar predeterminado
//                         updateField(field.id, "label", e.target.value);
//                       }
//                     }}
//                     className="w-full cursor-pointer border-b border-slate-200 bg-transparent py-1 text-sm outline-none focus:border-blue-500"
//                   >
//                     <option value="" disabled>
//                       Seleccionar...
//                     </option>
//                     {PREDEFINED_LABELS.map((lbl) => (
//                       <option key={lbl} value={lbl}>
//                         {lbl}
//                       </option>
//                     ))}
//                     <option
//                       value="custom_option"
//                       className="bg-blue-50 font-semibold text-blue-600"
//                     >
//                       + Otro / Personalizado...
//                     </option>
//                   </select>
//                 )}
//               </div>
//               <div className="w-1/3">
//                 <label className="text-[10px] font-bold uppercase text-slate-400">
//                   Tipo
//                 </label>
//                 <select
//                   value={field.tipo}
//                   onChange={(e) =>
//                     updateField(
//                       field.id,
//                       "tipo",
//                       e.target.value as DynamicField["tipo"],
//                     )
//                   }
//                   className="w-full border-b border-slate-200 bg-transparent py-1 text-sm outline-none focus:border-blue-500"
//                 >
//                   <option value="text">Texto</option>
//                   <option value="number">Número</option>
//                   <option value="select">Selección</option>
//                   <option value="boolean">Si/No</option>
//                 </select>
//               </div>
//             </div>

//             {/* Opciones extra para Select */}
//             {field.tipo === "select" && (
//               <div>
//                 <label className="text-[10px] font-bold uppercase text-slate-400">
//                   Opciones (separadas por coma)
//                 </label>
//                 <input
//                   type="text"
//                   value={field.opciones}
//                   onChange={(e) =>
//                     updateField(field.id, "opciones", e.target.value)
//                   }
//                   placeholder="Ej: S, M, L, XL"
//                   className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
//                 />
//               </div>
//             )}

//             <div className="mt-1 flex items-center justify-between">
//               <label className="flex cursor-pointer items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={field.requerido}
//                   onChange={(e) =>
//                     updateField(field.id, "requerido", e.target.checked)
//                   }
//                   className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="text-xs text-slate-500">Obligatorio</span>
//               </label>
//               <button
//                 type="button"
//                 onClick={() => removeField(field.id)}
//                 className="text-xs text-red-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
//               >
//                 Eliminar
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
