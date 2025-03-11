// import { RiCloseLine } from "react-icons/ri";
import { Campaign } from "@/app/lib/definitions";

type InputProps = {
  label: string;
  nombre: keyof Campaign;
  type?: string;
  value?: string;
  defaultValue?: string;
  setData?: (prevState: string) => void;
  placeHolder?: string;
  setFormData?: (
    prevState: Campaign | ((prevState: Campaign) => Campaign),
  ) => void;
};

export default function Input({
  label,
  nombre,
  type,
  value,
  placeHolder,
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
    <div className="flex flex-col gap-1">
      <label htmlFor={label} className="text-xs text-slate-500">
        {label}
      </label>
      <input
        id={label}
        name={nombre}
        type={type}
        autoComplete="off"
        placeholder={placeHolder}
        value={value}
        onChange={handleChange}
        maxLength={label === "Código Campaña" ? 2 : undefined}
        className="h-10 w-full rounded-lg border border-slate-300 bg-transparent bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus-within:border-blue-500"
      />
      {/* {value && (
        <RiCloseLine
          className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          onClick={() => setValue("")}
        />
      )} */}
    </div>
  );
}
