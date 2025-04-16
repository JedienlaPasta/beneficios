// import { unstable_noStore as noStore } from "next/cache";

// export async function getAuditLogs(page = 1, query = "") {
//   noStore();
//   const ITEMS_PER_PAGE = 10;
//   const offset = (page - 1) * ITEMS_PER_PAGE;

//   try {
//     // For demo purposes, we'll create some mock data
//     // In a real application, you would query your database
//     const mockLogs = Array.from({ length: 50 }, (_, i) => ({
//       id: `log-${i + 1}`,
//       usuario: `usuario${(i % 5) + 1}@municipalidad.cl`,
//       accion:
//         i % 4 === 0
//           ? "crear"
//           : i % 4 === 1
//             ? "editar"
//             : i % 4 === 2
//               ? "eliminar"
//               : "ver",
//       modulo:
//         i % 3 === 0 ? "Beneficios" : i % 3 === 1 ? "Usuarios" : "Entregas",
//       detalles: JSON.stringify(
//         {
//           entidad:
//             i % 3 === 0 ? "Beneficio" : i % 3 === 1 ? "Usuario" : "Entrega",
//           id: `entity-${i + 100}`,
//           cambios: {
//             antes: { campo1: "valor1", campo2: "valor2" },
//             despues: { campo1: "nuevo1", campo2: "nuevo2" },
//           },
//         },
//         null,
//         2,
//       ),
//       fecha: new Date(Date.now() - i * 3600000).toISOString(),
//       ip: `192.168.1.${i % 255}`,
//     }));

//     // Filter logs based on query
//     const filteredLogs = query
//       ? mockLogs.filter(
//           (log) =>
//             log.usuario.toLowerCase().includes(query.toLowerCase()) ||
//             log.accion.toLowerCase().includes(query.toLowerCase()) ||
//             log.modulo.toLowerCase().includes(query.toLowerCase()),
//         )
//       : mockLogs;

//     // Paginate results
//     const paginatedLogs = filteredLogs.slice(offset, offset + ITEMS_PER_PAGE);
//     const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

//     return {
//       logs: paginatedLogs,
//       totalPages,
//     };
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch audit logs.");
//   }
// }
