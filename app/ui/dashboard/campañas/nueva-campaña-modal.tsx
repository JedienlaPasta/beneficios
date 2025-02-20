import React from "react";

type NuevaCampañaModalProps = {
  closeModal: () => void;
};

export default function NuevaCampañaModal({
  closeModal,
}: NuevaCampañaModalProps) {
  return (
    <div className="fixed left-0 top-0 flex h-dvh w-full items-center justify-center">
      <div
        onClick={() => closeModal()}
        className="fixed z-[-1] h-dvh w-full cursor-pointer bg-black/30"
      ></div>
      <div className="w-96 rounded-lg bg-white p-4">
        <h2>Nueva Campaña</h2>
        <div>
          <p>nueva campaña</p>
        </div>
      </div>
    </div>
  );
}
