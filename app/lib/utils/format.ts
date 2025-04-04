export const formatDate = (date: Date | null) => {
  if (!date) return "";
  const esDate = date.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const splitDate = esDate.toString().split(" ");
  const dia = splitDate[0];
  const mes = splitDate[2][0].toUpperCase() + splitDate[2].slice(1, 3);
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

export const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
