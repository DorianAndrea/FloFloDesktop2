import api from "./api";

export const getChildrenByParent = async (parentId) => {
  const response = await api.get(`/parent-child/${parentId}/children`);
  return response.data;
};

export const linkChildToParent = async (parentId, childEmail) => {
  const response = await api.post(`/parent-child/${parentId}/children`, {
    childEmail,
  });

  return response.data;
};