"use client";
import clsx from "clsx";
import { Requirements } from "./update-form";

export default function RequirementsCard({
  name,
  children,
  description,
  isMarked,
  setIsMarked,
}: {
  name: keyof Requirements;
  children: string;
  description?: string;
  isMarked: boolean;
  setIsMarked: (
    prevState: Requirements | ((prevState: Requirements) => Requirements),
  ) => void;
}) {
  const handleClick = () => {
    setIsMarked((prev) => ({ ...prev, [name]: !prev[name] }));
  };
  return (
    <div
      onClick={handleClick}
      className={clsx(
        "relative flex h-12 w-full min-w-52 cursor-pointer select-none flex-col justify-center rounded-md border bg-slate-100 px-6 transition-all duration-300",
        {
          "border-blue-400 bg-blue-200/50": isMarked,
          "border-gray-100 hover:border-slate-300 hover:bg-slate-200/80":
            !isMarked,
        },
      )}
    >
      <p
        className={`text-xs uppercase tracking-wider transition-all duration-300 ${isMarked ? "font-medium text-blue-500" : "text-slate-400"}`}
      >
        {children}
      </p>
      <p
        className={clsx(
          "overflow-hidden text-xs text-slate-700 transition-all duration-300",
          {
            "max-h-8 opacity-100": isMarked,
            "max-h-0 opacity-0": !isMarked,
          },
        )}
      >
        {description}
      </p>
      <span
        className={clsx(
          "absolute right-6 top-1/2 size-3 -translate-y-1/2 translate-x-1/2 rounded-lg transition-all duration-300",
          {
            "scale-100 bg-blue-500": isMarked,
            "scale-0 bg-slate-300": !isMarked,
          },
        )}
      ></span>
      <span
        className={clsx(
          "absolute right-6 top-1/2 size-1.5 -translate-y-1/2 translate-x-1/2 rounded-lg transition-all duration-300",
          {
            "scale-100 bg-slate-100": isMarked,
            "scale-0 bg-slate-300": !isMarked,
          },
        )}
      ></span>
    </div>
  );
}
