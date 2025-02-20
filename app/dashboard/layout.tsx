import { ReactNode } from "react";
import Sidenav from "../ui/dashboard/sidenav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-800/5s flex overflow-hidden bg-gray-200/80">
      <Sidenav />
      {/* sidenav placeholder, ya que <Sidenav /> tiene position:fixed */}
      <div className="z-[-5] w-60 shrink-0"></div>
      <div className="flex grow justify-center overflow-auto">{children}</div>
    </div>
  );
}
