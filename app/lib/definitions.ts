export type Activity = {
  // id: string;
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

export type Campaign = {
  id: string;
  nombre_campaña: string;
  fecha_inicio: Date;
  fecha_termino: Date;
  entregas: number;
  code: string;
  stock: number;
  tipo_dato: string;
  tramo: string;
  estado: "En curso" | "Finalizado";
  discapacidad: string;
  adulto_mayor: string;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

// Social (Entregas + RSH)
export type SocialAid = {
  folio: string;
  nombres_rsh: string;
  apellidos_rsh: string;
  rut: string;
  beneficio?: string;
  fecha_entrega: Date;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type SocialAidTableRow = {
  folio: string;
  nombre_campaña?: string;
  detalle: string;
  estado_documentos: string;
  nombre_usuario: string;
  fecha_entrega: Date;
};

// Modal Detalle Entregas
export type SocialAidTableRowByFolio = {
  folio: string;
  fecha_entrega: Date;
  nombre_usuario: string;
  observacion: string;
  estado_documentos: string;
};

// Modal Detalle Entrega
export type SocialAidByFolio = {
  id_campaña: string;
  detalle: string;
  nombre_campaña: string;
  tipo_dato: string;
};

export type SocialFiles = {
  tipo: string;
  // archivo: string;
  nombre_documento: string;
  fecha_guardado: Date;
  id: string;
};

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
  rut: number;
  direccion: string;
  sector: string;
  tramo: number;
  telefono: number;
  dv: string;
  fecha_nacimiento: Date;
  genero: string;
  correo: string;
  indigena: string;
  fecha_calificacion: Date;
  folio: string;
  fecha_encuesta: Date;
  nacionalidad: string;
  fecha_modificacion: Date;
  ultima_entrega: Date;
  pages?: number; // total de paginas
  total?: number; // total de registros

  discapacidad: string;
};
