import api from "./api";
import { validateChildId } from "../utils/validateChildId";

/*
  Rutinas propias del usuario conectado.
  Esto lo usa el niño/a cuando entra a Rutinas.
*/

export const getRoutines = async () => {
  const response = await api.get("/routines");
  return response.data;
};

export const getTodayRoutines = async () => {
  const response = await api.get("/routines/today");
  return response.data;
};

export const getRoutineHistory = async () => {
  const response = await api.get("/routines/history");
  return response.data;
};

export const createRoutine = async (routine) => {
  const response = await api.post("/routines", routine);
  return response.data;
};

export const updateRoutine = async (id, routine) => {
  const response = await api.put(`/routines/${id}`, routine);
  return response.data;
};

export const deleteRoutine = async (id) => {
  const response = await api.delete(`/routines/${id}`);
  return response.data;
};

export const completeRoutine = async (id) => {
  const response = await api.post(`/routines/${id}/complete`);
  return response.data;
};

/*
  Rutinas de un hijo/a asociado.
  Esto lo usa el padre/cuidador cuando está viendo un niño activo.
*/

export const getChildRoutines = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/routines/children/${cleanChildId}`);
  return response.data;
};

export const getChildTodayRoutines = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/routines/children/${cleanChildId}/today`);
  return response.data;
};

export const getChildRoutineHistory = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/routines/children/${cleanChildId}/history`);
  return response.data;
};

export const createChildRoutine = async (childId, routine) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(`/routines/children/${cleanChildId}`, routine);
  return response.data;
};

export const updateChildRoutine = async (childId, id, routine) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.put(
    `/routines/children/${cleanChildId}/${id}`,
    routine,
  );

  return response.data;
};

export const deleteChildRoutine = async (childId, id) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.delete(`/routines/children/${cleanChildId}/${id}`);
  return response.data;
};

export const completeChildRoutine = async (childId, id) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(
    `/routines/children/${cleanChildId}/${id}/complete`,
  );

  return response.data;
};