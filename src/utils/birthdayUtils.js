export const parseLocalDate = (dateValue) => {
  if (!dateValue) return null;

  const cleanDate = String(dateValue).slice(0, 10);
  const [year, month, day] = cleanDate.split("-").map(Number);

  if (!year || !month || !day) return null;

  const parsedDate = new Date(year, month - 1, day);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate;
};

export const calculateAge = (birthDate) => {
  const birth = parseLocalDate(birthDate);

  if (!birth) return null;

  const today = new Date();

  if (birth > today) return null;

  let age = today.getFullYear() - birth.getFullYear();

  const birthdayAlreadyPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!birthdayAlreadyPassed) {
    age -= 1;
  }

  return age;
};

export const isBirthdayToday = (birthDate) => {
  const birth = parseLocalDate(birthDate);

  if (!birth) return false;

  const today = new Date();

  return (
    today.getMonth() === birth.getMonth() &&
    today.getDate() === birth.getDate()
  );
};

export const formatAgeLabel = (age) => {
  if (age === null || age === undefined) return "Edad no disponible";

  return age === 1 ? "1 año" : `${age} años`;
};