import clsx from "clsx";

export default function StaticRequirementsCard({
  isRequired,
  children,
  description,
}: {
  isRequired: boolean;
  children: React.ReactNode;
  description: string;
}) {
  return (
    <div
      className={clsx(
        "relative flex h-14 w-full min-w-52 select-none flex-col justify-center rounded-xl border px-5",
        {
          "border-blue-400 bg-blue-200/50": isRequired,
          "border-gray-100 bg-white hover:border-slate-200 hover:bg-slate-50":
            !isRequired,
        },
      )}
    >
      <p
        className={`text-xs tracking-wide transition-all duration-300 ${isRequired ? "font-medium text-blue-500" : "text-slate-400"}`}
      >
        {children}
      </p>
      <p className="-mt-0.5 max-h-8 overflow-hidden text-sm font-medium text-slate-700 opacity-100 transition-all duration-300">
        {description}
      </p>
      <span
        className={`absolute right-7 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-lg ${isRequired ? "h-3 w-3 bg-blue-500" : "h-[6px] w-[6px] bg-slate-400"}`}
      ></span>
      <span
        className={`absolute right-7 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-lg ${isRequired ? "h-[0.375rem] w-[0.375rem] bg-white" : "h-0 w-0 bg-slate-400"}`}
      ></span>
    </div>
  );
}
