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

export type SocialAid = {
  folio: string;
  id_campaña: string;
  nombre: string;
  apellidos: string;
  rut: string;
  beneficio: string;
  fecha: Date;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type RSH = {
  id: string;
  nombre: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_termino: Date;
  estado: "En curso" | "Finalizado";
  tipo_dato: string;
  tramo: string;
  discapacidad: string;
  adulto_mayor: string;
};
