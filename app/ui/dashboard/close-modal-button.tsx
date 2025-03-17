"use client";
import { useRouter } from "next/navigation";
import { RiCloseLine } from "react-icons/ri";

export default function CloseModalButton() {
  const router = useRouter();
  return (
    <RiCloseLine
      className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
      onClick={() => router.back()}
    />
  );
}
