"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MdModeEdit } from "react-icons/md";

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
      title="Editar"
      className="absolute right-1.5 top-1.5 flex w-fit items-center self-end rounded-md border border-transparent p-1 text-xs text-slate-400 transition-all hover:border-slate-200 hover:text-blue-600 hover:shadow-sm active:scale-95"
    >
      <MdModeEdit className="size-4" />
    </button>
  );
}
