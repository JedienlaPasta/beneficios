"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

type ModalProps = {
  name: string;
  children: React.ReactNode;
  top?: string;
};

export function Modal({ name, children }: ModalProps) {
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
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900/50" onClick={handleClick} />
      <div className={`relative z-10 h-[90%]`}>
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
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="p-8 pt-6">{children}</div>
      </div>
    </div>
  );
}
