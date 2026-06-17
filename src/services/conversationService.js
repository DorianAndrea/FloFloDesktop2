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
  const response = await api.get("/conversations/progress");

  return response.data;
};

export const getPaginatedConversations = async (
  page = 1,
  limit = 6,
  search = "",
  order = "recientes",
) => {
  const response = await api.get("/conversations/paginated", {
    params: {
      page,
      limit,
      search,
      order,
    },
  });

  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/conversations/${conversationId}`);
  return response.data;
};

export const updateConversation = async (conversationId, conversationData) => {
  const response = await api.put(
    `/conversations/${conversationId}`,
    conversationData,
  );

  return response.data;
};

export const toggleFavoriteConversation = async (conversationId) => {
  const response = await api.patch(`/conversations/${conversationId}/favorite`);
  return response.data;
};