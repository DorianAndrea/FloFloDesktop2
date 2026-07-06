import api from "./api";
import { validateChildId } from "../utils/validateChildId";

/*
  Logros propios del usuario conectado.
  Esto lo usa el niño/a.
*/

export const getAchievements = async () => {
  const response = await api.get("/achievements");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.achievements)) {
    return response.data.achievements;
  }

  return [];
};

/*
  Logros de un hijo/a asociado.
  Esto lo usa el padre/cuidador cuando está viendo un niño activo.
*/

export const getChildAchievements = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/achievements/children/${cleanChildId}`);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.achievements)) {
    return response.data.achievements;
  }

  return [];
};