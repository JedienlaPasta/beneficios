"use client";

import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect } from "react";

export default function Modal({
  name,
  children,
  position,
}: {
  name: string;
  children: React.ReactNode;
  position?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(name, "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (position === "bottom") {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          onClick={handleClick}
        />
        <div className="fixed bottom-0">{children}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={handleClick}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  );
}
