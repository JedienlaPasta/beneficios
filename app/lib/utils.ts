export const formatearFecha = (fecha: Date) => {
    const fechaEnEspañol = fecha.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const fechaSpliteada = fechaEnEspañol.toString().split(" ");
    const dia = fechaSpliteada[0];
    const mes = fechaSpliteada[2][0].toUpperCase() + fechaSpliteada[2].slice(1, 3);
    const año = fechaSpliteada[4];

    return dia + " " + mes + ", " + año;
};