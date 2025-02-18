import { ReactNode } from "react";
import Sidenav from "../ui/dashboard/sidenav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-600">
      <Sidenav />
      {children}
    </div>
  );
}
