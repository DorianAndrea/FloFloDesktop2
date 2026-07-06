import api from "./api";

export const getMyChildren = async () => {
  const response = await api.get("/parent-child/me/children");
  return response.data;
};

export const createMyLinkCode = async () => {
  const response = await api.post("/parent-child/me/link-code");
  return response.data;
};

export const linkChildToMe = async ({ childEmail, linkCode }) => {
  const response = await api.post("/parent-child/me/children", {
    childEmail,
    linkCode,
  });

  return response.data;
};