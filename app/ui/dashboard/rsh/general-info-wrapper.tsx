"use client";
import { useRouter, useSearchParams } from "next/navigation";

type InfoCardWrapperProps = {
  children: React.ReactNode;
  disabled?: boolean;
  modal: string;
};

export function InfoCardWrapper({
  children,
  disabled,
  modal,
}: InfoCardWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (modal: string) => {
    if (disabled) return;
    const params = new URLSearchParams(searchParams);
    params.set(modal, "open");
    router.replace("?" + params.toString());
  };

  return (
    <div
      onClick={() => handleClick(modal)}
      className="group relative flex min-w-80 flex-1 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300/70 transition-all duration-300 hover:shadow-lg hover:shadow-slate-400/40"
    >
      {children}
    </div>
  );
}
