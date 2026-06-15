import api from "./api";

export const generatePlaceSteps = async (placeData) => {
  const response = await api.post("/ai/generate-place-steps", placeData);
  return response.data;
};

export const generateConversation = async (conversationData) => {
  const response = await api.post("/ai/generate-conversation", conversationData);
  return response.data;
};

export const generateContactConversation = async (data) => {
  const response = await api.post("/ai/contact-conversation", data);
  return response.data;
};