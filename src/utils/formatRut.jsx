export const formatRut = (value) => {
  if (!value) return "";

  let rut = value.replace(/[^0-9kK]/g, "").toUpperCase();

  if (rut.length <= 1) return rut;

  const dv = rut.slice(-1);
  let cuerpo = rut.slice(0, -1);

  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpo}-${dv}`;
};
export const cleanRut = (rut) => {
  return rut.replace(/[.-]/g, "");
};