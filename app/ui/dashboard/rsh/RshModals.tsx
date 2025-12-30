"use client";

import dynamic from "next/dynamic";
import { Modal } from "@/app/ui/dashboard/Modal";
import { useEffect } from "react";

const NewCitizenModal = dynamic(
  () => import("@/app/ui/dashboard/rsh/NewCitizenModal"),
  { ssr: false },
);
const ImportXLSXModal = dynamic(
  () => import("@/app/ui/dashboard/rsh/ImportXlsxModal"),
  { ssr: false },
);

type Props = {
  newcitizen?: string;
  importxlsx?: string;
};

export default function RSHModals({ newcitizen, importxlsx }: Props) {
  useEffect(() => {
    // Warm-up de código de modales cliente
    import("@/app/ui/dashboard/rsh/NewCitizenModal");
    import("@/app/ui/dashboard/rsh/ImportXlsxModal");
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
