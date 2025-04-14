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
