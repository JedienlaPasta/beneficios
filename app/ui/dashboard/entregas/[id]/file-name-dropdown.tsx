import { useEffect, useRef, useState } from "react";

type File = {
  id: string;
  name: string;
};

type FileDropdownProps = {
  label: string;
  name: string;
  value: string;
  setValue: (prevState: string) => void;
  valuesList?: File[];
  placeHolder?: string;
};

export default function FileDropdown({
  label,
  name,
  valuesList,
  placeHolder,
  value,
  setValue,
}: FileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      className="relative flex grow select-none flex-col gap-1"
    >
      <label htmlFor={label} className="text-xs text-slate-500">
        {label}
      </label>
      <input
        id={label}
        name={name}
        type="text"
        value={value}
        placeholder={placeHolder}
        autoComplete="off"
        readOnly
        required
        className={`h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-gray-400 focus-within:border-blue-500 focus:outline-none`}
      />
      {/* Dropdown List */}
      {isOpen && (
        <ul className="absolute left-0 top-16 z-10 w-[100%] divide-y overflow-y-auto rounded-lg border border-gray-200 bg-white text-slate-700 shadow-lg">
          {valuesList && valuesList.length > 0 ? (
            valuesList.map((file, index) => (
              <li
                key={index}
                onClick={() => setValue(file.name)}
                className="flex h-12 w-full cursor-pointer flex-col justify-center px-4 text-sm hover:bg-sky-100"
              >
                <span>{file.name}</span>
              </li>
            ))
          ) : (
            <li className="flex h-12 w-full flex-col justify-center px-4 text-sm text-slate-500">
              No hay correos disponibles
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
