import api from "./api";
import { validateChildId } from "../utils/validateChildId";

/*
  Conversaciones propias del usuario conectado.
  Esto lo usa el niño/a.
*/

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

/*
  Conversaciones del hijo/a seleccionado.
  Esto lo usa el padre/cuidador.
*/

export const createChildConversation = async (childId, conversationData) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(
    `/conversations/children/${cleanChildId}`,
    conversationData,
  );

  return response.data;
};

export const getChildConversations = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/conversations/children/${cleanChildId}`);
  return response.data;
};

export const completeChildConversation = async (childId, conversationId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(
    `/conversations/children/${cleanChildId}/${conversationId}/complete`,
  );

  return response.data;
};

export const getChildConversationProgress = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/conversations/children/${cleanChildId}/progress`,
  );

  return response.data;
};

export const getChildPaginatedConversations = async (
  childId,
  page = 1,
  limit = 6,
  search = "",
  order = "recientes",
) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/conversations/children/${cleanChildId}/paginated`,
    {
      params: {
        page,
        limit,
        search,
        order,
      },
    },
  );

  return response.data;
};

export const deleteChildConversation = async (childId, conversationId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.delete(
    `/conversations/children/${cleanChildId}/${conversationId}`,
  );

  return response.data;
};

export const updateChildConversation = async (
  childId,
  conversationId,
  conversationData,
) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.put(
    `/conversations/children/${cleanChildId}/${conversationId}`,
    conversationData,
  );

  return response.data;
};

export const toggleFavoriteChildConversation = async (
  childId,
  conversationId,
) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.patch(
    `/conversations/children/${cleanChildId}/${conversationId}/favorite`,
  );

  return response.data;
};