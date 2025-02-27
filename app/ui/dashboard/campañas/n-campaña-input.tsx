// import { RiCloseLine } from "react-icons/ri";

type InputProps = {
  placeHolder: string;
  label: string;
  type: string;
  nombre: string;
};

export default function Input({
  placeHolder,
  label,
  type,
  nombre,
}: InputProps) {
  return (
    <div className="relative flex h-11 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500">
      <label
        htmlFor={label}
        className="absolute left-3 top-[-1rem] text-xs text-slate-400"
      >
        {label}
      </label>
      <input
        id={label}
        name={nombre}
        type={type}
        // value={value}
        // onChange={(e) => setValue(e.target.value)}
        placeholder={placeHolder}
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
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
