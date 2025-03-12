"use server";
import { date, z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import * as ExcelJS from "exceljs";

// Cambiar form state 🗣️
import { FormState } from "../../ui/dashboard/rsh/load-citizens-modal";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Cargar RSH Excel
interface ExcelRowValues {
  [key: number]: any;
}

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

const LoadCitizensFromExcelSchema = z.object({
  archivo: z.instanceof(File).refine(
    (file) => {
      if (file.size === 0) {
        return false;
      }
      const validMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      return validMimeTypes.includes(file.type);
    },
    {
      message: "Se debe cargar un archivo en formato Excel (.xls o .xlsx)",
    },
  ),
});

const LoadCitizens = LoadCitizensFromExcelSchema.required({
  archivo: true,
});

function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function convertDate(dateString: any): Date | null {
  if (!dateString) return null;

  const strDate = String(dateString);
  if (strDate.length !== 8) return null;

  const year = parseInt(strDate.substring(0, 4));
  const month = parseInt(strDate.substring(4, 6)) - 1;
  const day = parseInt(strDate.substring(6, 8));

  return new Date(year, month, day);
}

export async function loadCitizens(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    function capitalizeWords(text: string): string {
      return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    const archivo = formData.get("archivo") as File;
    const buffer = await archivo.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    const citizens: CitizenData[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        const values: ExcelRowValues = row.values as ExcelRowValues;

        const safeString = (value: any): string =>
          value !== undefined && value !== null ? String(value) : "";

        const telefono = values[1]
          ? String(values[1]).trim().replace(/\s+/g, "")
          : null;
        const correo = values[2] ? String(values[2]) : null;

        const nombresRaw = values[16] ? safeString(values[16]) : "";
        const nombres = nombresRaw ? capitalizeWords(nombresRaw) : "";

        const apellidopaternoRaw = values[14] ? safeString(values[14]) : "";
        const apellidopaterno = apellidopaternoRaw
          ? capitalizeWords(apellidopaternoRaw)
          : "";

        const apellidomaternoRaw = values[15] ? safeString(values[15]) : "";
        const apellidomaterno = apellidomaternoRaw
          ? capitalizeWords(apellidomaternoRaw)
          : null;

        const apellidos = `${apellidopaterno} ${apellidomaterno || ""}`.trim();

        const rut = values[12] ? String(values[12]) : "";
        const dv = values[13] ? String(values[13]) : "";

        const indigena = values[20]
          ? Number(values[20]) === 0
            ? "No"
            : "Sí"
          : null;

        const genero = values[67]
          ? Number(values[67]) === 2
            ? "Femenino"
            : "Masculino"
          : "No especificado";

        const nacionalidad = values[69]
          ? Number(values[69]) === 1
            ? "Chilena"
            : "Extranjera"
          : null;

        const sector = values[78] ? String(values[78]) : null;
        const calle = values[75] ? String(values[75]) : "";
        const numcalle = values[3] ? String(values[3]) : null;
        const direccion = `${calle} ${numcalle || ""}`.trim();
        const tramo = values[70] ? String(values[70]) : "";
        const folio = values[64] ? String(values[64]) : "";

        const fecha_nacimiento = values[68] ? convertDate(values[68]) : null;
        const fecha_encuesta = convertDate(values[63]);
        const fecha_modificacion = convertDate(values[65]);
        const fecha_calificacion = convertDate(values[71]);

        citizens.push({
          telefono,
          correo,
          nombres,
          apellidopaterno,
          apellidomaterno,
          apellidos,
          rut,
          dv,
          indigena,
          genero,
          nacionalidad,
          sector,
          calle,
          numcalle,
          direccion,
          tramo,
          folio,
          fecha_nacimiento,
          fecha_encuesta,
          fecha_modificacion,
          fecha_calificacion,
        });
      }
    });

    for (const citizen of citizens) {
      await sql`
        INSERT INTO ciudadanos (
          telefono, 
          correo, 
          nombres, 
          apellidos, 
          rut, 
          dv, 
          indigena, 
          genero, 
          nacionalidad, 
          sector, 
          direccion, 
          tramo,
          folio,
          fecha_nacimiento,
          fecha_encuesta,
          fecha_modificacion,
          fecha_calificacion
        ) VALUES (
          ${citizen.telefono}, 
          ${citizen.correo}, 
          ${citizen.nombres}, 
          ${citizen.apellidos}, 
          ${citizen.rut}, 
          ${citizen.dv}, 
          ${citizen.indigena}, 
          ${citizen.genero}, 
          ${citizen.nacionalidad}, 
          ${citizen.sector}, 
          ${citizen.direccion}, 
          ${citizen.tramo},
          ${citizen.folio},
          ${citizen.fecha_nacimiento},
          ${citizen.fecha_encuesta},
          ${citizen.fecha_modificacion},
          ${citizen.fecha_calificacion}
        )`;
    }

    revalidatePath("/dashboard/rsh");
    return {
      success: true,
      message: `Información de ${citizens.length} ciudadanos cargada exitosamente`,
    };
  } catch (error) {
    console.error("Error al cargar ciudadados desde el archivo:", error);
    return {
      success: false,
      message: "Error al cargar información de ciudadanos desde el archivo",
    };
  }
}

// Crear RSH

// Editar RSH

// Eliminar RSH
