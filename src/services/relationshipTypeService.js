import api from "./api";

export const getRelationshipTypes = async () => {
  const response = await api.get("/relationship-types");
  return response.data;
};