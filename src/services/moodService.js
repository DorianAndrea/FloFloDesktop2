import api from "./api";
import { validateChildId } from "../utils/validateChildId";

/*
  Estados de ánimo propios del usuario conectado.
  Esto lo usa el niño/a.
*/

export const getMoods = async () => {
  const response = await api.get("/moods");
  return response.data;
};

export const createMood = async (mood) => {
  const response = await api.post("/moods", mood);
  return response.data;
};

/*
  Estados de ánimo del hijo/a seleccionado.
  Esto lo usa el padre/cuidador.
*/

export const getChildMoods = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/moods/children/${cleanChildId}`);
  return response.data;
};

export const createChildMood = async (childId, mood) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(`/moods/children/${cleanChildId}`, mood);
  return response.data;
};