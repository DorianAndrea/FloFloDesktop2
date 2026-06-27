import api from "./api";

/*
  Conversaciones de contactos propias del usuario conectado.
  Esto lo usa el niño/a.
*/

export const getAllContactConversations = async () => {
  const response = await api.get("/contact-conversations");
  return response.data;
};

export const getContactConversationsByContactId = async (contactId) => {
  const response = await api.get(`/contact-conversations/contact/${contactId}`);
  return response.data;
};

export const createContactConversation = async (conversation) => {
  const response = await api.post("/contact-conversations", conversation);
  return response.data;
};

export const updateContactConversation = async (id, conversation) => {
  const response = await api.put(`/contact-conversations/${id}`, conversation);
  return response.data;
};

export const deleteContactConversation = async (id) => {
  const response = await api.delete(`/contact-conversations/${id}`);
  return response.data;
};

export const completeContactConversation = async (id) => {
  const response = await api.post(`/contact-conversations/${id}/complete`);
  return response.data;
};

export const getContactConversationProgress = async () => {
  const response = await api.get("/contact-conversations/progress");
  return response.data;
};

export const toggleFavoriteContactConversation = async (id) => {
  const response = await api.post(`/contact-conversations/${id}/favorite`);
  return response.data;
};

/*
  Conversaciones de contactos de un hijo/a asociado.
  Esto lo usa el padre/cuidador cuando está viendo un niño activo.
*/

export const getChildAllContactConversations = async (childId) => {
  const response = await api.get(`/contact-conversations/children/${childId}`);
  return response.data;
};

export const getChildContactConversationsByContactId = async (
  childId,
  contactId,
) => {
  const response = await api.get(
    `/contact-conversations/children/${childId}/contact/${contactId}`,
  );

  return response.data;
};

export const createChildContactConversation = async (childId, conversation) => {
  const response = await api.post(
    `/contact-conversations/children/${childId}`,
    conversation,
  );

  return response.data;
};

export const updateChildContactConversation = async (
  childId,
  id,
  conversation,
) => {
  const response = await api.put(
    `/contact-conversations/children/${childId}/${id}`,
    conversation,
  );

  return response.data;
};

export const deleteChildContactConversation = async (childId, id) => {
  const response = await api.delete(
    `/contact-conversations/children/${childId}/${id}`,
  );

  return response.data;
};

export const completeChildContactConversation = async (childId, id) => {
  const response = await api.post(
    `/contact-conversations/children/${childId}/${id}/complete`,
  );

  return response.data;
};

export const getChildContactConversationProgress = async (childId) => {
  const response = await api.get(
    `/contact-conversations/children/${childId}/progress`,
  );

  return response.data;
};

export const toggleFavoriteChildContactConversation = async (childId, id) => {
  const response = await api.post(
    `/contact-conversations/children/${childId}/${id}/favorite`,
  );

  return response.data;
};