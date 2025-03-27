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
