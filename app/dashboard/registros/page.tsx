import ProtectedRoute from "@/app/dashboard/ProtectedRoute";

export default function Registros() {
  return (
    <ProtectedRoute allowedRoles={["Administrador"]} isDashboardRoute={true}>
      <h2>Registros</h2>
    </ProtectedRoute>
  );
}
