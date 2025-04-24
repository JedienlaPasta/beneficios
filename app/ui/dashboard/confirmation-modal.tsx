type Props = {
  id: string;
  content: string;
  isDisabled: boolean;
  setShowConfirmModal: (show: boolean) => void;
  action: (
    id: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => Promise<void | { error?: string; success?: string }>;
};

export default function ConfirmModal({
  id,
  content,
  isDisabled,
  setShowConfirmModal,
  action,
}: Props) {
  const handleCancelButton = () => {
    setShowConfirmModal(false);
  };

  const title =
    content === "Eliminar" ? "Confirmar eliminación" : "Confirmar término"; // Cambiar el título según el conten

  const bgColor =
    content === "Eliminar"
      ? "bg-red-500 hover:bg-red-600"
      : "bg-blue-500 hover:bg-blue-600";

  const disabledBgColor =
    content === "Eliminar"
      ? "bg-red-300 cursor-not-allowed"
      : "bg-blue-300 cursor-not-allowed";

  return (
    // Aqui
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-3 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-500">
          ¿Estás seguro de que deseas {content.toLowerCase()} esta campaña? Esta
          acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancelButton}
            className={`rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 ${isDisabled ? "cursor-not-allowed" : "hover:bg-gray-200"}`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={(e) => action(id, e)}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${isDisabled ? disabledBgColor : bgColor}`}
          >
            {content}
          </button>
        </div>
      </div>
    </div>
  );
}
