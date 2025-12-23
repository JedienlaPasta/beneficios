import { formatNumber, formatPhone, formatRUT } from "@/app/lib/utils/format";
import DetailRow from "../campañas/[id]/detail-card";
import { redirect } from "next/navigation";
import { fetchRSHByRUT } from "@/app/lib/data/rsh";
import { getAge } from "@/app/lib/utils/get-values";
import ChangeNameButton from "./change-name-btn";
import ChangeNameModal from "./change-name-modal";
import { Modal } from "../modal";
import ModalSkeleton from "../../modal-skeleton";
import { Suspense } from "react";
import ChangeTramoButton from "./change-tramo-btn";
import ChangeTramoModal from "./change-tramo-modal";
import EditCitizenContactInfoModal from "./edit-citizen-modal";
import EditButton from "../edit-btn";
import EditCitizenBirthdateModal from "./[id]/edit-modals/edit-birthdate-modal";

type CitizenRecordProps = {
  rut: string;
  isNameModalOpen: boolean;
  isTramoModalOpen: boolean;
  isEditModalOpen: boolean;
  isBirthdateModalOpen: boolean;
};

export default async function CitizenDetail({
  rut,
  isNameModalOpen,
  isTramoModalOpen,
  isEditModalOpen,
  isBirthdateModalOpen,
}: CitizenRecordProps) {
  const response = await fetchRSHByRUT(rut);
  if (!response?.rut) {
    redirect("/dashboard/entregas");
  }
  const {
    dv,
    nombres_rsh,
    apellidos_rsh,
    direccion,
    direccion_mod,
    tramo,
    telefono,
    telefono_mod,
    fecha_nacimiento,
    genero,
    correo,
    correo_mod,
    folio,
    nacionalidad,
  } = response;

  const formattedRut = rut ? formatNumber(rut) + (dv ? "-" + dv : "") : "";
  const descripcion = nombres_rsh[0] + apellidos_rsh[0];

  const age = fecha_nacimiento
    ? getAge(fecha_nacimiento.toString()).toString()
    : "No registrado";

  return (
    <>
      {isNameModalOpen === true && (
        <Suspense fallback={<ModalSkeleton name="changeNameModal" />}>
          <Modal name="changeNameModal">
            <ChangeNameModal
              rut={rut}
              nombres_rsh={nombres_rsh}
              apellidos_rsh={apellidos_rsh}
            />
          </Modal>
        </Suspense>
      )}
      {isTramoModalOpen === true && (
        <Suspense fallback={<ModalSkeleton name="changeTramoModal" />}>
          <Modal name="changeTramoModal">
            <ChangeTramoModal rut={rut} tramo={tramo} />
          </Modal>
        </Suspense>
      )}
      {isEditModalOpen === true && (
        <Suspense fallback={<ModalSkeleton name="editCitizenModal" />}>
          <Modal name="editCitizenModal">
            <EditCitizenContactInfoModal
              name="editCitizenModal"
              citizen={response}
            />
          </Modal>
        </Suspense>
      )}
      {isBirthdateModalOpen === true && (
        <Suspense fallback={<ModalSkeleton name="editBirthdateModal" />}>
          <Modal name="editBirthdateModal">
            <EditCitizenBirthdateModal
              name="editBirthdateModal"
              citizen={response}
            />
          </Modal>
        </Suspense>
      )}

      <div className="items-centers relative flex flex-col justify-center">
        <div className="grid gap-4 rounded-xl">
          {/* Header Section */}
          <div className="flex flex-col items-start justify-between gap-2 rounded-xl bg-white px-3 py-4 sm:flex-row lg:px-8 lg:py-6">
            <div className="flex gap-4">
              <ChangeNameButton description={descripcion} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-800">
                    {nombres_rsh + " " + apellidos_rsh}
                  </h1>
                  <div className="hidden items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 lg:flex">
                    <p className="text-xs font-medium text-slate-500">
                      {"F#" + folio}
                    </p>
                  </div>
                </div>
                <span className="flex items-start gap-2 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 lg:hidden">
                    <p className="text-xs font-medium text-slate-500">
                      {"F#" + folio}
                    </p>
                  </div>
                  {formattedRut}
                </span>
              </div>
            </div>
            <ChangeTramoButton tramo={tramo} />
          </div>

          {/* Details Grid */}
          <div className="grid auto-rows-fr gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-gray-100">
              <h2 className="flex h-14 items-center justify-between px-5 text-sm font-medium text-slate-400 lg:px-8">
                Información General
                <EditButton name="editBirthdateModal" />
              </h2>
              <div className="rounded-xl bg-white px-5 py-1 lg:px-8 lg:py-2">
                <DetailRow
                  name="Nacionalidad"
                  value={nacionalidad || "No especificada"}
                  border={true}
                />
                <DetailRow
                  name="Género"
                  value={genero || "No especificado"}
                  border={true}
                />
                <DetailRow name="Edad" value={age} />
              </div>
            </div>
            {/* 2nd segment */}
            <div className="rounded-xl border border-slate-200 bg-gray-100">
              <h2 className="flex h-14 items-center px-5 text-sm font-medium text-slate-400 lg:px-8">
                Información Contacto RSH
              </h2>
              <div className="rounded-xl bg-white px-5 py-1 lg:px-8 lg:py-2">
                <DetailRow
                  name="Teléfono"
                  value={telefono ? formatPhone(telefono) : "No registrado"}
                  border={true}
                />
                <DetailRow
                  name="Dirección"
                  value={direccion || "No especificada"}
                  border={true}
                />
                <DetailRow name="Correo" value={correo || "No registrado"} />
              </div>
            </div>
            {/* 3rd segment */}
            <div className="rounded-xl border border-slate-200 bg-gray-100 xl:col-span-2 2xl:col-span-1">
              <h2 className="flex h-14 items-center justify-between px-5 text-sm font-medium text-slate-400 lg:px-8">
                Información Contacto Modificado
                <EditButton name="editCitizenModal" />
              </h2>
              <div className="rounded-xl bg-white px-5 py-1 lg:px-8 lg:py-2">
                <DetailRow
                  name="Teléfono"
                  value={
                    telefono_mod ? formatPhone(telefono_mod) : "No registrado"
                  }
                  border={true}
                />
                <DetailRow
                  name="Dirección"
                  value={direccion_mod || "No especificada"}
                  border={true}
                />
                <DetailRow
                  name="Correo"
                  value={correo_mod || "No registrado"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function CitizenDetailSkeleton() {
  return (
    <div className="items-centers relative flex flex-col justify-center">
      <div className="grid gap-4 rounded-xl">
        {/* Header Section */}
        <div className="flex items-center justify-between rounded-xl bg-white px-10 py-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br from-blue-200 to-blue-300 text-base font-medium text-white shadow-sm">
              ##
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="h-7 w-48 animate-pulse rounded-md bg-slate-200"></div>
                <div
                  className={`h-4 w-16 animate-pulse rounded-md bg-slate-200`}
                ></div>
              </div>
              <div className="mt-1 h-5 w-32 animate-pulse rounded-md bg-slate-200"></div>
            </div>
          </div>
          <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200"></div>
        </div>

        {/* Details Grid */}
        <div className="mt-2 grid auto-rows-fr gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información General
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* ID */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Inicio */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Término */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
            </div>
          </div>
          {/* 2nd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información Contacto
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Telefono */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Direccion */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Correo */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
            </div>
          </div>
          {/* 3rd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información General
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Fecha Modificacion */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Fecha Calificacion */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Ultima Entrega */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
