"use client";

import { useRouter } from "next/navigation";
// import { useEffect } from "react";

export default function Modal({
  children,
  position,
}: {
  children: React.ReactNode;
  position?: string;
}) {
  const router = useRouter();

  if (position === "bottom") {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          onClick={() => router.back()}
        />
        <div className="fixed bottom-0">{children}</div>
      </div>
    );
  }

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
