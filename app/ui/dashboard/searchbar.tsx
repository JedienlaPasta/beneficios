"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { FiSearch, FiLoader } from "react-icons/fi";
import { useDebouncedCallback } from "use-debounce";
import { useRef } from "react";

type SearchBarProps = {
  placeholder: string;
};

export default function SearchBar({ placeholder }: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  const handleSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }

    // Envolver el replace en una transición para obtener isPending
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, 300);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex h-11 min-w-52 flex-1 cursor-text items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
      onClick={handleContainerClick}
    >
      {isPending ? (
        <FiLoader className="animate-loadspin text-lg text-slate-400" />
      ) : (
        <FiSearch className="text-lg text-slate-400" />
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
    </div>
  );
}
