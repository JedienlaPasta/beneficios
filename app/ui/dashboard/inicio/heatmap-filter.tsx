"use client";
import { getYearsBetween } from "@/app/lib/utils/get-values";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function HeatMapFilter({
  currentYear,
}: {
  currentYear: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectedYear = searchParams.get("year") || currentYear;

  const handleClick = (year: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("year", year);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const start = "2025";
  const end = "2030";
  const years = getYearsBetween(start, end);

  return (
    <div className="-mt-1 flex max-h-[11.5rem] min-w-32 max-w-96 shrink-0 flex-col flex-nowrap gap-2 overflow-y-auto px-2 py-1">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => handleClick(year)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
            year === selectedYear
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-blue-50"
              : "bg-slate-200/80 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
