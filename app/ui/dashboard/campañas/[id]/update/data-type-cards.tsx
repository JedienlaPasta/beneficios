import clsx from "clsx";

export default function DataTypeCards({
  value,
  children,
  setValue,
}: {
  value: string;
  children: string;
  setValue: (value: string) => void;
}) {
  return (
    <div
      onClick={() => setValue(children)}
      className={clsx(
        "relative flex w-full min-w-32 cursor-pointer select-none flex-col rounded-md border bg-slate-100 px-4 py-3 transition-all duration-300",
        {
          "border-blue-400 bg-blue-200/50": value === children,
          "border-gray-100 hover:border-slate-300 hover:bg-slate-200/80":
            value !== children,
        },
      )}
    >
      <p
        className={`text-xs uppercase tracking-wider transition-all duration-300 ${value === children ? "font-medium text-blue-500" : "text-slate-400"}`}
      >
        {children}
      </p>
      <span
        className={clsx(
          "absolute right-5 top-1/2 size-3 -translate-y-1/2 translate-x-1/2 rounded-lg transition-all duration-300",
          {
            "scale-100 bg-blue-500": value === children,
            "scale-0 bg-slate-300": value !== children,
          },
        )}
      ></span>
      <span
        className={clsx(
          "absolute right-5 top-1/2 size-1.5 -translate-y-1/2 translate-x-1/2 rounded-lg transition-all duration-300",
          {
            "scale-100 bg-slate-100": value === children,
            "scale-0 bg-slate-300": value !== children,
          },
        )}
      ></span>
    </div>
  );
}
