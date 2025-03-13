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
  nombres: string;
  apellidos: string;
  rut: string;
  beneficio?: string;
  fecha_entrega: Date;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type RSH = {
  rut: number;
  dv: string;
  nombres: string;
  apellidos: string;
  direccion: string;
  tramo: number;
  ultima_entrega: Date;
  discapacidad: string;
  adulto_mayor: string;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type RSHInfo = {
  ultima_actualizacion: Date;
  total_registros: number;
};
