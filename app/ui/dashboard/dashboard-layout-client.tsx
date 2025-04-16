"use client";
import React, { useState } from "react";
import Sidenav from "./sidenav";
import { HiMenuAlt2 } from "react-icons/hi";
import { Toaster } from "sonner";
import { UserData } from "@/app/lib/definitions";

export default function DashboardLayoutClient({
  children,
  userData,
}: {
  children: React.ReactNode;
  userData: UserData;
}) {
  const [sidenavOpen, setSidenavOpen] = useState(false);

  return (
    <div className="min-h-screens flex min-h-svh">
      {/* Mobile sidebar - hidden by default, shown when sidebarOpen is true */}
      <div
        className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-linear md:pointer-events-none md:opacity-0 ${
          sidenavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidenavOpen(false)}
      />

      {/* Sidebar for mobile (with animation) */}
      <div
        className={`md:relatives fixed inset-y-0 left-0 z-50 transform transition duration-300 ease-in-out md:translate-x-0 ${
          sidenavOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        <Sidenav setSidenavOpen={setSidenavOpen} userData={userData} />
      </div>
      <div className="z-0 hidden w-72 md:block"></div>

      <main className="scrollbar-gutter-stable flex-1 overflow-x-hidden">
        <div className="relative mx-auto h-fit w-full px-4 py-8 text-slate-900 md:px-12">
          <div className="mb-4 flex flex-col items-start gap-2 3xl:w-[96rem] 3xl:justify-self-center">
            {/* Toggle button - only visible on mobile */}
            <button
              className="mr-4 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none md:hidden"
              onClick={() => setSidenavOpen(true)}
            >
              <HiMenuAlt2 className="h-6 w-6" />
            </button>
            {children}
          </div>
          <Toaster />
        </div>
      </main>
    </div>
  );
}
