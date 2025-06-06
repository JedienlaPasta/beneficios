// Inicio ==================================
export type GeneralInfo = {
  active_campaigns: number;
  total_entregas: number;
  total_beneficiarios: number;
};

// Auditoria ===============================
export type Activity = {
  accion: string;
  comentario_accion: string;
  comentario_nombre?: string;
  fecha: string;
  id_usuario: string;
  nombre_usuario: string;
  id_registro_mod?: string;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

// Campañas ================================
export type Campaign = {
  id: string;
  nombre_campaña: string;
  fecha_inicio: Date | null;
  fecha_termino: Date | null;
  entregas: number | null;
  code: string;
  stock: number | null;
  tipo_dato: string;
  tramo: string;
  // estado: "En curso" | "Finalizado";
  discapacidad: string;
  adulto_mayor: string;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type EntregasCampañaDetail = {
  folio: string;
  nombres_rsh: string;
  apellidos_rsh: string;
  rut: string;
  beneficio?: string;
  fecha_entrega: Date;
  total?: number; // total de registros
};

// Entregas ================================
export type Entregas = {
  folio: string;
  fecha_entrega: Date | null;
  estado_documentos: string;
  rut: number | null;
  nombres_rsh: string;
  apellidos_rsh: string;
  total?: number; // total de registros
  pages?: number; // total de paginas
};

export type EntregasTable = {
  folio: string;
  // nombre_campaña?: string;
  detalle: string;
  estado_documentos: string;
  nombre_usuario: string;
  fecha_entrega: Date;
};

// Modal Detalle Entregas
export type EntregasTableByFolio = {
  folio: string;
  fecha_entrega: Date | null;
  nombre_usuario: string;
  observacion: string;
  estado_documentos: string;
};

// Modal Detalle Entrega
export type EntregaByFolio = {
  id_campaña: string;
  detalle: string;
  nombre_campaña: string;
  tipo_dato: string;
};

export type EntregasFiles = {
  fecha_guardado: Date;
  nombre_documento: string;
  tipo: string;
  id: string;
};

// RSH =====================================
export type RSHTableData = {
  rut: number;
  dv: string;
  nombres_rsh: string;
  apellidos_rsh: string;
  direccion: string;
  tramo: number;
  ultima_entrega: Date;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type RSHInfo = {
  ultima_actualizacion: Date | null;
  total_registros: number;
};

export type RSH = {
  nombres_rsh: string;
  apellidos_rsh: string;
  rut: number | null;
  dv: string;
  direccion: string;
  direccion_mod?: string;
  sector: string;
  sector_mod?: string;
  tramo: number | null;
  telefono: string;
  telefono_mod?: string;
  fecha_nacimiento: Date | null;
  genero: string;
  correo: string;
  correo_mod?: string;
  indigena: string;
  fecha_calificacion?: Date;
  folio: string;
  fecha_encuesta?: Date;
  nacionalidad: string;
  fecha_modificacion?: Date;
  ultima_entrega: Date | null;
  pages?: number; // total de paginas
  total?: number; // total de registros

  discapacidad?: string;
};

// Usuarios ================================
export type UserData = {
  id: string;
  nombre_usuario: string;
  correo: string;
  cargo: string;
  rol: string;
  estado: string;
};
