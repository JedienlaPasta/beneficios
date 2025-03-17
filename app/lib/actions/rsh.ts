"use server";
import postgres from "postgres";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as ExcelJS from "exceljs";
import { FormState } from "@/app/ui/dashboard/campañas/new-campaign-modal";

// Crear RSH

// Editar RSH

// Eliminar RSH

// ---------------- Cargar RSH desde Excel ------------
// Interfaces
interface CitizenData {
  telefono: string | null;
  correo: string | null;
  nombres: string;
  apellidopaterno: string;
  apellidomaterno: string | null;
  apellidos: string;
  rut: string;
  dv: string;
  indigena: string | null;
  genero: string;
  nacionalidad: string | null;
  sector: string | null;
  calle: string;
  numcalle: string | null;
  direccion: string;
  tramo: string;
  folio: string;
  fecha_nacimiento: Date | null;
  fecha_encuesta: Date | null;
  fecha_modificacion: Date | null;
  fecha_calificacion: Date | null;
}

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Helpers
const capitalizeWords = (text: string): string =>
  text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const convertDate = (dateString: any): Date | null => {
  const str = String(dateString).padStart(8, "0");
  if (str.length !== 8) return null;

  const year = parseInt(str.substring(0, 4));
  const month = parseInt(str.substring(4, 6)) - 1;
  const day = parseInt(str.substring(6, 8));

  return isNaN(year) || isNaN(month) || isNaN(day)
    ? null
    : new Date(year, month, day);
};

// const formatCurrentDate = (): Date => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth();
//   const day = now.getDate();

//   return new Date(year, month, day);
// };

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Validación Zod
const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        file.size > 0 &&
        [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ].includes(file.type),
      { message: "Archivo Excel requerido (.xls, .xlsx)" },
    ),
});

export async function importXLSXFile(
  // prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const { file } = FileSchema.parse({
      file: formData.get("file"),
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    const citizens: CitizenData[] = [];
    let validRows = 0;
    let skippedRows = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Saltar cabecera

      const values = row.values as ExcelJS.CellValue[];

      // Validar RUT (campo obligatorio)
      const rawRut = values[12] ? String(values[12]) : "";
      if (!rawRut) {
        skippedRows++;
        return;
      }

      // Procesar campos
      const [apellidopaterno, apellidomaterno] = [
        values[14] ? capitalizeWords(String(values[14])) : "",
        values[15] ? capitalizeWords(String(values[15])) : null,
      ];
      const citizen: CitizenData = {
        rut: rawRut,
        dv: values[13] as string,
        nombres: values[16] ? capitalizeWords(String(values[16])) : "",
        apellidopaterno,
        apellidomaterno,
        apellidos: `${apellidopaterno} ${apellidomaterno || ""}`.trim(),
        telefono: values[1] ? String(values[1]).replace(/\D/g, "") : null,
        correo: values[2] ? String(values[2]) : null,
        indigena: (() => {
          const value = values[20];
          if (
            value === null ||
            value === undefined ||
            value === "" ||
            isNaN(Number(value))
          ) {
            return null;
          }

          const numericValue = parseInt(String(value), 10);

          return numericValue === 0 ? "No" : "Sí";
        })(),
        genero: values[67] == 1 ? "Masculino" : "Femenino",
        nacionalidad: values[69]
          ? Number(values[69]) == 1
            ? "Chilena"
            : "Extranjera"
          : null,
        sector: values[78] ? String(values[78]) : null,
        calle: values[75] ? String(values[75]) : "",
        numcalle: values[3] ? String(values[3]) : null,
        direccion: `${values[75] || ""} ${values[3] || ""}`.trim(),
        tramo: values[70] ? String(values[70]) : "",
        folio: values[64] ? String(values[64]) : "",
        fecha_nacimiento: convertDate(values[68]),
        fecha_encuesta: convertDate(values[63]),
        fecha_modificacion: convertDate(values[65]),
        fecha_calificacion: convertDate(values[71]),
      };

      // Validación adicional
      if (!citizen.rut || !citizen.nombres || !citizen.apellidopaterno) {
        skippedRows++;
        return;
      }

      citizens.push(citizen);
      validRows++;
    });

    // Bulk insert
    if (citizens.length > 0) {
      await sql.begin(async (sql) => {
        const MAX_PARAMS = 65534;
        const COLUMNS_COUNT = 18;
        const CHUNK_SIZE = Math.floor(MAX_PARAMS / COLUMNS_COUNT);

        const chunks = chunkArray(citizens, CHUNK_SIZE);

        for (const chunk of chunks) {
          await sql`
            INSERT INTO rsh ${sql(chunk, [
              "telefono",
              "correo",
              "nombres",
              "apellidos",
              "rut",
              "dv",
              "indigena",
              "genero",
              "nacionalidad",
              "sector",
              "direccion",
              "tramo",
              "folio",
              "fecha_nacimiento",
              "fecha_encuesta",
              "fecha_modificacion",
              "fecha_calificacion",
            ])}
            ON CONFLICT (rut) DO UPDATE SET
              telefono = EXCLUDED.telefono,
              correo = EXCLUDED.correo,
              nombres = EXCLUDED.nombres,
              apellidos = EXCLUDED.apellidos,
              dv = EXCLUDED.dv,
              indigena = EXCLUDED.indigena,
              genero = EXCLUDED.genero,
              nacionalidad = EXCLUDED.nacionalidad,
              sector = EXCLUDED.sector,
              direccion = EXCLUDED.direccion,
              tramo = EXCLUDED.tramo,
              folio = EXCLUDED.folio,
              fecha_nacimiento = EXCLUDED.fecha_nacimiento,
              fecha_encuesta = EXCLUDED.fecha_encuesta,
              fecha_modificacion = EXCLUDED.fecha_modificacion,
              fecha_calificacion = EXCLUDED.fecha_calificacion
          `;
        }
      });
    }

    // Actualizar metadatos

    await sql`DELETE FROM rsh_info`;
    await sql` INSERT INTO rsh_info DEFAULT VALUES `;

    revalidatePath("/dashboard/rsh");

    return {
      success: true,
      message: `Procesadas ${validRows} filas (${skippedRows} omitidas)`,
    };
  } catch (error) {
    console.error("Error en importación:", error);
    return {
      success: false,
      message: `Error al procesar archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
    };
  }
}
