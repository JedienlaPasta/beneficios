import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usersList } from "@/app/lib/data/static-data";

type UserDropdownProps = {
  label: string;
  name: string;
  userEmail: string;
  setUserEmail: (prevState: string) => void;
  placeHolder?: string;
  required?: boolean;
};

export default function UserDropdown({
  label,
  name,
  placeHolder,
  userEmail,
  setUserEmail,
  required = false,
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
        {required ? (
          <span className="text-red-500"> *</span>
        ) : (
          <span className="text-slate-400"> (opcional)</span>
        )}
      </label>
      <input
        id={label}
        type="text"
        value={usersList?.find((user) => user.email === userEmail)?.name || ""}
        placeholder={placeHolder}
        autoComplete="off"
        readOnly
        className={`h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-gray-400 focus-within:border-blue-500 focus:outline-none`}
      />
      {/* Input oculto para enviar correo al servidor */}
      <input type="hidden" name={name} value={userEmail} required />
      {/* Dropdown List */}
      <motion.div className="relative mt-0.5 flex flex-col justify-between gap-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.section
              key="supervisor"
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 1, y: -20, height: 0 }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-2"
              layout
            >
              {usersList && usersList.length > 0 ? (
                usersList.map((user, index) => {
                  const splitName = user.name?.split(" ") || [];
                  const initials =
                    (splitName[0]?.[0] ?? "") + (splitName[1]?.[0] ?? "") ||
                    (user.name?.[0]?.toUpperCase() ?? "U");

                  return (
                    <li
                      key={index}
                      onClick={() => setUserEmail(user.email)}
                      className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 first:mt-2 last:mb-2 hover:bg-slate-100/80"
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white shadow-sm">
                        {initials.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">
                          {user.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {user.email}
                        </span>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="flex h-12 items-center px-3 text-sm text-slate-500">
                  No hay correos disponibles
                </li>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
