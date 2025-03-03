import { ReactNode } from "react";
import Sidenav from "../ui/dashboard/sidenav";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-800/5s flex h-dvh overflow-hidden bg-gray-200">
      <Sidenav />
      {/* sidenav placeholder, ya que <Sidenav /> tiene position:fixed */}
      <div className="z-[-5] w-64 shrink-0"></div>
      {/* <div className="flex grow justify-center overflow-auto"> */}
      <div className="container mx-auto flex min-h-screen w-full flex-grow overflow-auto">
        {children}
        <Toaster />
      </div>
    </div>
  );
}
