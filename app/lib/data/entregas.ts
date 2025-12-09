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
import { formatNumber, formatPhone } from "../utils/format";
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

export async function fetchEntregasInfoByFolio(
  folio: string,
): Promise<EntregaByFolio[]> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return [];
    }

    const request = pool.request();
    const result = await request.input("folio", sql.VarChar, folio).query(`
        SELECT entrega.id_campaña, entrega.detalle, campañas.tipo_dato, campañas.nombre_campaña
        FROM entrega
        LEFT JOIN campañas ON entrega.id_campaña = campañas.id
        WHERE entrega.folio = @folio
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
        JOIN entrega ON entrega.folio = entregas.folio
        JOIN rsh ON rsh.rut = entregas.rut
        WHERE
          entrega.id_campaña = @id 
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
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {};
    }

    const entregaRequest = pool.request();
    console.log("Folio:", folio);
    const result = await entregaRequest.input("folio", sql.VarChar, folio)
      .query(`
        SELECT 
          rsh.nombres_rsh, 
          rsh.apellidos_rsh,
          rsh.rut, 
          rsh.dv,
          rsh.direccion,
          rsh.telefono,
          rsh.folio as folio_rsh,
          rsh.tramo,
          rsh.fecha_nacimiento,
          entregas.folio, 
          entregas.fecha_entrega,
          entregas.observacion,
          entregas.id_usuario
        FROM entregas
        JOIN entrega ON entrega.folio = entregas.folio
        JOIN rsh ON rsh.rut = entregas.rut
        JOIN usuarios ON usuarios.id = entregas.id_usuario
        WHERE
          entregas.folio = @folio
      `);

    const row = result.recordset[0];
    console.log(row);
    if (!row) {
      return {
        folio,
        numeroEntrega: 0,
        profesional: {
          nombre: "Funcionario(a)",
          cargo: "Departamento Social",
          fecha: "No especificada",
        },
        beneficiario: {
          nombre: "",
          run: "",
          direccion: "",
          telefono: "",
        },
        receptor: {
          nombre: "",
          rut: "",
          parentezco: "No especificado",
        },
        beneficios: [],
        justificacion: "",
      };
    }

    // Consulta de beneficios (cada registro en 'entrega' asociado a una campaña)
    const beneficioRequest = pool.request();
    const beneficiosResult = await beneficioRequest.input(
      "folio",
      sql.VarChar,
      folio,
    ).query(`
        SELECT 
          e.detalle,
          c.nombre_campaña,
          c.code,
          c.tipo_dato
        FROM entrega e
        JOIN campañas c ON c.id = e.id_campaña
        WHERE e.folio = @folio
      `);
    console.log(beneficiosResult.recordset);

    const funcionarioRequest = pool.request();
    const funcionarioResult = await funcionarioRequest.input(
      "id_usuario",
      sql.UniqueIdentifier,
      row.id_usuario,
    ).query(`
        SELECT nombre_usuario, cargo
        FROM usuarios
        WHERE id = @id_usuario
      `);
    const funcionario = funcionarioResult.recordset[0];
    console.log(funcionario);

    const beneficios = (beneficiosResult.recordset ?? []).map((b) => ({
      nombre: b.nombre_campaña as string,
      codigo: b.code as string,
      detalles: [
        b.detalle ? { label: "Detalle", value: String(b.detalle) } : null,
      ].filter(Boolean) as { label?: string; value: string }[],
    }));

    const fechaEntrega =
      row.fecha_entrega instanceof Date
        ? row.fecha_entrega
        : new Date(row.fecha_entrega);
    const fechaStr = isNaN(fechaEntrega.getTime())
      ? ""
      : fechaEntrega.toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

    const nombreBeneficiario =
      `${row.nombres_rsh ?? ""} ${row.apellidos_rsh ?? ""}`.trim();
    const runBeneficiario = row.rut && row.dv ? `${row.rut}-${row.dv}` : "";

    const edadBeneficiario = getAge(row.fecha_nacimiento);

    const data: ActaData = {
      folio: row.folio ?? "",
      numeroEntrega: 1, // Ajusta si tienes este dato
      profesional: {
        nombre: funcionario?.nombre_usuario || "Funcionario(a)",
        cargo: funcionario?.cargo || "Departamento Social",
        fecha: fechaEntrega || "No especificada",
      },
      beneficiario: {
        nombre: nombreBeneficiario || "Sin nombre",
        run: runBeneficiario || "",
        domicilio: row.direccion || "No especifica", // Completar si tienes el dato
        tramo: row.tramo || "No especifica",
        folioRSH: row.folio_rsh || "No especifica",
        telefono: formatPhone(row.telefono) || "No especifica",
        edad: edadBeneficiario || "No especifica",
      },
      receptor: {
        nombre: nombreBeneficiario || "Sin Receptor",
        run: runBeneficiario || "",
        domicilio: "",
        tramo: "",
        folioRSH: "",
        telefono: "",
        relacion: "Beneficiario",
      },
      beneficios,
      justificacion: row.observacion || "No especificada",
    };

    return data;
  } catch (error) {
    console.error("Error al obtener datos de la acta:", error);
    return {};
  }
}
