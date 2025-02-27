"use client";

import { useRouter } from "next/navigation";
// import { useEffect } from "react";

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  //   useEffect(() => {
  //     document.body.style.overflow = 'hidden';
  //     return () => {
  //       document.body.style.overflow = 'unset';
  //     };
  //   }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={() => router.back()}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  );
}
