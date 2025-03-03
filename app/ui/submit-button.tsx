export default function SubmitButton({ disabled }: { disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex h-10 grow items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 active:scale-95"
    >
      {false ? "Verificando..." : "Iniciar Sesión"}
    </button>
  );
}
