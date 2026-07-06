export const validateChildId = (childId) => {
  const numberId = Number(childId);

  if (!Number.isInteger(numberId) || numberId <= 0) {
    throw new Error("Debes seleccionar un niño/a válido.");
  }

  return numberId;
};