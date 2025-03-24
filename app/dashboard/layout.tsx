"use client";
import { ReactNode, useState } from "react";
import Sidenav from "../ui/dashboard/sidenav";
import { Toaster } from "sonner";
import Breadcrumbs from "../ui/dashboard/breadcrumbs";
import { HiMenuAlt2 } from "react-icons/hi";

export default function Layout({ children }: { children: ReactNode }) {
  const [sidenavOpen, setSidenavOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-screen bg-gray-200/80">
      {/* Mobile sidebar - hidden by default, shown when sidebarOpen is true */}
      <div
        className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-linear md:pointer-events-none md:opacity-0 ${
          sidenavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidenavOpen(false)}
      />

      {/* Sidebar for mobile (with animation) */}
      <div
        className={`inset-y-0s fixed left-0 z-50 transform transition duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidenavOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        <Sidenav setSidenavOpen={setSidenavOpen} />
      </div>

      <main className="scrollbar-gutter-stable flex-1 overflow-x-hidden">
        <div className="relative mx-auto h-fit w-full px-4 py-8 text-slate-900 md:px-12">
          <div className="mb-4 flex items-center">
            {/* Toggle button - only visible on mobile */}
            <button
              className="mr-4 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none md:hidden"
              onClick={() => setSidenavOpen(true)}
            >
              <HiMenuAlt2 className="h-6 w-6" />
            </button>
            <Breadcrumbs />
          </div>
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  );
}
