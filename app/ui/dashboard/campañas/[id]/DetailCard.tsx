export default function DetailCard({
  name,
  value,
  border,
}: {
  name: string;
  value: string;
  border?: boolean;
}) {
  const borderStyle = " border-b border-gray-100";
  return (
    <div className={`grid items-center py-3 ${border ? borderStyle : ""}`}>
      <p className="text-sm font-medium text-slate-700">{name}</p>
      <p
        className={`text-sm ${name === "ID" ? "text-blue-500" : "text-slate-600"}`}
      >
        {value}
      </p>
    </div>
  );
}
