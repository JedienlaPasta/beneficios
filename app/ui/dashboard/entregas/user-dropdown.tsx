import { useEffect, useRef, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type UserDropdownProps = {
  label: string;
  name: string;
  userEmail: string;
  setUserEmail: (prevState: string) => void;
  usersList?: User[];
  placeHolder?: string;
};

export default function UserDropdown({
  label,
  name,
  usersList,
  placeHolder,
  userEmail,
  setUserEmail,
}: UserDropdownProps) {
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
        type="correo"
        value={userEmail}
        placeholder={placeHolder}
        autoComplete="off"
        readOnly
        required
        className={`h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-gray-400 focus-within:border-blue-500 focus:outline-none`}
      />
      {/* Dropdown List */}
      {isOpen && (
        <ul className="absolute left-0 top-16 z-10 w-[100%] divide-y overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {usersList && usersList.length > 0 ? (
            usersList.map((user, index) => {
              const splitName = user.name?.split(" ") || [];
              const iconText = splitName[0][0] + splitName[1][0];
              return (
                <li
                  key={index}
                  onClick={() => setUserEmail(user.email)}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-sm hover:bg-slate-100/80"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-medium text-white">
                    {iconText.toUpperCase()}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-600">{user.email}</span>
                  </div>
                </li>
              );
            })
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
