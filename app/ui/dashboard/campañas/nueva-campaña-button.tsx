"use client";
import { FaPlus } from "react-icons/fa6";
// import { FaFolderPlus } from "react-icons/fa6";
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
      className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-12 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 active:scale-95"
    >
      <span>
        <FaPlus />
      </span>{" "}
      Nueva Campaña
    </button>
  );
}
