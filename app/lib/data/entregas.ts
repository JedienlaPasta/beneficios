import sql from "mssql";
import {
  Entregas,
  EntregasCampañaDetail,
  EntregaByFolio,
  EntregasTable,
  EntregasTableByFolio,
  EntregasFiles,
} from "../definitions";
import { connectToDB } from "../utils/db-connection";
import type { ActaData } from "@/app/lib/pdf/types";
import { formatPhone } from "../utils/format";
import { getAge } from "../utils/get-values";

export async function fetchEntregas(
  query: string,
  currentPage: number,
  resultsPerPage: number,
  filters: { status?: string[]; userId?: string } = {},
): Promise<{ data: Entregas[]; pages: number }> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }

    // Preparación de variables
    const offset = (currentPage - 1) * resultsPerPage;

    const rawInput = query.trim();

    // Validaciones para el RUT y Folio
    const hasDigits = /\d/.test(query.trim());
    const isRutValidValue = /^[0-9kK.\-]+$/.test(query.trim());
    const isTooShortText =
      rawInput.length > 0 && !hasDigits && rawInput.length < 3;

    const trimmedQuery = isTooShortText ? "" : rawInput;

    // Validaciones Numéricas y Limpieza para Folio
    const cleanQueryForNumber = trimmedQuery.replace(/['"]/g, "");
    const isExactFolioRSH = /^\d{8}$/.test(cleanQueryForNumber);

    const rutRaw = trimmedQuery.replace(/[^0-9kK]/g, "");

    let rutFormatted: string | null = null;
    if (trimmedQuery.includes("-")) {
      rutFormatted = trimmedQuery.replace(/\./g, "");
    } else if (rutRaw.length > 7) {
      const base = rutRaw.slice(0, -1);
      const dv = rutRaw.slice(-1);
      rutFormatted = `${base}-${dv}`;
    }

    const rawTerms = trimmedQuery
      .replace(/["*]/g, "")
      .split(/\s+/)
      .filter((term) => term.length > 0);

    // Construcción dinámica del WHERE
    const whereClauses: string[] = [];

    // Filtros estáticos de Estado
    if (filters.status && filters.status.length > 0) {
      const allowedStatuses = ["En Curso", "Finalizado", "Anulado"];
      const validStatuses = filters.status.filter((status) =>
        allowedStatuses.includes(status),
      );
      if (validStatuses.length > 0) {
        const statusList = validStatuses
          .map((status) => `'${status}'`)
          .join(",");
        whereClauses.push(`entregas.estado_documentos IN (${statusList})`);
      }
    }

    if (filters.userId) {
      whereClauses.push(`entregas.id_usuario = @userId`);
    }

    // Filtro de Búsqueda (Texto y RUT)
    if (trimmedQuery) {
      const searchConditions: string[] = [];

      // 1. Búsqueda por RUT
      if (hasDigits && isRutValidValue) {
        if (rutFormatted) {
          searchConditions.push(
            `rsh.rut_completo LIKE @rutRaw OR rsh.rut_completo LIKE @rutFormatted`,
          );
        } else {
          searchConditions.push(`rsh.rut_completo LIKE @rutRaw`);
        }
      }

      // 2. Búsqueda por Folio RSH
      if (isExactFolioRSH) {
        searchConditions.push(`rsh.folio = @folioRshExacto`);
      }

      // 3. Búsqueda por Folio de entrega
      searchConditions.push(`entregas.folio LIKE @queryLike`);

      // 4. Búsqueda Full-Text Search (Nombres y Apellidos)
      if (rawTerms.length > 0 && !isRutValidValue) {
        const ftsQueryString = rawTerms
          .map(
            (_, index) =>
              `CONTAINS((rsh.nombres_rsh, rsh.apellidos_rsh), @ftsTerm${index})`,
          )
          .join(" AND ");

        searchConditions.push(`(${ftsQueryString})`);
      }

      // Unimos todas las condiciones de búsqueda con OR y las envolvemos en paréntesis
      if (searchConditions.length > 0) {
        whereClauses.push(`(${searchConditions.join(" OR ")})`);
      }
    }

    // Unir todas las cláusulas WHERE con AND
    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Binding de Parámetros
    const bindParams = (req: sql.Request) => {
      if (filters.userId)
        req.input("userId", sql.UniqueIdentifier, filters.userId);

      if (trimmedQuery) {
        req.input("queryLike", sql.VarChar, `%${query}%`);

        if (hasDigits && isRutValidValue) {
          req.input("rutRaw", sql.VarChar, `${rutRaw}%`); // el % al final permite autocompletar
          if (rutFormatted) {
            req.input("rutFormatted", sql.VarChar, `${rutFormatted}%`);
          }
        }

        // Parámetro para folio exacto
        if (isExactFolioRSH) {
          req.input("folioRshExacto", sql.Int, parseInt(cleanQueryForNumber));
        }

        // Para Full-Text Search (Cadena formateada)
        if (rawTerms.length > 0 && !isRutValidValue) {
          rawTerms.forEach((term, index) => {
            req.input(`ftsTerm${index}`, sql.VarChar, `"${term}*"`);
          });
        }
      }
      return req;
    };

    // Ejecución (count)
    const countRequest = bindParams(pool.request());
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM entregas
      JOIN rsh ON entregas.rut = rsh.rut
      ${whereSql}
    `);

    const total = countResult.recordset[0].total;
    if (total === 0) return { data: [], pages: 0 }; // return rápido si no hay resultados

    // Ejecución (Data Paginada)
    const dataRequest = bindParams(pool.request());
    dataRequest.input("offset", sql.Int, offset);
    dataRequest.input("limit", sql.Int, resultsPerPage);

    const result = await dataRequest.query(`
      WITH Paginacion AS (
          SELECT entregas.folio
          FROM entregas
          JOIN rsh ON entregas.rut = rsh.rut
          ${whereSql}
          ORDER BY entregas.fecha_entrega DESC
          OFFSET @offset ROWS
          FETCH NEXT @limit ROWS ONLY
      )
      SELECT 
        e.folio, 
        e.fecha_entrega, 
        e.estado_documentos, 
        e.rut, 
        rsh.dv, 
        rsh.nombres_rsh, 
        rsh.apellidos_rsh,
        (SELECT COUNT(*) FROM documentos d WHERE d.folio = e.folio) AS cantidad_documentos
      FROM Paginacion p
      JOIN entregas e ON p.folio = e.folio
      JOIN rsh ON e.rut = rsh.rut
      ORDER BY e.fecha_entrega DESC
    `);

    return {
      data: result.recordset as Entregas[],
      pages: Math.ceil(total / resultsPerPage),
    };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchEntregasByRUT(
  rut: string,
  query: string,
  currentPage: number,
  resultsPerPage: number,
): Promise<{ data: EntregasTable[]; pages: number }> {
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }
    const request = pool.request();

    const countQuery =
      currentPage === 1
        ? `COUNT(*) OVER() AS total`
        : `CAST(0 AS INT) AS total`;

    const result = await request
      .input("rut", sql.VarChar, rut)
      .input("query", sql.VarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT 
          entregas.folio, 
          entregas.fecha_entrega, 
          entregas.estado_documentos, 
          usuarios.nombre_usuario,
          (SELECT COUNT(*) FROM documentos WHERE documentos.folio = entregas.folio) AS cantidad_documentos,
          ${countQuery}
        FROM entregas WITH (INDEX(IX_entregas_rut_folio))
        LEFT JOIN usuarios ON entregas.id_usuario = usuarios.id
        WHERE 
          entregas.rut = @rut AND
          entregas.folio LIKE @query
        ORDER BY entregas.fecha_entrega DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    // If we're not on the first page, we need to get the total count separately
    let pages = 0;
    if (currentPage === 1 && result.recordset.length > 0) {
      pages = Math.ceil(Number(result.recordset[0]?.total) / resultsPerPage);
    } else if (currentPage > 1) {
      // Only execute count query when needed (not on first page)
      const countResult = await request
        .input("rut", sql.VarChar, rut)
        .input("query", sql.VarChar, `%${query}%`).query(`
          SELECT COUNT(*) AS total
          FROM entregas
          WHERE 
            entregas.rut = @rut AND
            entregas.folio LIKE @query
        `);
      pages = Math.ceil(
        Number(countResult.recordset[0]?.total) / resultsPerPage,
      );
    }

    return { data: result.recordset as EntregasTable[], pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchEntregasGeneralInfoByFolio(
  folio: string,
): Promise<EntregasTableByFolio> {
  const defaultEntrega: EntregasTableByFolio = {
    folio: "",
    fecha_entrega: null,
    observacion: "",
    estado_documentos: "",
    nombre_usuario: "",
  };

  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return defaultEntrega;
    }

    const request = pool.request();
    const result = await request.input("folio", sql.VarChar, folio).query(`
        SELECT entregas.folio, entregas.fecha_entrega, entregas.observacion, entregas.estado_documentos, usuarios.nombre_usuario
        FROM entregas
        LEFT JOIN usuarios ON entregas.id_usuario = usuarios.id
        WHERE entregas.folio = @folio
      `);

    return result.recordset[0] as EntregasTableByFolio;
  } catch (error) {
    console.error("Error al obtener datos de las entregas: ", error);
    return defaultEntrega;
  }
}

export async function fetchBeneficiosEntregadosByFolio(
  folio: string,
): Promise<EntregaByFolio[]> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return [];
    }

    const request = pool.request();

    // Actualizamos la Query para traer los JSONs
    const result = await request.input("folio", sql.VarChar, folio).query(`
        SELECT 
            be.id_campaña, 
            be.codigo_entrega, 
            be.campos_adicionales, -- Aquí vienen las respuestas (Talla: M, etc.)
            c.nombre_campaña,
            c.esquema_formulario,  -- Aquí viene la configuración (Label: "Talla", etc.)
            c.code                 -- El código corto de la campaña (ej: "PA")
        FROM beneficios_entregados be
        LEFT JOIN campañas c ON be.id_campaña = c.id
        WHERE be.folio = @folio
      `);

    return result.recordset as EntregaByFolio[];
  } catch (error) {
    console.error("Error al obtener datos de las entregas: ", error);
    return [];
  }
}

// Tabla de Detalle de Campaña.
export async function fetchEntregasForCampaignDetail(
  id: string,
  query: string,
  currentPage: number,
  resultsPerPage: number,
): Promise<{ data: EntregasCampañaDetail[]; pages: number }> {
  const flattenQuery = query.replace(/[.]/g, "");
  // si no se agrega el dv no son necesarios estos slice
  if (flattenQuery.length === 8) query = flattenQuery.slice(0, 7);
  if (flattenQuery.length === 9) query = flattenQuery.slice(0, 8);
  else query = flattenQuery;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }

    const request = pool.request();
    const result = await request
      .input("id", sql.UniqueIdentifier, id) // Changed to UniqueIdentifier if id is a UUID
      .input("query", sql.VarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT 
          rsh.nombres_rsh, 
          rsh.apellidos_rsh,
          rsh.rut, 
          rsh.dv,
          entregas.folio, 
          entregas.fecha_entrega,
          COUNT(*) OVER() AS total
        FROM entregas
        JOIN beneficios_entregados ON beneficios_entregados.folio = entregas.folio
        JOIN rsh ON rsh.rut = entregas.rut
        WHERE
          beneficios_entregados.id_campaña = @id 
          AND (
            rsh.rut LIKE @query OR
            entregas.folio LIKE @query OR
            rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
            rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
            concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) COLLATE Modern_Spanish_CI_AI LIKE @query
          )
        ORDER BY entregas.fecha_entrega DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    // Early return if no results
    if (result.recordset.length === 0) {
      return { data: [], pages: 0 };
    }

    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );
    return { data: result.recordset as EntregasCampañaDetail[], pages };
  } catch (error) {
    console.error("Error al obtener entregas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchFilesByFolio(
  folio: string,
): Promise<EntregasFiles[]> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return [];
    }

    const request = pool.request();
    const result = await request.input("folio", sql.VarChar, folio).query(`
        SELECT documentos.fecha_guardado, documentos.nombre_documento, documentos.tipo, documentos.id
        FROM documentos
        WHERE documentos.folio = @folio`);

    return result.recordset as EntregasFiles[];
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    return [];
  }
}

// Acta de Entregas

interface MainDataRow {
  nombres_rsh: string;
  apellidos_rsh: string;
  rut: number;
  dv: string;
  direccion: string;
  telefono: string;
  folio_rsh: number;
  tramo: number;
  fecha_nacimiento: Date;
  folio: string;
  fecha_entrega: Date;
  observacion: string;
  id_usuario: string;
  nombre_usuario: string;
  cargo: string;
}

interface ReceptorRow {
  nombres: string;
  apellidos: string;
  rut: number;
  dv: string;
  direccion: string;
  telefono: string;
  parentesco: string;
}

interface BeneficioRow {
  codigo_entrega: string | null;
  campos_adicionales: string | null; // Viene como JSON string
  nombre_campaña: string;
  code: string;
  esquema_formulario: string | null; // Viene como JSON string
}

// Tipo auxiliar para el JSON de configuración
interface SchemaField {
  nombre: string;
  label: string;
}

export async function getActaDataByFolio(
  folio: string,
): Promise<ActaData | null> {
  // Valores por defecto seguros
  const defaultValues: ActaData = {
    folio,
    numeroEntrega: 0,
    profesional: {
      nombre: "Funcionario(a)",
      cargo: "Departamento Social",
      fecha: "No especificada",
    },
    beneficiario: {
      nombre: "Sin nombre",
      run: "",
      domicilio: "",
      tramo: "",
      folioRSH: "",
      telefono: "",
      edad: "",
    },
    receptor: null,
    beneficios: [],
    justificacion: "",
  };

  try {
    const pool = await connectToDB();
    if (!pool) return defaultValues;

    // --- CONSULTA 1: DATOS PRINCIPALES ---
    const entregaRequest = pool.request();
    const result = await entregaRequest.input("folio", sql.VarChar, folio)
      .query<MainDataRow>(`
        SELECT 
        rsh.nombres_rsh,
        rsh.apellidos_rsh,
        rsh.rut,
        rsh.dv,
        COALESCE(NULLIF(LTRIM(RTRIM(rm.direccion_mod)), ''), rsh.direccion) AS direccion,
        COALESCE(NULLIF(LTRIM(RTRIM(rm.telefono_mod)), ''), rsh.telefono) AS telefono,
        rsh.folio AS folio_rsh,
        rsh.tramo,
        rsh.fecha_nacimiento,
        e.folio,
        e.fecha_entrega,
        e.observacion,
        e.id_usuario,
        u.nombre_usuario,
        u.cargo
      FROM entregas e
      JOIN rsh ON rsh.rut = e.rut
      LEFT JOIN rsh_mods rm ON rm.rut = rsh.rut
      JOIN usuarios u ON u.id = e.id_usuario
      WHERE e.folio = @folio
    `);

    const row = result.recordset[0];
    if (!row) return defaultValues;

    // --- CONSULTA 1.5: NUMERO DE ENTREGA DEL AÑO ---
    const countRequest = pool.request();
    const countResult = await countRequest
      .input("rut", sql.Int, row.rut)
      .input("year", sql.Int, new Date(row.fecha_entrega).getFullYear())
      .input("currentDate", sql.DateTime, row.fecha_entrega).query<{
      total: number;
    }>(`
        SELECT COUNT(*) as total
        FROM entregas
        WHERE rut = @rut
          AND YEAR(fecha_entrega) = @year
          AND fecha_entrega <= @currentDate
          AND estado_documentos != 'Anulado'
      `);
    const numeroEntrega = countResult.recordset[0]?.total || 1;

    // --- CONSULTA 2: RECEPTOR ---
    const receptorRequest = pool.request();
    const receptorResult = await receptorRequest.input(
      "folio",
      sql.VarChar,
      folio,
    ).query<ReceptorRow>(`
        SELECT 
            r.nombres, r.apellidos, r.rut, r.dv, 
            r.direccion, r.telefono, 
            er.parentesco
        FROM entregas_receptores er
        JOIN receptores r ON r.id = er.id_receptor
        WHERE er.folio_entrega = @folio
    `);

    // Aquí TypeScript ya sabe que receptorRow es de tipo ReceptorRow o undefined
    const receptorRow = receptorResult.recordset[0];

    // --- CONSULTA 3: BENEFICIOS ---
    const beneficioRequest = pool.request();
    const beneficiosResult = await beneficioRequest.input(
      "folio",
      sql.VarChar,
      folio,
    ).query<BeneficioRow>(`
        SELECT 
          be.codigo_entrega,
          be.campos_adicionales,
          c.nombre_campaña,
          c.code,
          c.esquema_formulario
        FROM beneficios_entregados be
        JOIN campañas c ON c.id = be.id_campaña
        WHERE be.folio = @folio
      `);

    // --- PROCESAMIENTO ---

    // A. Procesar Beneficios
    const beneficios: ActaData["beneficios"] = beneficiosResult.recordset.map(
      (b) => {
        const nombre = b.nombre_campaña || "Beneficio";
        const codigo = b.code;

        // Tipado seguro para los JSONs
        let respuestas: Record<string, string | number | boolean | null> = {};
        let esquema: SchemaField[] = [];

        try {
          if (b.campos_adicionales) {
            respuestas = JSON.parse(b.campos_adicionales) as Record<
              string,
              string | number | boolean | null
            >;
          }
          if (b.esquema_formulario) {
            esquema = JSON.parse(b.esquema_formulario) as SchemaField[];
          }
        } catch (e) {
          console.error("Error parseando JSON acta", e);
        }

        const detalles: { label: string; value: string }[] = [];

        // (Codigo entregas viejas) ELIMINAR EVENTUALMENTE UNA VEZ CONFIRMADA LA MIGRACION DE DATOS A NUEVA
        // if (b.codigo_entrega) {
        //   detalles.push({
        //     label: "Código / Serial",
        //     value: String(b.codigo_entrega),
        //   });
        // }

        // Mapear campos dinámicos
        Object.entries(respuestas).forEach(([key, val]) => {
          // Buscar el label
          const schemaField = esquema.find((f) => f.nombre === key);
          const label = schemaField
            ? schemaField.label
            : key.replace(/_/g, " ");

          detalles.push({ label: label, value: String(val) });
        });

        return { nombre, codigo, detalles };
      },
    );

    // B. Procesar Receptor
    let receptorData = null;
    if (receptorRow) {
      receptorData = {
        nombre: `${receptorRow.nombres} ${receptorRow.apellidos}`.trim(),
        run: `${receptorRow.rut}-${receptorRow.dv}`,
        domicilio: receptorRow.direccion || "No especificado",
        telefono: formatPhone(receptorRow.telefono) || "No especificado",
        relacion: receptorRow.parentesco || "No especificada",
        tramo: "",
        folioRSH: "",
      };
    }

    // C. Retornar Objeto Final
    const ageNum = getAge(String(row.fecha_nacimiento));
    const edadVal = Number.isFinite(ageNum) ? ageNum : undefined;
    return {
      folio: row.folio,
      numeroEntrega: numeroEntrega,
      profesional: {
        nombre: row.nombre_usuario || "Funcionario",
        cargo: row.cargo || "Departamento Social",
        fecha: String(row.fecha_entrega),
      },
      beneficiario: {
        nombre: `${row.nombres_rsh} ${row.apellidos_rsh}`.trim(),
        run: `${row.rut}-${row.dv}`,
        domicilio: row.direccion || "No especificado",
        tramo: row.tramo ? `${row.tramo}%` : "No especificado",
        folioRSH: row.folio_rsh ? String(row.folio_rsh) : "No especificado",
        telefono: formatPhone(row.telefono) || "No especificado",
        edad: edadVal,
      },
      receptor: receptorData,
      beneficios,
      justificacion: row.observacion || "Sin observaciones.",
    };
  } catch (error) {
    console.error("Error al obtener datos acta:", error);
    return defaultValues;
  }
}
