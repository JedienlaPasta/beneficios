"use client";
import { useEffect, useRef, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { TbRefresh } from "react-icons/tb";
import { HiDotsHorizontal } from "react-icons/hi";
import { GoStop } from "react-icons/go";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteCampaign } from "@/app/lib/actions";
import { toast } from "sonner";

export default function CampaignOptionsMenu({ id }: { id: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const deleteCampaignWithId = deleteCampaign.bind(null, id);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUpdateButton = () => {
    const params = new URLSearchParams(searchParams);
    params.set("update", "open");
    router.push(`?${params.toString()}`);
  };

  // Remove the formData parameter since it's not being used
  const handleDeleteButton = async () => {
    try {
      const response = await deleteCampaignWithId();
      if (response.success) {
        toast.success(response.message);
        setTimeout(() => {
          router.back();
        }, 300);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al eliminar la campaña");
    }
  };

  // Controladores del dropdown vvvv

  const dropdownOptionStyle =
    "pl-4 pr-6 py-4 hover:bg-gray-200/75 divide-y flex items-center gap-2 cursor-pointer";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };
  return (
    <div
      ref={modalRef}
      onClick={toggleModal}
      className="relative cursor-pointer select-none text-xl"
    >
      <HiDotsHorizontal className="borders h-7 w-7 flex-1 rounded-md bg-gray-200/75 p-1 hover:bg-gray-200" />
      {modalOpen && (
        <ul className="absolute right-0 top-8 z-10 overflow-hidden text-nowrap rounded-lg border border-slate-200 bg-white text-sm transition-all">
          <li onClick={handleUpdateButton} className={dropdownOptionStyle}>
            <span className="rounded-md bg-blue-200 p-1 text-blue-500">
              <TbRefresh />
            </span>
            {"Actualizar Datos"}
          </li>
          <li>
            <button
              onClick={handleDeleteButton}
              className={`w-full ${dropdownOptionStyle}`}
            >
              <span className="rounded-md bg-red-200 p-1 text-red-500">
                <BiTrash />
              </span>
              <span className="border-none text-left">Eliminar Registro</span>
            </button>
          </li>
          <li className={dropdownOptionStyle}>
            <span className="rounded-md bg-orange-100 p-1 text-orange-500">
              <GoStop />
            </span>
            {"Terminar Campaña"}
          </li>
        </ul>
      )}
    </div>
  );
}
