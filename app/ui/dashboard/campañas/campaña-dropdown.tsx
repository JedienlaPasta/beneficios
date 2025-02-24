// import { RiCloseLine } from "react-icons/ri";
// import { BiSolidDownArrow } from "react-icons/bi";
import { MdArrowDropDown } from "react-icons/md";
import { useEffect, useRef, useState } from "react";

type CampañaDropdownProps = {
  label: string;
  nombreCampaña: string;
  setNombreCampaña: React.Dispatch<React.SetStateAction<string>>;
};

export default function CampañaDropdown({
  label,
  nombreCampaña,
  setNombreCampaña,
}: CampañaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const listaCampañas = [
    {
      nombre: "Tarjeta de Comida",
      tipo: "Código",
    },
    {
      nombre: "Vale de Gas",
      tipo: "Código",
    },
    {
      nombre: "Pañales",
      tipo: "Talla",
    },
  ];
  const campañasFiltradas = listaCampañas.map((campaña, index) => (
    <li
      key={index}
      onClick={() => setNombreCampaña(campaña.nombre)}
      className="flex w-full cursor-pointer flex-col px-4 py-1 text-sm hover:bg-gray-300"
    >
      <span>{campaña.nombre}</span>
      <span className="text-xs text-slate-500">{campaña.tipo}</span>
    </li>
  ));
  // const campañasFiltradas = listaCampañas
  //   .filter((campaña) =>
  //     campaña.nombre.toLowerCase().includes(nombreCampaña.toLowerCase()),
  //   )
  //   .map((campaña, index) => (
  //     <li
  //       key={index}
  //       onClick={() => setNombreCampaña(campaña.nombre)}
  //       className="flex w-full cursor-pointer flex-col px-4 py-1 text-sm hover:bg-gray-300"
  //     >
  //       <span>{campaña.nombre}</span>
  //       <span className="text-xs text-slate-500">{campaña.tipo}</span>
  //     </li>
  //   ));

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

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
      className="relative flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500"
    >
      <label
        htmlFor={label}
        className="absolute left-3 top-[-1rem] text-xs text-slate-400"
      >
        {label}
      </label>
      <input
        id={label}
        type="text"
        value={nombreCampaña}
        onChange={(e) => setNombreCampaña(e.target.value)}
        placeholder="Nombre campaña..."
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      <MdArrowDropDown
        className={`transform cursor-pointer text-4xl text-slate-400 transition duration-500 ${isOpen ? "rotate-[-180deg]" : ""}`}
      />
      {isOpen && (
        <ul className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-3 shadow-lg">
          {campañasFiltradas}
        </ul>
      )}
    </div>
  );
}
