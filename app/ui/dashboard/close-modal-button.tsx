"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { RiCloseLine } from "react-icons/ri";

type Props = {
  name: string;
  secondName?: string;
  setIsClosing?: (close: boolean) => void;
};

export default function CloseModalButton({
  name,
  secondName,
  setIsClosing,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = async () => {
    if (setIsClosing) {
      setIsClosing(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const params = new URLSearchParams(searchParams);
    params.delete(name);
    params.delete(secondName || "");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <RiCloseLine
      className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
      onClick={closeModal}
    />
  );
}
