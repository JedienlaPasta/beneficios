"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { BiEdit, BiTrash } from "react-icons/bi";

export default function CrudButton({ to }: { to?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set("updateModal", "open");
    router.push(`?${params.toString()}`);
  };

  const buttonStyle =
    "text-xl rounded-md bg-slate-200 p-1 h-7 w-7 hover:bg-slate-300 cursor-pointer";

  if (to) {
    return (
      <button onClick={handleClick}>
        <BiEdit className={buttonStyle} />
      </button>
    );
  }
  return (
    <button type="submit">
      <BiTrash className={buttonStyle} />
    </button>
  );
}
