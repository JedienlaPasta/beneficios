"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Input from "@/app/ui/dashboard/campañas/new-campaign-modal/NewCampaignInput";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import CustomAntdDatePicker from "@/app/ui/dashboard/datepicker";
import { SubmitButton } from "../submit-button";
import { createRSH } from "@/app/lib/actions/rsh";
import CloseModalButton from "../close-modal-button";

export type FormState = {
  success?: boolean;
  message?: string;
};

export default function NewCitizenModal({ name }: { name: string }) {
  const [rut, setRut] = useState("");
  // const [dv, setDv] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [direccion, setDireccion] = useState("");
  const [sector, setSector] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [tramo, setTramo] = useState("");
  const [genero, setGenero] = useState("");
  const [indigena, setIndigena] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [folio, setFolio] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [tab, setTab] = useState("Obligatorio");
  const tabs = ["Obligatorio", "Opcional"];
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(name);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Verificar Fecha UTC?
  const fechaNacimientoHandler = (pickerDate: dayjs.Dayjs | null) => {
    if (pickerDate) {
      setFechaNacimiento(pickerDate.toDate());
    } else {
      setFechaNacimiento(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();

    myFormData.append("rut", rut);
    // myFormData.append("dv", dv);
    myFormData.append("nombres_rsh", nombres);
    myFormData.append("apellidos_rsh", apellidos);
    myFormData.append("direccion", direccion);
    myFormData.append("sector", sector);
    myFormData.append("telefono", telefono);
    myFormData.append("correo", correo);
    myFormData.append("tramo", tramo);
    myFormData.append("genero", genero);
    myFormData.append("indigena", indigena);
    myFormData.append("nacionalidad", nacionalidad);
    myFormData.append("folio", folio);
    myFormData.append("fechaNacimiento", fechaNacimiento?.toString() || "");

    const toastId = toast.loading("Guardando...");
    try {
      const response = await createRSH(myFormData);
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

  // Formateo RUT
  const formatRutLive = (input: string) => {
    const cleaned = input.replace(/[^0-9kK]/g, "").toUpperCase();
    if (!cleaned) return { display: "", rutDigits: "" };
    const maybeDv = cleaned.slice(-1);
    const hasDv = cleaned.length > 1 && /[0-9K]/.test(maybeDv);
    const rutDigits = hasDv ? cleaned.slice(0, -1) : cleaned;
    const withDots = rutDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const display = hasDv ? `${withDots}-${maybeDv}` : withDots;
    return { display, rutDigits };
  };

  const isFormValid = () => {
    return (
      rut.trim() !== "" &&
      // dv.trim() !== "" &&
      nombres.trim() !== "" &&
      apellidos.trim() !== "" &&
      direccion.trim() !== "" &&
      tramo.trim() !== "" &&
      folio.trim() !== "" &&
      fechaNacimiento !== null
    );
  };

  return (
    <motion.div
      layout
      layoutRoot
      transition={{ layout: { duration: 0.25 } }}
      className="flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-white p-8 shadow-xl"
    >
      {/* Header */}
      <section className="flex flex-shrink-0 items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-700">
          Ingresar Registro Social de Hogares
        </h2>
        <CloseModalButton name="newcitizen" />
      </section>
      <p className="text-xs text-gray-500">
        Los campos marcados con (*) son obligatorios.
      </p>

      {/* Tab Navigation */}
      <section className="relative flex items-center justify-between border-b border-gray-200">
        {" "}
        <AnimatePresence>
          <motion.span
            key="tab-buttons"
            transition={{
              duration: 0.4,
              height: { duration: 0.4 },
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
        </AnimatePresence>
      </section>

      <form onSubmit={handleSubmit}>
        <motion.div className="relative grid min-h-[6rem] gap-6">
          <AnimatePresence mode="wait">
            {tab === "Obligatorio" && (
              <motion.section
                key="obligatorio"
                initial={{ opacity: 0, y: 10, height: 270 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 290 }}
                transition={{
                  duration: 0.4,
                  height: { duration: 0.4 },
                  ease: "easeInOut",
                }}
                className="flex flex-col gap-5"
                layout
              >
                {/* Verificar Estilo */}
                <div className="flex flex-col gap-5 pt-2">
                  <div className="flex grow gap-3">
                    <Input
                      placeHolder="12345678-9"
                      label="RUT"
                      type="text"
                      // pattern="[0-9]*"
                      nombre="rut"
                      value={rut}
                      setData={(raw) => {
                        const { display } = formatRutLive(raw);
                        setRut(display);
                      }}
                      required
                    />
                    {/* <Input
                      placeHolder="12345678"
                      label="RUT (sin dígito ni puntos)"
                      type="text"
                      pattern="[0-9]*"
                      nombre="rut"
                      value={rut}
                      setData={setRut}
                      required
                    /> */}
                    {/* <Input
                      placeHolder="K o 0-9"
                      label="Dígito Verificador"
                      type="text"
                      nombre="dv"
                      value={dv}
                      setData={setDv}
                      maxLength={1}
                      required
                    /> */}
                  </div>

                  <div className="flex grow gap-3">
                    <Input
                      placeHolder="Nombres"
                      label="Nombres"
                      type="text"
                      nombre="nombres"
                      value={nombres}
                      setData={setNombres}
                      required
                    />
                    <Input
                      placeHolder="Apellidos"
                      label="Apellidos"
                      type="text"
                      nombre="apellidos"
                      value={apellidos}
                      setData={setApellidos}
                      required
                    />
                  </div>

                  <Input
                    placeHolder="Dirección completa"
                    label="Dirección"
                    type="text"
                    nombre="direccion"
                    value={direccion}
                    setData={setDireccion}
                    required
                  />

                  <div className="flex grow gap-3">
                    <Input
                      placeHolder="40-100"
                      label="Tramo RSH"
                      type="text"
                      pattern="[0-9]*"
                      nombre="tramo"
                      value={tramo}
                      setData={setTramo}
                      required
                    />
                    <Input
                      placeHolder="Número de folio"
                      label="Folio"
                      type="text"
                      pattern="[0-9]*"
                      nombre="folio"
                      value={folio}
                      setData={setFolio}
                      required
                    />
                  </div>

                  <CustomAntdDatePicker
                    label="Fecha de Nacimiento"
                    placeholder="Seleccione una fecha"
                    setDate={fechaNacimientoHandler}
                    value={fechaNacimiento ? dayjs(fechaNacimiento) : null}
                    required
                  />
                </div>
              </motion.section>
            )}
            {tab === "Opcional" && (
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
                    placeHolder="correo@ejemplo.com"
                    label="Correo Electrónico"
                    type="email"
                    nombre="correo"
                    value={correo}
                    setData={setCorreo}
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

                  <div className="flex grow gap-3">
                    <Input
                      placeHolder="Masculino/Femenino/Otro"
                      label="Género"
                      type="text"
                      nombre="genero"
                      value={genero}
                      setData={setGenero}
                    />
                    <Input
                      placeHolder="Sí/No"
                      label="Indígena"
                      type="text"
                      nombre="indigena"
                      value={indigena}
                      setData={setIndigena}
                    />
                  </div>

                  <Input
                    placeHolder="Chilena/Otra"
                    label="Nacionalidad"
                    type="text"
                    nombre="nacionalidad"
                    value={nacionalidad}
                    setData={setNacionalidad}
                  />
                </div>
              </motion.section>
            )}
          </AnimatePresence>
          <div className="z-10 flex">
            <SubmitButton isDisabled={isDisabled || !isFormValid()}>
              {isLoading ? "Guardando..." : "Guardar"}
            </SubmitButton>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
