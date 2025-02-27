"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function NuevaCampañaButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set("modal", "open");
    router.push(`?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-600 active:scale-95"
    >
      <span className="text-lg">+</span> Nueva Campaña
    </button>
  );
}
