import { JSX } from "react";
import SearchBar from "./searchbar";

export default function TableHeader({ children }: { children: JSX.Element }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
      <span className="flex flex-wrap items-center gap-2 text-nowrap text-lg font-semibold text-slate-800">
        {children}
      </span>
      <SearchBar placeholder="Buscar campaña..." />
    </div>
  );
}
