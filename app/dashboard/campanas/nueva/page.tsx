import { RiCloseLine } from "react-icons/ri";
import CampañaDropdown from "@/app/ui/dashboard/campañas/campaña-dropdown";

export default function NuevaCampañaModal() {
  const nombreCampaña = "";
  const fechaTermino = "";
  const descripcion = "";

  return (
    <div className="fixed left-0 top-0 z-[1] flex h-dvh w-full items-center justify-center">
      <div
        // onClick={() => closeModal()}
        className="fixed h-dvh w-full cursor-pointer bg-black/30"
      ></div>
      <div className="relative z-[10] flex w-96 flex-col gap-4 rounded-xl bg-white p-5">
        <RiCloseLine
          className="absolute right-4 top-4 cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          // onClick={() => closeModal()}
        />
        <h2 className="text-lg font-bold">Crear Campaña</h2>
        <div className="border-t border-gray-200/80"></div>
        <p className="text-xs text-gray-500">
          Elige el tipo de campaña que quieres ingresar y sus datos
          correspondientes.
        </p>
        <form className="mt-3 flex flex-col gap-8">
          {/* <CampañaDropdown
            label="Nombre Campaña"
            nombreCampaña={nombreCampaña}
            setNombreCampaña={setNombreCampaña}
          />
          <Input
            placeHolder="Término..."
            label="Término"
            type="date"
            value={fechaTermino}
            setValue={setFechaTermino}
          />
          <Input
            placeHolder="Descripción..."
            label="Descripción"
            type="text"
            value={descripcion}
            setValue={setDescripcion}
          /> */}
        </form>
        <button className="flex h-11 w-fit items-center gap-2 self-end rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-10 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-600 active:scale-95">
          Guardar
        </button>
      </div>
    </div>
  );
}

type InputProps = {
  placeHolder: string;
  label: string;
  type: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

function Input({ placeHolder, label, type, value, setValue }: InputProps) {
  return (
    <div className="relative flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500">
      <label
        htmlFor={label}
        className="absolute left-3 top-[-1rem] text-xs text-slate-400"
      >
        {label}
      </label>
      <input
        id={label}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeHolder}
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      {value && (
        <RiCloseLine
          className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          onClick={() => setValue("")}
        />
      )}
    </div>
  );
}
