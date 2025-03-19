import { ReactNode } from "react";
import Sidenav from "../ui/dashboard/sidenav";
import { Toaster } from "sonner";
import Breadcrumbs from "../ui/dashboard/breadcrumbs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh min-h-screen bg-gray-200/80">
      <Sidenav />
      {/* sidenav placeholder */}
      <div className="w-72 shrink-0"></div>
      <main className="scrollbar-gutter-stable flex-1 overflow-x-hidden">
        <div className="container relative mx-auto h-fit w-full px-12 py-8 text-slate-900">
          <Breadcrumbs />
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  );
}
