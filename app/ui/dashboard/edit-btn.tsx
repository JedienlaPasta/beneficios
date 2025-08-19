"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function EditButton({ name }: { name: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set(name, "true");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 rounded-md text-sm font-medium text-slate-400 transition-all hover:text-blue-500 active:scale-95"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-edit"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
      </svg>
    </button>
  );
}
