"use client";
import { Edit3 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ChangeNameButton({
  description,
}: {
  description: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const openEditNameModal = () => {
    const params = new URLSearchParams(searchParams);
    params.set("changeNameModal", "true");
    router.replace(`?${params.toString()}`);
  };

  return (
    <p
      onClick={openEditNameModal}
      className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-medium text-white shadow-sm transition-all duration-200 hover:from-blue-600/90 hover:to-blue-700/90 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <Edit3 size={16} className="transition-all duration-200" />
      ) : (
        <span className="transition-all duration-200">{description}</span>
      )}
    </p>
  );
}
