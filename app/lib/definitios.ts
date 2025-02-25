export type Campaña = {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_termino: string;
    estado: "En curso" | "Finalizado";
    entregado: number;
    icono: string;
}

export type CampañaHistorial = {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_termino: string;
    icono: string;
}