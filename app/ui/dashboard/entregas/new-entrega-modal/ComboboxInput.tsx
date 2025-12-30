"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ComboboxInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  name?: string;
}

export default function ComboboxInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  name,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filtramos las opciones según lo que el usuario escribe
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase()),
  );

  // Manejo de clicks fuera del componente para cerrar el menú
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative flex flex-col gap-1" ref={wrapperRef}>
      <label htmlFor={label} className="text-xs text-slate-500">
        {label}
        {required ? (
          <span className="text-red-500"> *</span>
        ) : (
          <span className="text-slate-400"> (opcional)</span>
        )}
      </label>

      <div className="relative">
        <input
          type="text"
          name={name}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-gray-700 shadow-sm outline-none transition-all placeholder:text-[13px] placeholder:text-gray-400 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onClick={() => setIsOpen((prev) => !prev)}
          onBlur={() => setIsOpen(false)}
          required={required}
          autoComplete="off"
        />

        {/* Flechita visual para indicar que es un desplegable */}
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "-rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Lista Desplegable */}
      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            {filteredOptions.map((option, index) => (
              <li
                key={index}
                className="cursor-pointer px-4 py-2 text-sm text-slate-700 hover:bg-slate-100/80 hover:text-blue-600"
                onClick={() => handleSelect(option)}
              >
                {option}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
