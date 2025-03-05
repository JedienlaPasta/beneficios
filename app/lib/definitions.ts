export type Campaign = {
  id: string;
  nombre: string;
  fecha_inicio: Date;
  fecha_termino: Date;
  descripcion: string;
  estado: "En curso" | "Finalizado";
  entregas: number;
  // icono: string;
  pages?: number; // total de paginas
  total?: number; // total de registros
};

export type Activity = {
  id: string;
  id_campaña?: string;
  id_entrega?: string;
  id_rsh?: string;
  id_usuario: string;
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
