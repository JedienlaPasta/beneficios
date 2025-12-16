"use client";
import ModalImportForm from "./modal-import-form";
import CloseModalButton from "../../close-modal-button";
import { FaBoxOpen } from "react-icons/fa6";
import {
  EntregaByFolio,
  EntregasTableByFolio,
  EntregasFiles,
} from "@/app/lib/definitions";
import Link from "next/link";
import { Files } from "./files";
import { formatDate, formatRUT, formatTime } from "@/app/lib/utils/format";
import GetNewFileButton from "./new-file-button";
import DeleteEntregasButton from "./delete-button";
import RoleGuard from "@/app/ui/auth/role-guard";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Camara from "./modal-camera";
import { useRouter, useSearchParams } from "next/navigation";
import { toggleEntregaStatus } from "@/app/lib/actions/entregas";
import { toast } from "sonner";
import DiscardEntregasButton from "./discard_button";
import EditButton from "../../edit-btn";

type Props = {
  rut: string;
  folio: string;
  entregas: EntregasTableByFolio;
  beneficiosEntregados: EntregaByFolio[];
  files: EntregasFiles[];
};

export default function ModalEntregasDetail({
  rut,
  folio,
  entregas,
  beneficiosEntregados,
  files,
}: Props) {
  const [tab, setTab] = useState("Resumen");
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isToggleButtonDisabled, setIsToggleButtonDisabled] = useState(false);

  const formattedRUT = formatRUT(rut);
  const { nombre_usuario, fecha_entrega, observacion, estado_documentos } =
    entregas;

  const router = useRouter();
  const searchParams = useSearchParams();

  let stateColor;
  if (estado_documentos === "Anulado") {
    stateColor = "bg-red-100 text-red-600";
  } else if (estado_documentos === "En Curso") {
    stateColor = "bg-amber-100/60 text-amber-500/90";
  } else if (estado_documentos === "Finalizado") {
    stateColor = "bg-emerald-100 text-emerald-600";
  }

  const handleTabChange = async (newTab: string) => {
    if (newTab !== "Capturar") {
      await setIsModalClosing(true);
    } else {
      await setIsModalClosing(false);
    }
    await setTab(newTab);
    router.refresh();
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleOverlayClick = async () => {
    const params = new URLSearchParams(searchParams);
    params.delete("detailsModal");
    router.replace(`?${params.toString()}`, { scroll: false });
    await setIsModalClosing(true);
  };

  const handleEntregaStatus = async () => {
    setIsToggleButtonDisabled(true);
    const newStatus =
      estado_documentos === "Finalizado" ? "En Curso" : "Finalizado";
    const toastId = toast.loading("Cambiando estado...");
    try {
      const response = await toggleEntregaStatus(folio, newStatus);
      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success(response.message, { id: toastId });
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cambiar el estado de la entrega";
      toast.error(message, { id: toastId });
    } finally {
      setTimeout(() => {
        setIsToggleButtonDisabled(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden">
      <div
        className="fixed inset-0 bg-gray-900/50"
        onClick={handleOverlayClick}
      />
      <div className={`relative z-10 mx-auto w-[95%] sm:w-fit`}>
        <span onClick={handleOverlayClick} className="absolute inset-0 -z-10" />
        <motion.div
          layout
          layoutRoot
          transition={{ layout: { duration: 0.25 } }}
          className="scrollbar-hidex max-h-fulls flex w-[100%] shrink-0 flex-col gap-4 overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all duration-500 sm:w-[34rem] md:p-8"
        >
          {/* Header */}
          <section className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-slate-500">Folio</span>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-700">#{folio}</h2>
                <button
                  onClick={handleEntregaStatus}
                  disabled={isToggleButtonDisabled}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-0.5 ${stateColor}`}
                >
                  <p className="text-xs font-medium">{estado_documentos}</p>
                </button>
              </div>
              <span className="flex gap-1 text-xs text-slate-500">
                Beneficiario: <p className="text-blue-700">{formattedRUT}</p>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GetNewFileButton folio={folio} />
              <CloseModalButton
                name="detailsModal"
                secondName="rut"
                setIsClosing={setIsModalClosing}
              />
            </div>
          </section>

          {/* Tab Navigation */}
          <section className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange("Resumen")}
              className={`relative px-4 py-2 text-sm font-medium outline-none transition-colors ${
                tab === "Resumen"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Resumen
              {tab === "Resumen" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("Importar")}
              className={`relative px-4 py-2 text-sm font-medium outline-none transition-colors ${
                tab === "Importar"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Importar
              {tab === "Importar" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("Capturar")}
              className={`relative px-4 py-2 text-sm font-medium outline-none transition-colors ${
                tab === "Capturar"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Capturar
              {tab === "Capturar" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"></span>
              )}
            </button>
          </section>

          {/* Content */}
          <motion.div
            id="content-container"
            className="scrollbar-hidex relative min-h-[8rem] overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {tab === "Resumen" ? (
                // Resumen ==============================================================
                <motion.div
                  key="resumen"
                  initial={{ opacity: 0, y: 10, height: 460 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 440 }}
                  transition={{
                    duration: 0.3,
                    height: { duration: 0.4 },
                  }}
                  layout
                  className="flex flex-col gap-4"
                >
                  {/* General Info */}
                  <section className="">
                    <div className="grid grid-cols-2 gap-3">
                      <ModalGeneralInfoField
                        name="Encargado"
                        className="rounded-lg border border-gray-200/80 bg-gray-50/70 px-4 py-2"
                      >
                        {nombre_usuario}
                      </ModalGeneralInfoField>
                      <ModalGeneralInfoField
                        name="Fecha de Entrega"
                        className="rounded-lg border border-gray-200/80 bg-gray-50/70 px-4 py-2"
                      >
                        {fecha_entrega ? fecha_entrega : ""}
                      </ModalGeneralInfoField>
                      <ModalGeneralInfoField
                        span="col-span-2"
                        name="Justificación"
                        className="rounded-lg border border-gray-200/80 bg-gray-50/70 px-4 py-2"
                      >
                        {observacion || "No especificada"}
                      </ModalGeneralInfoField>
                    </div>
                  </section>

                  {/* Entregas List */}
                  <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        Beneficios Recibidos{" "}
                        {beneficiosEntregados.length > 3 &&
                          "(" + beneficiosEntregados.length + ")"}
                      </h3>
                      <span className="flex items-center gap-2">
                        <RoleGuard
                          allowedRoles={["Administrador", "Supervisor"]}
                        >
                          <DeleteEntregasButton folio={folio} />
                        </RoleGuard>
                        <RoleGuard
                          allowedRoles={["Administrador", "Supervisor"]}
                        >
                          <DiscardEntregasButton
                            folio={folio}
                            estadoDocumentos={estado_documentos}
                          />
                        </RoleGuard>
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-hide">
                      {beneficiosEntregados.map((item, index) => (
                        <EntregasListItem
                          key={`${item.id_campaña}-${index}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Files List */}
                  <FilesList folio={folio} files={files} />
                </motion.div>
              ) : tab === "Importar" ? (
                // Importar ==============================================================
                <motion.div
                  key="importar"
                  initial={{ opacity: 0, y: 10, height: 440 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 460 }}
                  transition={{
                    duration: 0.3,
                    height: { duration: 0.4 },
                  }}
                  layout
                  className="flex flex-col gap-5"
                >
                  <FilesList folio={folio} files={files} />
                  <div className="border-t border-gray-100"></div>
                  <ModalImportForm folio={folio} savedFiles={files.length} />
                </motion.div>
              ) : tab === "Capturar" ? (
                // Capturar =============================================================
                <motion.div
                  key="capturar"
                  initial={{ opacity: 0, y: 10, height: 440 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    height: "auto",
                    transition: {
                      duration: 0.6,
                      height: { duration: 0.8 },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    height: 460,
                    transition: {
                      duration: 0.5,
                      height: { duration: 0.6 },
                    },
                  }}
                  layout
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col items-start justify-center">
                    <Camara
                      folio={folio}
                      isActive={tab === "Capturar" && !isModalClosing}
                      setTab={setTab}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

interface ModalGeneralInfoFieldProps {
  name: string;
  children: string | Date;
  span?: string;
  className?: string;
}

function ModalGeneralInfoField({
  name,
  children,
  span,
  className,
}: ModalGeneralInfoFieldProps) {
  const value = typeof children === "string" ? children : formatDate(children);
  const hour = children instanceof Date ? formatTime(children) : "";

  return (
    <div className={`${span} ${className || ""}`}>
      <span className="flex items-center justify-between text-xs font-medium text-slate-500/80">
        <p>{name}</p>
        {name === "Justificación" && <EditButton name="justification" />}
        <RoleGuard allowedRoles={["Administrador"]}>
          {name === "Encargado" && <EditButton name="supervisor" />}
        </RoleGuard>
      </span>
      <span className="relative text-sm text-slate-700">
        {value}
        {typeof children === "object" && (
          <p className="absolute left-[calc(100%+7px)] top-0 rounded bg-slate-200/60 px-2 py-0.5 text-xs text-slate-500">
            {hour}
          </p>
        )}
      </span>
    </div>
  );
}

// --- ITEM DE LISTA ACTUALIZADO Y TIPADO SEGURO ---
function EntregasListItem({ item }: { item: EntregaByFolio }) {
  // Definimos el tipo posible para los valores del JSON
  type DetailValue = string | number | boolean | null;

  // 1. Parsear Respuestas (Campos Adicionales) con Type Safety
  let details: Record<string, DetailValue> = {};
  try {
    if (item.campos_adicionales) {
      details = JSON.parse(item.campos_adicionales) as Record<
        string,
        DetailValue
      >;
    }
  } catch (e) {
    console.error("Error parsing details", e);
  }

  // 2. Parsear Esquema (Para obtener los labels bonitos)
  type SchemaField = { nombre: string; label: string };
  let schema: SchemaField[] = [];
  try {
    if (item.esquema_formulario) {
      schema = JSON.parse(item.esquema_formulario) as SchemaField[];
    }
  } catch (e) {
    console.error("Error parsing schema", e);
  }

  // Función para obtener el Label correcto
  const getLabel = (key: string) => {
    const field = schema.find((f) => f.nombre === key);
    return field ? field.label : key.replace(/_/g, " ");
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200/80 bg-gray-50 px-3 py-2.5 transition-colors hover:bg-gray-100/80">
      <div className="flex items-center gap-3">
        <Link
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-all hover:bg-blue-100 hover:shadow"
          href={`/dashboard/campanas/${item.id_campaña}`}
        >
          <FaBoxOpen className="h-5 w-5 text-slate-700 transition-all group-hover:text-blue-500" />
        </Link>

        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            {item.nombre_campaña}
          </h3>
          <p className="w-full max-w-[150px] overflow-hidden text-ellipsis text-nowrap text-xs text-slate-400">
            {item.code ? `Campaña: ${item.code}` : "Campaña General"}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end justify-center gap-0.5 text-right">
        {/* Mostramos el código físico de entrega (ID/Serial) destacado si existe */}
        {/* {item.codigo_entrega && (
          <p className="mb-0.5 text-sm font-bold text-blue-600">
            {item.codigo_entrega}
          </p>
        )} */}

        {/* Detalles dinámicos iterados */}
        {Object.entries(details).map(([key, value]) => {
          return (
            <p key={key} className="text-xs text-slate-500">
              <span className="font-medium capitalize text-slate-600">
                {getLabel(key)}:
              </span>{" "}
              {String(value)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function FilesList({
  folio,
  files,
}: {
  folio: string;
  files: EntregasFiles[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
          Documentos Adjuntos
        </h3>
      </div>

      {files.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200/80 bg-gray-50/70 p-4 shadow-sm sm:grid-cols-2">
          {files.map((item: EntregasFiles, index) => (
            <Files key={index} item={item} folio={folio} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-sm text-gray-400">
          <svg
            className="h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No hay documentos adjuntos</p>
        </div>
      )}
    </div>
  );
}
