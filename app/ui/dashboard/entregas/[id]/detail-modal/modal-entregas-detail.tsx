"use client";
import CloseModalButton from "../../../close-modal-button";
import { FaBoxOpen } from "react-icons/fa6";
import {
  EntregaByFolio,
  EntregasTableByFolio,
  EntregasFiles,
} from "@/app/lib/definitions";
import Link from "next/link";
import { Files } from "./files";
import { formatDate, formatRUT, formatTime } from "@/app/lib/utils/format";
import RoleGuard from "@/app/ui/auth/role-guard";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toggleEntregaStatus } from "@/app/lib/actions/entregas";
import { toast } from "sonner";
import EditButton from "../../../edit-btn";
import { getRshName } from "@/app/lib/actions/rsh";
import CamaraComponent from "./modal-camera";
import GetNewFileButton from "./new-file-button";
import ModalImportForm from "./modal-import-form";
import DetailsModalOptionsMenu from "./modal-options-menu";

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

  const [rshName, setRshName] = useState<string>("");
  useEffect(() => {
    let isMounted = true;

    const fetchName = async () => {
      try {
        const response = await getRshName(rut);
        // getRshName retorna el objeto directo de la DB { nombres_rsh, apellidos_rsh }
        if (
          response &&
          typeof response === "object" &&
          "nombres_rsh" in response
        ) {
          const { nombres_rsh, apellidos_rsh } = response as {
            nombres_rsh: string;
            apellidos_rsh: string;
          };

          if (isMounted) {
            // Formateamos para mostrar Primer Nombre + Primer Apellido
            setRshName(`${nombres_rsh} ${apellidos_rsh}`);
          }
        }
      } catch (error) {
        console.error("Error fetching RSH name", error);
      }
    };

    if (rut) fetchName();

    return () => {
      isMounted = false;
    };
  }, [rut]);

  let stateColor;
  if (estado_documentos === "Anulado") {
    stateColor = "bg-rose-100/60 text-rose-600 ring-rose-100";
  } else if (estado_documentos === "En Curso") {
    stateColor = "bg-amber-100/60 text-amber-500/90 ring-amber-100";
  } else if (estado_documentos === "Finalizado") {
    stateColor = "bg-emerald-100/60 text-emerald-600 ring-emerald-100";
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
    <motion.div
      layout
      layoutRoot
      transition={{ layout: { duration: 0.25 } }}
      className="w-[38rem] max-w-full flex-1 shrink-0 overflow-hidden bg-white p-4 shadow-xl ring-1 ring-slate-200/70 transition-all duration-500 scrollbar-hide sm:rounded-3xl sm:bg-gray-50 sm:p-6 md:p-8"
    >
      {/* Header & Hero Section */}
      <div className="mb-3 flex flex-col gap-4">
        {/* Top Bar: Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-600">
              Detalle de Entrega
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-700">#{folio}</span>
          </div>
          <div className="flex items-center gap-2">
            <RoleGuard allowedRoles={["Administrador", "Supervisor"]}>
              <DetailsModalOptionsMenu
                folio={folio}
                estadoDocs={estado_documentos}
              />
            </RoleGuard>
            <div className="mx-1 h-4 w-px bg-slate-300"></div>
            <CloseModalButton
              name="detailsModal"
              secondName="rut"
              setIsClosing={setIsModalClosing}
            />
          </div>
        </div>

        {/* Beneficiario Card */}
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex items-center gap-4">
            <div className="flex flex-col">
              <Link
                href={`/dashboard/entregas/${rut}`}
                className="font-bold leading-tight text-slate-800 hover:cursor-pointer hover:underline sm:text-lg"
              >
                {rshName || (
                  <span className="animate-pulse rounded bg-slate-200 text-transparent">
                    Cargando Nombre...
                  </span>
                )}
              </Link>
              <div className="mt-1 flex items-center gap-3 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-500">
                  RUT:{" "}
                  <p className="font-medium text-slate-700">{formattedRUT}</p>
                </span>
              </div>
            </div>
          </div>

          {/* Status Action */}
          <div className="flex items-center gap-2 pl-2 sm:pl-0">
            <p className="text-xs text-slate-400">Estado</p>
            <button
              onClick={handleEntregaStatus}
              disabled={isToggleButtonDisabled}
              className={`group flex items-center gap-2 rounded-full py-1 pl-2 pr-3 text-xs font-medium ring-1 ring-inset transition-all hover:ring-2 active:scale-95 disabled:opacity-70 ${stateColor} ${
                isToggleButtonDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current"></span>
              </span>
              {estado_documentos}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav
        className="mx-0.5 mt-2 flex border-b border-slate-200/80"
        role="tablist"
      >
        {["Resumen", "Importar", "Capturar"].map((name) => (
          <button
            key={name}
            role="tab"
            onClick={() => handleTabChange(name)}
            aria-selected={tab === name}
            className={`relative px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
              tab === name
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {name}
            {tab === name && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <motion.div
        id="content-container"
        className="scrollbar-hides relative min-h-[8rem] overflow-hidden pt-4"
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
              className="flex flex-col gap-3"
            >
              {/* General Info */}
              <section className="">
                <div className="grid grid-cols-2 gap-1">
                  <ModalGeneralInfoField
                    name="Encargado"
                    className="rounded-lg border border-slate-200/80 bg-white/80 px-3.5 py-2.5"
                  >
                    {nombre_usuario}
                  </ModalGeneralInfoField>
                  <ModalGeneralInfoField
                    name="Fecha de Entrega"
                    className="rounded-lg border border-slate-200/80 bg-white/80 px-3.5 py-2.5"
                  >
                    {fecha_entrega ? fecha_entrega : ""}
                  </ModalGeneralInfoField>
                  <ModalGeneralInfoField
                    span="col-span-2"
                    name="Justificación"
                    className="rounded-lg border border-slate-200/80 bg-white/80 px-3.5 py-2.5"
                  >
                    {observacion || "No especificada"}
                  </ModalGeneralInfoField>
                </div>
              </section>

              {/* Entregas List */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    Beneficios Recibidos
                  </h3>
                </div>
                <div className="scrollbar-hides flex flex-col gap-1">
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
                <CamaraComponent
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
      <span className="relative text-[13px] text-slate-700 sm:text-sm">
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

  // 2. Parsear Esquema (Para obtener los labels)
  type SchemaField = { nombre: string; label: string };
  let schema: SchemaField[] = [];
  try {
    if (item.esquema_formulario) {
      schema = JSON.parse(item.esquema_formulario) as SchemaField[];
    }
  } catch (e) {
    console.error("Error parsing schema", e);
  }

  const getLabel = (key: string) => {
    const field = schema.find((f) => f.nombre === key);
    return field ? field.label : key.replace(/_/g, " ");
  };

  return (
    <div className="group flex items-start justify-between gap-4 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2.5 transition-colors hover:shadow-sm">
      <div className="flex items-center gap-3">
        <Link
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/70 transition-all hover:bg-blue-100"
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
        {/* Detalles dinámicos iterados */}
        {Object.entries(details).map(([key, value]) => (
          <p key={key} className="text-xs text-slate-500">
            <span className="font-medium capitalize text-slate-700">
              {getLabel(key)}:
            </span>{" "}
            {String(value)}
          </p>
        ))}
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          Documentos Adjuntos
        </h3>
        <GetNewFileButton folio={folio} />
      </div>

      {files.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm sm:grid-cols-2">
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
