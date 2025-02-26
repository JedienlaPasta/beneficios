export type Campaña = {
    id: number;
    nombre: string;
    fecha_inicio: Date;
    fecha_termino: Date;
    estado: "En curso" | "Finalizado";
    entregas: number;
    icono: string;
    totalPaginas: number; // total de paginas
    cantidad_total: number; // total de registros
}

export type CampañaHistorial = {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_termino: string;
    icono: string;
}