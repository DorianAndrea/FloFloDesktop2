import api from "./api";

const normalizeEmail = (email) => {
  return String(email || "").trim().toLowerCase();
};

const normalizeLinkCode = (code) => {
  return String(code || "").replace(/\s+/g, "").trim();
};

const validateChildEmail = (email) => {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    throw new Error("Debes ingresar el correo del niño/a.");
  }

  return cleanEmail;
};

const validateLinkCode = (code) => {
  const cleanCode = normalizeLinkCode(code);

  if (!cleanCode) {
    throw new Error("Debes ingresar el código de vinculación.");
  }

  if (!/^\d{6}$/.test(cleanCode)) {
    throw new Error("El código de vinculación debe tener 6 dígitos.");
  }

  return cleanCode;
};

/*
  Niños asociados al cuidador conectado.
  Esto lo usa el Panel Padres y el selector de niño activo.
*/

export const getMyChildren = async () => {
  const response = await api.get("/parent-child/me/children");
  return response.data;
};

/*
  Código temporal generado por la cuenta niño/a.
  Esto lo usa Mi Perfil del niño/a.
*/

export const createMyLinkCode = async () => {
  const response = await api.post("/parent-child/me/link-code");
  return response.data;
};

/*
  Vincular niño/a al cuidador conectado.
  Esto lo usa Panel Padres.
*/

export const linkChildToMe = async ({ childEmail, linkCode }) => {
  const cleanEmail = validateChildEmail(childEmail);
  const cleanCode = validateLinkCode(linkCode);

  const response = await api.post("/parent-child/me/children", {
    childEmail: cleanEmail,
    linkCode: cleanCode,
  });

  return response.data;
};