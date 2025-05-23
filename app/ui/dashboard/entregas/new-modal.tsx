"use client";
import { Campaign } from "@/app/lib/definitions";
import CloseModalButton from "../close-modal-button";
import NewModalForm from "./new-modal-form";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NewModalFormManual from "./new-modal-form-manual";

type NewEntregaModalProps = {
  rut: string;
  userId: string;
  data: Campaign[];
};

export default function NewEntregaModal({
  rut,
  userId,
  data,
}: NewEntregaModalProps) {
  const tabs = ["Rápido", "Manual"];
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className="flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-white p-8 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-700">
            Asignar Beneficios
          </h2>
        </div>
        <CloseModalButton name="newsocialaid" />
      </div>
      <p className="text-xs text-slate-500">
        Elige los beneficios que vas a asignar junto con sus respectivos datos.
      </p>

      {/* Navigation Tab */}
      <section className="relative flex items-center justify-between border-b border-gray-100">
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
      <motion.div className="overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* Tab Content */}

          {tab === "Rápido" && (
            <motion.div
              key="tab-rapido"
              initial={{ opacity: 0, y: 10, height: 340 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 360 }}
              transition={{
                duration: 0.4,
                height: { duration: 0.4 },
                ease: "easeInOut",
              }}
            >
              {/* Form 01 */}
              <NewModalForm activeCampaigns={data} rut={rut} userId={userId} />
            </motion.div>
          )}
          {tab === "Manual" && (
            <motion.div
              key="tab-manual"
              initial={{ opacity: 0, y: 10, height: 360 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 340 }}
              transition={{
                duration: 0.4,
                height: { duration: 0.4 },
                ease: "easeInOut",
              }}
            >
              {/* Form 02 */}
              <NewModalFormManual
                activeCampaigns={data}
                rut={rut}
                userId={userId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
