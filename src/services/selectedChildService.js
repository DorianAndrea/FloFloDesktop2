import api from "./api";

export const getParentChildrenForSelection = async () => {
  const response = await api.get("/parent-child/me/children");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.children)) {
    return response.data.children;
  }

  if (Array.isArray(response.data.data)) {
    return response.data.data;
  }

  return [];
};