export type Campaña = {
  id: string;
  nombre: string;
  fecha_inicio: Date;
  fecha_termino: Date;
  estado: "En curso" | "Finalizado";
  entregas: number;
  // icono: string;
  paginas?: number; // total de paginas
  cantidad_total?: number; // total de registros
};

export type CampañaHistorial = {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_termino: string;
  icono: string;
};

export type Actividad = {
  id: string;
  id_campaña?: string;
  id_entrega?: string;
  id_rsh?: string;
  id_usuario: string;
  nombre: string;
  accion: string;
  dato: string;
  fecha: Date;
  paginas?: number; // total de paginas
  cantidad_total?: number; // total de registros
};

export type EntregaDetalleCampaña = {
  folio: string;
  id_campaña: string;
  nombre: string;
  fecha_inicio: Date;
  paginas?: number; // total de paginas
  cantidad_total?: number; // total de registros
};

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  password: string;
  rol: "Administrador" | "Usuario";
  estado: "Activo" | "Inactivo";
  // icono: string;
  paginas?: number; // total de paginas
  cantidad_total?: number; // total de registros
};
