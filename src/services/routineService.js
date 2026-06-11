import api from "./api";

export const getRoutines = async () => {
  const response = await api.get("/routines");
  return response.data;
};

export const createRoutine = async (routine) => {
  const response = await api.post("/routines", routine);
  return response.data;
};

export const deleteRoutine = async (id) => {
  const response = await api.delete(`/routines/${id}`);
  return response.data;
};

export const updateRoutine = async (id, routine) => {
  const response = await api.put(`/routines/${id}`, routine);
  return response.data;
};

export const completeRoutine = async (id) => {
  const response = await api.post(`/routines/${id}/complete`);
  return response.data;
};