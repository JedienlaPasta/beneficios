import { ReactNode } from "react";
import Sidenav from "../ui/dashboard/sidenav";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh min-h-screen bg-gray-200">
      <Sidenav />
      {/* sidenav placeholder */}
      <div className="w-72 shrink-0"></div>
      <main className="scrollbar-gutter-stable flex-1 overflow-y-auto">
        <div className="container mx-auto h-full px-6">
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  );
}
