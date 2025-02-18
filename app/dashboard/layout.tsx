import { ReactNode } from "react";
import Sidenav from "../ui/dashboard/sidenav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-slate-800/5">
      <Sidenav />
      {children}
    </div>
  );
}
