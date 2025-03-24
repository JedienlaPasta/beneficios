"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function Modal({
  name,
  children,
  position,
}: {
  name: string;
  children: React.ReactNode;
  position?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(name);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (position === "bottom") {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          onClick={handleClick}
        />
        <div className="fixed bottom-0">{children}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={handleClick}
      />
      <div className="fixed flex h-dvh grow items-center">{children}</div>
    </div>
  );
}
