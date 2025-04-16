export default function HeatInfo() {
  return (
    <div className="flex w-fit flex-nowrap justify-end gap-1 self-start rounded-lg border border-slate-200 px-2 py-1">
      <p className="text-xs text-slate-400">Poco</p>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-slate-200 bg-slate-100"></div>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-300 bg-green-100"></div>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-400 bg-green-200"></div>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-500 bg-green-300"></div>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-600 bg-green-400"></div>
      <p className="text-xs text-slate-400">Mucho</p>
    </div>
  );
}
