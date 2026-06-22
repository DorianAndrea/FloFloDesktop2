import api from "./api";

export const getMyChildren = async () => {
  const response = await api.get("/parent-child/me/children");
  return response.data;
};

export const linkChildToMe = async (childEmail) => {
  const response = await api.post("/parent-child/me/children", {
    childEmail,
  });

  return response.data;
};