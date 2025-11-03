import dayjs from "dayjs";

export const getDV = (rut?: string | number) => {
  if (!rut) {
    return null;
  }
  rut = rut.toString();
  let sum = 0;
  let multiplier = 2;
  for (let i = rut.length - 1; i >= 0; i--) {
    const digit = parseInt(rut.charAt(i), 10);
    sum += digit * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
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

export const getAge = (birthdate: string) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const getDaysBetween = (start: string, end: string) => {
  const startDate = dayjs(start).startOf("day");
  const endDate = dayjs(end).startOf("day");

  const dates = [];
  let current = startDate;

  while (current.isBefore(endDate.add(1, "day"))) {
    dates.push(current.clone());
    current = current.add(1, "day");
  }

  return dates;
};

export const getYearsBetween = (start: string, end: string) => {
  const startYear = parseInt(start);
  const endYear = parseInt(end);
  const years = [];

  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString());
  }

  return years;
};
