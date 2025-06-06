"use client";
import { RSH } from "@/app/lib/definitions";
import React, { useState } from "react";
import { formatDate, formatPhone, formatRUT } from "@/app/lib/utils/format";
import CloseModalButton from "../close-modal-button";
import { AnimatePresence, motion } from "framer-motion";
import { getAge } from "@/app/lib/utils/get-values";
import RoleGuard from "../../auth/role-guard";
import DeleteRSHButton from "./delete-rsh-button";
import { SubmitButton } from "../submit-button";
import Input from "../campañas/new-campaign-input";
import { useRouter, useSearchParams } from "next/navigation";
import { updateRSH } from "@/app/lib/actions/rsh";
import { toast } from "sonner";

type ModalProps = {
  name: string;
  citizen: RSH;
};

export default function CitizenDetailModal({ citizen }: ModalProps) {
  const [tab, setTab] = useState("Personal");
  const tabs = ["Personal", "Adicional"];
  const { rut, folio } = citizen;

  const [isEditing, setIsEditing] = useState(false);
  const toggleEditForm = () => {
    setIsEditing((prev) => !prev);
    setTab("Personal");
  };

  return (
    <motion.div
      layout
      layoutRoot
      transition={{ layout: { duration: 0.25 } }}
      className="flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-white p-8 shadow-xl" // Removed scrollbar-hide from here
    >
      {/* Header */}
      <section className="flex flex-shrink-0 items-center justify-between">
        {" "}
        <div className="flex flex-col items-start justify-between">
          <span className="text-xs font-medium text-slate-500">Folio</span>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-700">#{folio}</h2>
          </div>
          <span className="flex gap-1 text-xs text-slate-500">
            RUT: <p className="text-blue-700">{rut ? formatRUT(rut) : ""}</p>
          </span>
        </div>
        <CloseModalButton name="citizen" />
      </section>

      {/* Tab Navigation */}
      <section className="relative flex items-center justify-between border-b border-gray-200">
        {" "}
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.span
              key="view-tab-buttons"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{
                duration: 0.3,
              }}
            >
              {tabs.map((currentTab, index) => (
                <button
                  key={index}
                  onClick={() => setTab(currentTab)}
                  className={`relative px-4 py-2 text-sm font-medium outline-none transition-colors ${
                    currentTab === tab
                      ? "text-blue-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {currentTab}
                  {currentTab === tab && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              ))}
            </motion.span>
          ) : (
            <motion.span
              key="edit-tab-buttons"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{
                duration: 0.3,
              }}
            >
              <button
                className={`relative px-4 py-2 text-sm font-medium text-blue-600 outline-none transition-colors`}
              >
                {"Contacto"}
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"
                  transition={{ duration: 0.2 }}
                />
              </button>
            </motion.span>
          )}
        </AnimatePresence>
      </section>

      <div className="flex justify-between">
        <h3 className="flex items-center gap-3 py-2 text-sm font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
          {isEditing
            ? "Información de Contacto"
            : tab === "Personal"
              ? "Información Personal"
              : "Información Adicional"}
        </h3>
        <span className="flex items-center gap-3">
          <RoleGuard allowedRoles={["Administrador", "Supervisor"]}>
            <DeleteRSHButton rut={citizen.rut} />
            <ToggleUpdateFormButton handleClick={toggleEditForm} />
          </RoleGuard>
        </span>
      </div>

      <section className="overflow-y-auto scrollbar-hide">
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="update-form"
              initial={{ opacity: 0, y: 10, height: 340 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 220 }}
              transition={{ duration: 0.4 }}
            >
              <UpdateForm citizen={citizen} />
            </motion.div>
          ) : (
            <motion.div
              key="rsh-content"
              initial={{ opacity: 0, y: 10, height: 220 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 340 }}
              transition={{ duration: 0.4 }}
            >
              <RSHContent citizen={citizen} tab={tab} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

function ToggleUpdateFormButton({ handleClick }: { handleClick: () => void }) {
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 transition-all duration-300 hover:border-blue-200 hover:bg-blue-100/70 active:scale-95"
    >
      Editar
    </button>
  );
}

type UpdateFormProps = {
  citizen: RSH;
};

function UpdateForm({ citizen }: UpdateFormProps) {
  const [direccion, setDireccion] = useState(
    citizen?.direccion_mod || citizen?.direccion || "",
  );
  const [sector, setSector] = useState(
    citizen?.sector_mod || citizen?.sector || "",
  );
  const [telefono, setTelefono] = useState(
    String(citizen?.telefono_mod || citizen?.telefono || ""),
  );
  const [correo, setCorreo] = useState(
    citizen?.correo_mod || citizen?.correo || "",
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("citizen");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();

    myFormData.append("rut", String(citizen.rut));
    myFormData.append("direccion", direccion);
    myFormData.append("sector", sector);
    myFormData.append("telefono", telefono);
    myFormData.append("correo", correo);

    const toastId = toast.loading("Guardando...");
    try {
      const response = await updateRSH(myFormData);
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message, { id: toastId });
      closeModal();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear el registro";
      toast.error(message, { id: toastId });
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return direccion.trim() !== "";
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-y-auto scrollbar-hide">
      <motion.div className="relative grid min-h-[6rem] gap-6">
        <AnimatePresence mode="wait">
          <motion.section
            key="opcional"
            initial={{ opacity: 0, y: 10, height: 290 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 270 }}
            transition={{
              duration: 0.4,
              height: { duration: 0.4 },
              ease: "easeInOut",
            }}
            layout
          >
            <div className="flex flex-col gap-5 pt-2">
              <Input
                placeHolder="Dirección completa"
                label="Dirección *"
                type="text"
                nombre="direccion"
                value={direccion}
                setData={setDireccion}
                required
              />

              <div className="flex grow gap-3">
                <Input
                  placeHolder="Sector"
                  label="Sector"
                  type="text"
                  nombre="sector"
                  value={sector}
                  setData={setSector}
                />
                <Input
                  placeHolder="912345678"
                  label="Teléfono"
                  type="text"
                  pattern="[0-9]*"
                  maxLength={9}
                  nombre="telefono"
                  value={telefono}
                  setData={setTelefono}
                />
              </div>

              <Input
                placeHolder="correo@ejemplo.com"
                label="Correo Electrónico"
                type="email"
                nombre="correo"
                value={correo}
                setData={setCorreo}
              />
            </div>
          </motion.section>
        </AnimatePresence>
        <div className="z-10 flex">
          <SubmitButton isDisabled={isDisabled || !isFormValid()}>
            {isLoading ? "Guardando..." : "Guardar"}
          </SubmitButton>
        </div>
      </motion.div>
    </form>
  );
}

function RSHContent({ citizen, tab }: { citizen: RSH; tab: string }) {
  return (
    <motion.div className="relative min-h-[8rem]">
      <AnimatePresence mode="wait">
        {tab === "Personal" && (
          <motion.section
            key="personal"
            initial={{ opacity: 0, y: 10, height: 210 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 200 }}
            transition={{
              duration: 0.4,
              height: { duration: 0.4 },
              ease: "easeInOut",
            }}
            layout
          >
            <div className="mt-2 grid grid-cols-3 gap-5 rounded-xl border border-gray-200/80 bg-gray-50/70 p-6 shadow-sm">
              <div className="col-span-2 flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">
                  Nombre Completo
                </p>
                <p className="text-sm text-slate-800">
                  {citizen.nombres_rsh} {citizen.apellidos_rsh}
                </p>
              </div>

              <span className="col-span-3 border-t border-gray-200/80" />

              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">
                  Nacionalidad
                </p>
                <p className="text-sm text-slate-800">
                  {citizen.nacionalidad || "No especificada"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">Tramo</p>
                <p className="text-sm text-slate-800">{citizen.tramo}%</p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">Edad</p>
                <p className="text-sm text-slate-800">
                  {citizen.fecha_nacimiento
                    ? getAge(String(citizen.fecha_nacimiento))
                    : "No registrada"}
                </p>
              </div>

              <span className="col-span-3 border-t border-gray-200/80" />

              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">
                  Pueblo Indígena
                </p>
                <p className="text-sm text-slate-800">
                  {citizen.indigena || "No especificado"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">Género</p>
                <p className="text-sm text-slate-800">
                  {citizen.genero || "No especificado"}
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {tab === "Adicional" && (
          <motion.section
            key="adicional"
            initial={{ opacity: 0, y: 10, height: 200 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 210 }}
            transition={{
              duration: 0.4,
              height: { duration: 0.4 },
              ease: "easeInOut",
            }}
            layout
          >
            <div className="mt-2 grid grid-cols-6 gap-4 rounded-xl border border-gray-200/80 bg-gray-50/70 p-6 shadow-sm">
              <div className="col-span-4 flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">Dirección</p>
                <p className="text-sm text-slate-800">
                  {citizen?.direccion_mod || citizen?.direccion || ""}
                </p>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">
                  Fecha Calificación
                </p>
                <p className="text-sm text-slate-800">
                  {citizen.fecha_calificacion
                    ? formatDate(new Date(citizen.fecha_calificacion))
                    : "No registrada"}
                </p>
              </div>

              <span className="col-span-6 border-t border-gray-200/80" />

              <div className="col-span-4 flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">Sector</p>
                <p className="text-sm text-slate-800">
                  {citizen?.sector_mod || citizen?.sector || "No especificado"}
                </p>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">
                  Última Modificación
                </p>
                <p className="text-sm text-slate-800">
                  {citizen.fecha_modificacion
                    ? formatDate(new Date(citizen.fecha_modificacion))
                    : "No registrada"}
                </p>
              </div>

              <span className="col-span-6 border-t border-gray-200/80" />

              <div className="col-span-4 flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">
                  Correo Electrónico
                </p>
                <p className="text-sm text-slate-800">
                  {citizen?.correo_mod || citizen?.correo || "No registrado"}
                </p>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-500">Teléfono</p>
                <p className="text-sm text-slate-800">
                  {formatPhone(citizen?.telefono_mod || citizen?.telefono) ||
                    "No registrado"}
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
