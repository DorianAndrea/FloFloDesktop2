import api from "./api";

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