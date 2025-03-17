"use client";
import clsx from "clsx";
import { useRouter } from "next/navigation";

export function SubmitButton({
  children,
  isDisabled,
  isLoading,
  setIsDisabled,
}: {
  children: string;
  isDisabled: boolean;
  isLoading?: boolean;
  setIsDisabled: (
    prevState: boolean | ((prevState: boolean) => boolean),
  ) => void;
}) {
  const btnText = isDisabled ? children : "Guardar";

  const handleSubmit = () => {
    setTimeout(() => {
      setIsDisabled(true);
    }, 50);
  };

  return (
    <button
      type="submit"
      disabled={isDisabled}
      onClick={handleSubmit}
      className={clsx(
        "flex h-10 grow items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-95",
        {
          "cursor-not-allowed bg-slate-300 text-slate-500":
            isDisabled && !isLoading,
          "bg-blue-500 text-white hover:bg-blue-600": !isDisabled,
          "animate-pulse cursor-not-allowed bg-blue-400 text-slate-100":
            isLoading && isDisabled,
        },
      )}
    >
      {btnText}
    </button>
  );
}

export function CancelButton({
  isDisabled,
  setIsDisabled,
}: {
  isDisabled: boolean;
  setIsDisabled: (
    prevState: boolean | ((prevState: boolean) => boolean),
  ) => void;
}) {
  const router = useRouter();
  console.log(isDisabled);

  const handleSubmit = () => {
    setIsDisabled(true);
    router.back();
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={handleSubmit}
      className="flex h-10 grow items-center justify-center rounded-lg bg-gray-200 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 active:scale-95"
    >
      Cancelar
    </button>
  );
}
