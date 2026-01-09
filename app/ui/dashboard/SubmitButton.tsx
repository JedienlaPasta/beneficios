"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export function SubmitButton({
  children,
  isDisabled,
}: {
  children: string | React.JSX.Element;
  isDisabled: boolean;
}) {
  const btnText = children;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`flex h-10 grow items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-95 ${
        isDisabled
          ? "cursor-not-allowed bg-slate-300 text-slate-500"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {btnText}
    </button>
  );
}

export function CancelButton({
  name,
  isDisabled,
}: {
  name: string;
  isDisabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(name);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = () => {
    closeModal();
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={handleSubmit}
      className="sborder flex h-10 grow items-center justify-center rounded-lg border-transparent bg-gray-200 text-sm font-medium text-slate-800 transition-all hover:border-slate-300/60 hover:bg-slate-100 active:scale-95"
    >
      Cancelar
    </button>
  );
}
