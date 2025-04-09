"use client";
import { useEffect, useRef, useState } from "react";

const rolesList = [
  {
    id: 1,
    name: "Administrador",
  },
  {
    id: 2,
    name: "Supervisor",
  },
  {
    id: 3,
    name: "Usuario",
  },
];

type RolDropdownProps = {
  label: string;
  name: string;
  rol: string;
  setRol: (prevState: string) => void;
  placeHolder: string;
};

export default function RolDropdown({
  label,
  name,
  rol,
  setRol,
  placeHolder,
}: RolDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // De aqui para abajo, son valores/funciones para cerrar el dropdown cuando se hace click fuera de el
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const closeDropdown = (e: MouseEvent): void => {
    if (
      dropdownRef.current &&
      !(dropdownRef.current as HTMLElement).contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setIsOpen(false);
    document.addEventListener("click", closeDropdown);
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      onClick={toggleDropdown}
      className="relative flex grow select-none flex-col gap-1"
    >
      <label htmlFor={label} className="text-xs text-slate-500">
        {label}
      </label>
      <input
        id={label}
        name={name}
        type="text"
        value={rol}
        readOnly={true}
        autoComplete="off"
        required
        placeholder={placeHolder}
        className={`h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none`}
      />
      {/* Dropdown List */}
      {isOpen && (
        <ul className="absolute left-[-1px] top-16 z-10 max-h-[146px] w-[101%] divide-y overflow-y-auto rounded-lg border border-gray-200 bg-white text-slate-700 shadow-lg">
          {rolesList && rolesList.length > 0 ? (
            rolesList.map((item, index) => (
              <li
                key={index}
                onClick={() => setRol(item.name)}
                className="flex h-12 w-full cursor-pointer flex-col justify-center px-4 text-sm hover:bg-sky-100"
              >
                <span>{item.name}</span>
              </li>
            ))
          ) : (
            <li className="flex h-12 w-full flex-col justify-center px-4 text-sm text-slate-500">
              No hay campañas disponibles
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
