"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function ChangeTramoButton({ tramo }: { tramo: number | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const openEditTramoModal = () => {
    const params = new URLSearchParams(searchParams);
    params.set("changeTramoModal", "true");
    router.replace(`?${params.toString()}`);
  };

  return (
    <span
      onClick={openEditTramoModal}
      className="flex cursor-pointer flex-col place-self-center text-slate-500 sm:place-self-end"
    >
      <p className="text-xs uppercase tracking-wider">Tramo</p>
      <p className="text-2xl font-bold text-slate-600">{tramo}%</p>
    </span>
  );
}
