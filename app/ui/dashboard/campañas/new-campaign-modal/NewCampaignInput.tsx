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
        <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
          {label}
          {required ? (
            <span className="text-xs font-normal text-red-500"> *</span>
          ) : (
            <span className="text-[10px] font-normal text-slate-400">
              {" "}
              (opcional)
            </span>
          )}
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
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-gray-700 shadow-sm outline-none transition-all placeholder:text-[13px] placeholder:text-gray-400 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
      />
    </div>
  );
}
