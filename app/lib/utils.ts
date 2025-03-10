import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const formatDate = (date: Date) => {
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

export const capitalizeEachWord = (str: string) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const getDV = (rut: string) => {
  let sum = 0;
  let multiplier = 2;
  for (let i = rut.length - 1; i >= 0; i--) {
    const digit = parseInt(rut.charAt(i), 10);
    sum += digit * multiplier;
    multiplier = (multiplier % 7) + 2;
  }
  const dv = 11 - (sum % 11);
  if (dv === 11) {
    return "0";
  } else if (dv === 10) {
    return "K";
  } else {
    return dv.toString();
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
