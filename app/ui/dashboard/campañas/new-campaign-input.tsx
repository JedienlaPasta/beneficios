// import { RiCloseLine } from "react-icons/ri";
import { Campaign } from "@/app/lib/definitions";

type InputProps = {
  label?: string;
  nombre: string;
  // nombre: keyof Campaign;
  type?: string;
  pattern?: string;
  value?: string;
  readonly?: boolean;
  required?: boolean;
  placeHolder?: string;
  maxLength?: number;
  setData?: (prevState: string) => void;
  setFormData?: (
    prevState: Campaign | ((prevState: Campaign) => Campaign),
  ) => void;
};

export default function Input({
  label,
  nombre,
  type,
  pattern,
  value,
  readonly,
  placeHolder,
  maxLength,
  required,
  setData,
  setFormData,
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setFormData) {
      setFormData((prevState) => ({
        ...prevState,
        [nombre]: e.target.value,
      }));
    } else if (setData) {
      setData(e.target.value);
    }
  };

  return (
    <div className="flex grow flex-col gap-1">
      {label && (
        <label htmlFor={label} className="text-xs text-slate-500">
          {label}
        </label>
      )}
      <input
        required={required}
        id={label}
        name={nombre}
        type={type}
        readOnly={readonly}
        pattern={pattern}
        autoComplete="off"
        placeholder={placeHolder}
        value={value}
        onChange={handleChange}
        maxLength={
          maxLength ? maxLength : label === "Código Campaña" ? 2 : undefined
        }
        className="h-10 w-full rounded-lg border border-blue-400 border-slate-200/10 bg-gray-200/40 px-4 text-sm text-gray-700 outline-none transition-all placeholder:text-[13px] placeholder:text-gray-400 focus-within:border-slate-500/85 focus-within:bg-gray-50/20 focus-within:ring-2 focus-within:ring-slate-200"
      />
      {/* <input
        required={required}
        id={label}
        name={nombre}
        type={type}
        readOnly={readonly}
        pattern={pattern}
        autoComplete="off"
        placeholder={placeHolder}
        value={value}
        onChange={handleChange}
        maxLength={
          maxLength ? maxLength : label === "Código Campaña" ? 2 : undefined
        }
        className="h-10 w-full rounded-lg border border-slate-300 bg-transparent bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus-within:border-blue-500"
      /> */}
    </div>
  );
}
