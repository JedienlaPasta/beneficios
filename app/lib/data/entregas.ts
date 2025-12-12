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
): Promise<{ data: Entregas[]; pages: number }> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }

    const hasDigits = /\d/.test(query);
    const cleanedRut = hasDigits ? query.replace(/\D/g, "") : "";
    const offset = (currentPage - 1) * resultsPerPage;

    const queryWithoutPercent = query.replace(/%/g, "");
    const searchTerms = queryWithoutPercent
      .split(" ")
      .filter((term) => term.trim().length > 0);

    // Step 1: Get total count first (optimized)
    const countRequest = pool.request();
    const countResult = await countRequest
      .input("query", sql.VarChar, `%${query}%`)
      .input("cleanedRut", sql.VarChar, `%${cleanedRut}%`).query(`
        SELECT COUNT(*) as total
        FROM entregas
        JOIN rsh ON entregas.rut = rsh.rut
        WHERE
          ${hasDigits ? "concat (entregas.rut, rsh.dv) LIKE @cleanedRut OR" : ""}
          entregas.folio LIKE @query OR
          rsh.folio LIKE @query OR
          rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR 
          rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR 
          concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) COLLATE Modern_Spanish_CI_AI LIKE @query
      `);

    const total: number = countResult.recordset[0].total;

    // Step 2: Get paginated data (optimized with ROW_NUMBER)
    const dataRequest = pool.request();
    const result = await dataRequest
      .input("query", sql.VarChar, `%${query}%`)
      .input("cleanedRut", sql.VarChar, `%${cleanedRut}%`)
      .input("startRow", sql.Int, offset + 1)
      .input("endRow", sql.Int, offset + resultsPerPage).query(`
        SELECT * FROM (
          SELECT 
            entregas.folio, entregas.fecha_entrega, entregas.estado_documentos, 
            entregas.rut, rsh.dv, rsh.nombres_rsh, rsh.apellidos_rsh,
            ROW_NUMBER() OVER (ORDER BY entregas.fecha_entrega DESC) AS RowNum
          FROM entregas
          JOIN rsh ON entregas.rut = rsh.rut
          WHERE
            ${hasDigits ? "concat (entregas.rut, rsh.dv) LIKE @cleanedRut OR" : ""}
            entregas.folio LIKE @query OR
            rsh.folio LIKE @query OR
            rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR 
            rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR 
            concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) COLLATE Modern_Spanish_CI_AI LIKE @query
            ${
              searchTerms.length > 1
                ? `OR (
              ${searchTerms
                .map(
                  (term) =>
                    `(rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE '%${term}%' OR rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE '%${term}%')`,
                )
                .join(" AND ")}
            )`
                : ""
            }
        ) AS NumberedResults
        WHERE RowNum BETWEEN @startRow AND @endRow
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

export async function getActaDataByFolio(
  folio: string,
): Promise<ActaData | null> {
  // Valores por defecto
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

    // 1. Obtener Datos Principales (Entrega + Beneficiario + Usuario)
    const entregaRequest = pool.request();
    const result = await entregaRequest.input("folio", sql.VarChar, folio)
      .query(`
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

    // 2. Obtener Datos del Receptor (Si existe)
    // Buscamos en entregas_receptores y unimos con la tabla receptores
    const receptorRequest = pool.request();
    const receptorResult = await receptorRequest.input(
      "folio",
      sql.VarChar,
      folio,
    ).query(`
        SELECT 
            r.nombres, r.apellidos, r.rut, r.dv, 
            r.direccion, r.telefono, 
            er.parentesco
        FROM entregas_receptores er
        JOIN receptores r ON r.id = er.id_receptor
        WHERE er.folio_entrega = @folio
    `);
    const receptorRow = receptorResult.recordset[0];

    // 3. Obtener Beneficios y sus Detalles JSON
    const beneficioRequest = pool.request();
    const beneficiosResult = await beneficioRequest.input(
      "folio",
      sql.VarChar,
      folio,
    ).query(`
        SELECT 
          be.codigo_entrega, -- Código físico destacado
          be.campos_adicionales, -- JSON con respuestas
          c.nombre_campaña,
          c.code, -- Sigla de la campaña
          c.esquema_formulario -- JSON con labels bonitos
        FROM beneficios_entregados be
        JOIN campañas c ON c.id = be.id_campaña
        WHERE be.folio = @folio
      `);

    // --- PROCESAMIENTO DE DATOS ---

    // A. Procesar Beneficios
    const beneficios: ActaData["beneficios"] = beneficiosResult.recordset.map(
      (b: any) => {
        const nombre = b.nombre_campaña || "Beneficio";
        const codigo = b.code;

        // Parsear JSONs
        let respuestas: Record<string, any> = {};
        let esquema: { nombre: string; label: string }[] = [];
        try {
          respuestas = b.campos_adicionales
            ? JSON.parse(b.campos_adicionales)
            : {};
          esquema = b.esquema_formulario
            ? JSON.parse(b.esquema_formulario)
            : [];
        } catch (e) {
          console.error("Error parseando JSON acta", e);
        }

        // Construir array de detalles "Label: Valor"
        const detalles: { label: string; value: string }[] = [];

        // 1. Agregar el código físico si existe (Prioridad alta)
        if (b.codigo_entrega) {
          detalles.push({
            label: "Código",
            value: String(b.codigo_entrega),
          });
        }

        // 2. Agregar el resto de campos dinámicos
        Object.entries(respuestas).forEach(([key, val]) => {
          // Saltamos el código si ya lo pusimos o si es la sigla interna
          if (key === "codigo_entrega" || key === "code") return;

          // Buscar label bonito en el esquema
          const schemaField = esquema.find((f) => f.nombre === key);
          const label = schemaField
            ? schemaField.label
            : key.replace(/_/g, " "); // Fallback

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
        domicilio: receptorRow.direccion || "No informada",
        telefono: formatPhone(receptorRow.telefono) || "No informado",
        relacion: receptorRow.parentesco || "No informada",
        // Campos no usados en PDF pero requeridos por tipo
        tramo: "",
        folioRSH: "",
      };
    }

    // C. Armar Objeto Final
    return {
      folio: row.folio,
      numeroEntrega: 1, // Lógica pendiente si la tienes
      profesional: {
        nombre: row.nombre_usuario || "Funcionario",
        cargo: row.cargo || "Departamento Social",
        fecha: row.fecha_entrega,
      },
      beneficiario: {
        nombre: `${row.nombres_rsh} ${row.apellidos_rsh}`.trim(),
        run: `${row.rut}-${row.dv}`,
        domicilio: row.direccion || "No especifica",
        tramo: row.tramo ? `${row.tramo}%` : "N/A",
        folioRSH: row.folio_rsh || "N/A",
        telefono: formatPhone(row.telefono) || "N/A",
        edad: getAge(row.fecha_nacimiento) || "N/A",
      },
      receptor: receptorData, // Puede ser null
      beneficios,
      justificacion: row.observacion || "",
    };
  } catch (error) {
    console.error("Error al obtener datos acta:", error);
    return defaultValues;
  }
}
