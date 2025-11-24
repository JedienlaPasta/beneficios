"use client";

import dynamic from "next/dynamic";
import { Modal } from "@/app/ui/dashboard/modal";
import { useEffect } from "react";

const NewCitizenModal = dynamic(
  () => import("@/app/ui/dashboard/rsh/new-citizen-modal"),
  { ssr: false },
);
const ImportXLSXModal = dynamic(
  () => import("@/app/ui/dashboard/rsh/import-xlsx-modal"),
  { ssr: false },
);

type Props = {
  newcitizen?: string;
  importxlsx?: string;
};

export default function RSHModals({ newcitizen, importxlsx }: Props) {
  useEffect(() => {
    // Warm-up de código de modales cliente
    import("@/app/ui/dashboard/rsh/new-citizen-modal");
    import("@/app/ui/dashboard/rsh/import-xlsx-modal");
  }, []);

  return (
    <>
      {newcitizen === "open" && (
        <Modal name="newcitizen">
          <NewCitizenModal name="newcitizen" />
        </Modal>
      )}
      {importxlsx === "open" && (
        <Modal name="importxlsx">
          <ImportXLSXModal name="importxlsx" />
        </Modal>
      )}
    </>
  );
}
