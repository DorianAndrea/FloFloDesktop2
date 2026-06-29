export const cleanRut = (rut = "") => {
  return String(rut).replace(/[^0-9kK]/g, "").toUpperCase();
};

export const formatRut = (value = "") => {
  const rut = cleanRut(value);

  if (!rut) return "";
  if (rut.length <= 1) return rut;

  const dv = rut.slice(-1);
  let cuerpo = rut.slice(0, -1);

  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpo}-${dv}`;
};