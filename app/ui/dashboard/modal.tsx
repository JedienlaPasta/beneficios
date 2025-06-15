"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
// import { FiX } from "react-icons/fi";

type ModalProps = {
  name: string;
  secondName?: string;
  children: React.ReactNode;
  top?: string;
};

export function Modal({ name, secondName, children }: ModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(name);
    params.delete(secondName || "");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900/50" onClick={handleClick} />
      <div className={`relative z-10 mx-auto h-[90%] w-[95%] sm:w-fit`}>
        <span onClick={handleClick} className="absolute inset-0 -z-10" />
        {children}
      </div>
    </div>
  );
}

// ====================================================================================================================
// Modal para la gestion de usuarios

type UserModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function UserManagementModal({
  title,
  children,
  onClose,
}: UserModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    // Close modal when pressing Escape key
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    // Aqui
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-8 pb-4 pt-6">
          <h3 className="text-lg font-medium text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:text-slate-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="p-8 pt-6">{children}</div>
      </div>
    </div>
  );
}
