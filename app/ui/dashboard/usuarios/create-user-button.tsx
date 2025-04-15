"use client";

import { useState } from "react";
import { CreateUserModal } from "./create-user-modal";

export function CreateUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex h-10 items-center gap-2 text-nowrap rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 px-8 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 active:scale-95"
      >
        {/* <FiPlus className="h-4 w-4" /> */}
        Nuevo Usuario
      </button>

      {isModalOpen && <CreateUserModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
