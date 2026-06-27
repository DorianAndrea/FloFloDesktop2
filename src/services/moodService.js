import api from "./api";

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
  const response = await api.get(`/moods/children/${childId}`);
  return response.data;
};

export const createChildMood = async (childId, mood) => {
  const response = await api.post(`/moods/children/${childId}`, mood);
  return response.data;
};