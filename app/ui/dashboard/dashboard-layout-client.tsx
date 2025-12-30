"use client";
import React, { useEffect, useState } from "react";
import Sidenav from "./sidenav";
import { HiMenuAlt2 } from "react-icons/hi";
import { Toaster } from "sonner";
import { UserData } from "@/app/lib/definitions";
import SibasLogo from "./sibas-logo";

export default function DashboardLayoutClient({
  children,
  userData,
}: {
  children: React.ReactNode;
  userData: UserData;
}) {
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const [toastPosition, setToastPosition] = useState<
    "top-center" | "bottom-right"
  >("bottom-right");

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth < 768) {
        setToastPosition("top-center");
      } else {
        setToastPosition("bottom-right");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

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
        <div className="flex h-20 items-center justify-between bg-[#171a1f] px-4 text-slate-300 md:hidden">
          <SibasLogo />
          <button
            className="rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-gray-100 focus:outline-none md:hidden"
            onClick={() => setSidenavOpen(true)}
          >
            <HiMenuAlt2 className="h-6 w-6" />
          </button>
        </div>
        <div className="relative mx-auto h-fit w-full px-4 py-4 text-slate-900 md:px-12 md:py-8">
          <div className="mb-4 flex flex-col items-start gap-2 3xl:w-[96rem] 3xl:justify-self-center">
            {/* Toggle button - only visible on mobile */}
            {/* <button
              className="mr-4 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none md:hidden"
              onClick={() => setSidenavOpen(true)}
            >
              <HiMenuAlt2 className="h-6 w-6" />
            </button> */}
            {children}
          </div>
          <Toaster position={toastPosition} />
        </div>
      </main>
    </div>
  );
}
