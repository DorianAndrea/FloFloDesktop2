import api from "./api";

export const createConversation = async (conversationData) => {
  const response = await api.post("/conversations", conversationData);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get("/conversations");
  return response.data;
};

export const completeConversation = async (conversationId) => {
  const response = await api.post(`/conversations/${conversationId}/complete`);
  return response.data;
};

export const getConversationProgress = async () => {
  const response = await api.get(
    "/conversations/progress"
  );

  return response.data;
};

