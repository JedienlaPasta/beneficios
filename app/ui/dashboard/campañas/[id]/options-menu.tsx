"use client";
import { useEffect, useRef, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { TbRefresh } from "react-icons/tb";
import { HiDotsHorizontal } from "react-icons/hi";
import { GoStop } from "react-icons/go";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteCampaign } from "@/app/lib/actions/campaña";
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
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("update", "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleDeleteButton = async () => {
    toast.promise(deleteCampaignWithId(), {
      loading: "Eliminando campaña...",
      success: async (response) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setTimeout(() => {
          closeModal;
        }, 500);
        return {
          message: response.message,
        };
      },
      error: () => ({
        message: "Error al eliminar la campaña",
        description: "No se pudo eliminar la campaña. Intente nuevamente.",
      }),
    });
  };

  const dropdownOptionStyle =
    "pl-4 pr-6 py-3 divide-y flex items-center gap-2 cursor-pointer rounded-md group transition-all duration-300";

  // Controladores del dropdown vvvv
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
        <ul className="absolute right-0 top-8 z-10 overflow-hidden text-nowrap rounded-lg border border-slate-200 bg-white p-1 text-sm transition-all">
          <li
            onClick={handleUpdateButton}
            className={`hover:bg-blue-100/80 ${dropdownOptionStyle}`}
          >
            <span className="text-blue-400s rounded-md p-1 transition-all duration-300 group-hover:bg-blue-200/80">
              <TbRefresh className="text-slate-400 group-hover:text-blue-400" />
            </span>
            {"Actualizar Datos"}
          </li>
          <li>
            <button
              onClick={handleDeleteButton}
              className={`w-full hover:bg-red-100/80 ${dropdownOptionStyle}`}
            >
              <span className="rounded-md p-1 transition-all duration-300 group-hover:bg-red-200/80">
                <BiTrash className="text-slate-400 group-hover:text-red-400" />
              </span>
              <span className="border-none text-left">Eliminar Registro</span>
            </button>
          </li>
          <li className={`hover:bg-orange-100/80 ${dropdownOptionStyle}`}>
            <span className="rounded-md p-1 transition-all duration-300 group-hover:bg-orange-200/80">
              <GoStop className="text-slate-400 group-hover:text-orange-400" />
            </span>
            {"Terminar Campaña"}
          </li>
        </ul>
      )}
    </div>
  );
}
