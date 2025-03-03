// import { RiCloseLine } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { listaCampañas } from "@/app/data/data";

type CampañaDropdownProps = {
  label: string;
  nombre: string;
};

export default function CampañaDropdown({
  label,
  nombre,
}: CampañaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nombreCampaña, setNombreCampaña] = useState("");

  const mostrarCampañas = listaCampañas.map((campaña, index) => (
    <li
      key={index}
      onClick={() => setNombreCampaña(campaña.nombre)}
      className="flex w-full cursor-pointer flex-col px-4 py-[6px] text-sm hover:bg-sky-100"
    >
      <span>{campaña.nombre}</span>
      <span className="text-xs text-slate-500">{campaña.tipo}</span>
    </li>
  ));

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // De aqui para abajo, son valores/funciones para cerrar el dropdown cuando se hace click fuera de el
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const cerrarDropdown = (e: MouseEvent): void => {
    if (
      dropdownRef.current &&
      !(dropdownRef.current as HTMLElement).contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setIsOpen(false);
    document.addEventListener("click", cerrarDropdown);
    return () => {
      document.removeEventListener("click", cerrarDropdown);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      onClick={toggleDropdown}
      className="relative flex h-11 select-none items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500"
    >
      <label
        htmlFor={label}
        className="absolute left-3 top-[-1rem] text-xs text-slate-400"
      >
        {label}
      </label>
      <input
        id={label}
        name={nombre}
        type="text"
        value={nombreCampaña}
        onChange={(e) => setNombreCampaña(e.target.value)}
        placeholder="Nombre campaña..."
        autoComplete="off"
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      <MdKeyboardArrowDown
        className={`transform cursor-pointer text-3xl text-slate-400 transition duration-300 ${isOpen ? "rotate-[-180deg]" : ""}`}
      />
      {isOpen && (
        <ul className="absolute left-[-1px] top-full z-10 mt-1 w-[101%] divide-y overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {mostrarCampañas}
        </ul>
      )}
    </div>
  );
}
