export default function HeatInfo() {
  return (
    <div className="flex w-fit flex-nowrap justify-end gap-1 self-start rounded-lg border border-slate-200 px-2 py-1">
      <p className="text-xs text-slate-400">Poco</p>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-slate-300/40 bg-slate-100"></div>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-emerald-200 bg-emerald-100"></div>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-emerald-300 bg-emerald-200"></div>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-emerald-400 bg-emerald-300"></div>
      <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-emerald-500 bg-emerald-400"></div>
      <p className="text-xs text-slate-400">Mucho</p>
    </div>
  );
}
