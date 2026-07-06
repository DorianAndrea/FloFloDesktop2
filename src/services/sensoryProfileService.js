import api from "./api";
import { validateChildId } from "../utils/validateChildId";

/*
  Perfil sensorial propio del usuario conectado.
  Esto lo usa el niño/a.
*/

export const getMySensoryProfile = async () => {
  const response = await api.get("/sensory-profile/me");
  return response.data;
};

export const saveMySensoryProfile = async (data) => {
  const response = await api.post("/sensory-profile/me", data);
  return response.data;
};

export const updateMySensoryProfile = async (data) => {
  const response = await api.put("/sensory-profile/me", data);
  return response.data;
};

export const getMySensoryProfileHistory = async () => {
  const response = await api.get("/sensory-profile/me/history");
  return response.data;
};

/*
  Perfil sensorial de un hijo/a asociado.
  Esto lo usa el padre/cuidador cuando está viendo un niño activo.
*/

export const getChildSensoryProfile = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/sensory-profile/children/${cleanChildId}`);
  return response.data;
};

export const getChildSensoryProfileHistory = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/sensory-profile/children/${cleanChildId}/history`,
  );

  return response.data;
};

export const saveChildSensoryProfile = async (childId, data) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(
    `/sensory-profile/children/${cleanChildId}`,
    data,
  );

  return response.data;
};

export const updateChildSensoryProfile = async (childId, data) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.put(
    `/sensory-profile/children/${cleanChildId}`,
    data,
  );

  return response.data;
};