import api from "./api";
import { validateChildId } from "../utils/validateChildId";

/*
  Progreso propio del usuario conectado.
  Esto lo usa el niño/a.
*/

export const getUserProgress = async () => {
  const response = await api.get("/progress");
  return response.data;
};

/*
  Progreso de un hijo/a asociado.
  Esto lo usa el padre/cuidador cuando está viendo un niño activo.
*/

export const getChildProgress = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/progress/children/${cleanChildId}`);
  return response.data;
};