import clsx from "clsx";

export default function DataTypeCards({
  values,
  children,
  type,
  setValues,
}: {
  values: string[];
  children: string;
  type: "Texto" | "Número" | "V/F";
  setValues: (values: string[]) => void;
}) {
  const isSelected = values.includes(children);
  const onClick = () => {
    setValues(
      isSelected ? values.filter((v) => v !== children) : [...values, children],
    );
  };
  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative flex w-full min-w-32 cursor-pointer select-none flex-col justify-center rounded-md border bg-slate-100 px-4 py-2.5 transition-all duration-300",
        {
          "border-blue-400 bg-blue-200/50": isSelected,
          "border-gray-100 hover:border-slate-300 hover:bg-slate-200/80":
            !isSelected,
        },
      )}
    >
      <p
        className={`ml-0.5 text-xs uppercase tracking-wider transition-all duration-300 ${isSelected ? "font-medium text-blue-500" : "text-slate-400"}`}
      >
        {children}
      </p>
      <p
        className={`-mb-0.5 -mt-[3px] ml-0.5 text-[11px] transition-all duration-300 ${isSelected ? "text-blue-400" : "text-slate-400"}`}
      >
        {type}
      </p>

      <span className="absolute right-6 top-1/2 flex -translate-y-1/2 translate-x-1/2 items-center">
        <span
          className={clsx(
            "absolute size-3 rounded-lg transition-all duration-300",
            {
              "scale-100 bg-blue-500": isSelected,
              "scale-0 bg-slate-300": !isSelected,
            },
          )}
        ></span>
        <span
          className={clsx(
            "absolute ml-[3px] size-1.5 rounded-lg transition-all duration-300",
            {
              "scale-100 bg-slate-100": isSelected,
              "scale-0 bg-slate-300": !isSelected,
            },
          )}
        ></span>
      </span>
    </div>
  );
}
