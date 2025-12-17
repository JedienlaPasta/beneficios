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

    // 1. Preparación de variables
    const offset = (currentPage - 1) * resultsPerPage;
    const hasDigits = /\d/.test(query);
    const cleanedRut = hasDigits ? query.replace(/\D/g, "") : "";

    const queryWithoutPercent = query.replace(/%/g, "");
    const searchTerms = queryWithoutPercent
      .split(" ")
      .filter((term) => term.trim().length > 0);

    // 2. Construcción dinámica del WHERE (Centralizada)
    // Esto evita repetir la lógica en el Count y en el Select
    const whereClauses: string[] = [];

    // Filtro de Estado (Seguro mediante Allowlist)
    if (filters.status && filters.status.length > 0) {
      const allowedStatuses = ["En Curso", "Finalizado", "Anulado"];
      const validStatuses = filters.status.filter((s) =>
        allowedStatuses.includes(s),
      );

      if (validStatuses.length > 0) {
        // SQL Server no soporta arrays nativos en parameters fácilmente sin tipos tabla,
        // la inyección de strings aquí es segura porque filtramos con allowedStatuses.
        const statusList = validStatuses.map((s) => `'${s}'`).join(",");
        whereClauses.push(`entregas.estado_documentos IN (${statusList})`);
      }
    }

    // Filtro de Usuario
    if (filters.userId) {
      whereClauses.push(`entregas.id_usuario = @userId`);
    }

    // Filtro de Búsqueda (Texto y RUT)
    if (query) {
      const searchConditions: string[] = [];

      // Búsqueda por RUT (Si hay dígitos)
      if (hasDigits) {
        searchConditions.push(`concat(entregas.rut, rsh.dv) LIKE @cleanedRut`);
      }

      // Búsqueda General
      searchConditions.push(`entregas.folio LIKE @query`);
      searchConditions.push(`rsh.folio LIKE @query`);

      // Búsqueda por Nombres (Optimizada visualmente)
      // Nota: COLLATE en tiempo de ejecución es lento, idealmente la columna ya debería tener ese collation
      const nameCollate = `COLLATE Modern_Spanish_CI_AI`;
      searchConditions.push(`rsh.nombres_rsh ${nameCollate} LIKE @query`);
      searchConditions.push(`rsh.apellidos_rsh ${nameCollate} LIKE @query`);
      searchConditions.push(
        `concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) ${nameCollate} LIKE @query`,
      );

      // Búsqueda Multitérmino (Compleja)
      if (searchTerms.length > 1) {
        const multiTermCondition = searchTerms
          .map(
            (_, index) =>
              `(rsh.nombres_rsh ${nameCollate} LIKE @term${index} OR rsh.apellidos_rsh ${nameCollate} LIKE @term${index})`,
          )
          .join(" AND ");
        searchConditions.push(`(${multiTermCondition})`);
      }

      // Unimos todas las condiciones de búsqueda con OR y las envolvemos en paréntesis
      whereClauses.push(`(${searchConditions.join(" OR ")})`);
    }

    // Unir todas las cláusulas WHERE con AND
    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 3. Función auxiliar para inyectar parámetros (DRY)
    const bindParams = (req: any) => {
      if (filters.userId)
        req.input("userId", sql.UniqueIdentifier, filters.userId);
      if (query) {
        req.input("query", sql.VarChar, `%${query}%`);
        req.input("cleanedRut", sql.VarChar, `%${cleanedRut}%`);
        searchTerms.forEach((term, index) => {
          req.input(`term${index}`, sql.VarChar, `%${term}%`);
        });
      }
      return req;
    };

    // 4. Ejecución de Consultas

    // QUERY 1: Total Count
    const countRequest = bindParams(pool.request());
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM entregas
      JOIN rsh ON entregas.rut = rsh.rut
      ${whereSql}
    `);

    const total = countResult.recordset[0].total;

    // Si no hay resultados, retornamos rápido para ahorrar la segunda consulta
    if (total === 0) return { data: [], pages: 0 };

    // QUERY 2: Data Paginada (Usando OFFSET FETCH de SQL Server 2012+)
    const dataRequest = bindParams(pool.request());

    // Agregamos parámetros de paginación
    dataRequest.input("offset", sql.Int, offset);
    dataRequest.input("limit", sql.Int, resultsPerPage);

    const result = await dataRequest.query(`
      SELECT 
        entregas.folio, 
        entregas.fecha_entrega, 
        entregas.estado_documentos, 
        entregas.rut, 
        rsh.dv, 
        rsh.nombres_rsh, 
        rsh.apellidos_rsh
      FROM entregas
      JOIN rsh ON entregas.rut = rsh.rut
      ${whereSql}
      ORDER BY entregas.fecha_entrega DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    const pages = Math.ceil(total / resultsPerPage);
    return { data: result.recordset as Entregas[], pages };
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
      numeroEntrega: 1,
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
