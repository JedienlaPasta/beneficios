import { getDV } from "./get-values";

export const formatDate = (date: Date | null, length?: string) => {
  if (!date) return "";
  const esDate = date.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const splitDate = esDate.toString().split(" ");
  const dia = splitDate[0];
  const mes =
    length === "fullDate"
      ? splitDate[2]
      : splitDate[2][0].toUpperCase() + splitDate[2].slice(1, 3);
  const año = splitDate[4];

  return dia + " " + mes + ", " + año;
};

export const formatTime = (date: Date | null) => {
  if (!date) return "";
  const esTime = date.toLocaleString("es-ES", {
    hour: "numeric",
    minute: "numeric",
  });
  const splitTime = esTime.toString().split(" ");
  const hora = splitTime[0];

  return hora;
};

// Formats a date to show how much time has passed
export const formatToTimePassed = (date: Date | null) => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  if (diffMs < 0) return "Fecha futura";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} semana${weeks !== 1 ? "s" : ""}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Hace ${months} mes${months !== 1 ? "es" : ""}`;
  }

  const years = Math.floor(diffDays / 365);
  return `Hace ${years} año${years !== 1 ? "s" : ""}`;
};

// Takes: Wed Mar 05 2025 15:06:42 GMT-0300 (hora de verano de Chile) => Returns: 2025-03-05T18:06:42.000Z
export const formatDateForDB = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString();
};

// Takes: 2025-03-05T18:06:42.000Z => Returns: Wed Mar 05 2025 15:06:42 GMT-0300 (hora de verano de Chile)
export const formatDateToLocal = (isoString: string) => {
  const date = new Date(isoString);
  return date.toString();
};

export const formatNumber = (num: number | string) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatRUT = (rut: string | number) => {
  if (!rut) return "";
  return formatNumber(rut) + "-" + getDV(String(rut));
};

export const formatPhone = (phone?: string | number) => {
  if (!phone) return "";
  return phone.toString().replace(/\B(?=(\d{4})+(?!\d))/g, " ");
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeAll = (str?: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};
