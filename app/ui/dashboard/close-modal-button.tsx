"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { RiCloseLine } from "react-icons/ri";

export default function CloseModalButton({ name }: { name: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    console.log(name);
    params.delete(name);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <RiCloseLine
      className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
      onClick={closeModal}
    />
  );
}
