export type Campaign = {
  id: string;
  nombre: string;
  fecha_inicio: Date;
  fecha_termino: Date;
  descripcion: string;
  estado: "En curso" | "Finalizado";
  entregas: number;
  tipo_dato: string;
  tramo: string;
  discapacidad: string;
  adulto_mayor: string;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type Activity = {
  id: string;
  id_mod?: string;
  nombre: string;
  accion: string;
  dato: string;
  fecha: Date;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

//Social
export type SocialAid = {
  folio: string;
  nombres: string;
  apellidos: string;
  rut: string;
  beneficio?: string;
  fecha_entrega: Date;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type SocialAidTableRow = {
  folio: string;
  nombre_campaña: string;
  detalle: string;
  observacion: string;
  nombre_usuario: string;
  fecha_entrega: Date;
};

// Modal Detalle Entregas
export type SocialAidTableRowByFolio = {
  folio: string;
  fecha_entrega: Date;
  nombre_usuario: string;
  observacion: string;
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
};

export type RSHTableData = {
  rut: number;
  dv: string;
  nombres: string;
  apellidos: string;
  direccion: string;
  tramo: number;
  ultima_entrega: Date;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type RSHInfo = {
  ultima_actualizacion: Date;
  total_registros: number;
};

export type RSH = {
  nombres: string;
  apellidos: string;
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
