import api from "./api";

/*
  Contactos propios del usuario conectado.
  Esto lo usa el niño/a cuando entra a Amigos/Contactos.
*/

export const getContacts = async (search = "", order = "recientes") => {
  const response = await api.get("/contacts", {
    params: {
      search,
      order,
    },
  });

  return response.data;
};

export const getContactById = async (id) => {
  const response = await api.get(`/contacts/${id}`);
  return response.data;
};

export const createContact = async (contact) => {
  const response = await api.post("/contacts", contact, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateContact = async (id, contact) => {
  const response = await api.put(`/contacts/${id}`, contact, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

/*
  Contactos de un hijo/a asociado.
  Esto lo usa el padre/cuidador cuando está viendo un niño activo.
*/

export const getChildContacts = async (
  childId,
  search = "",
  order = "recientes",
) => {
  const response = await api.get(`/contacts/children/${childId}`, {
    params: {
      search,
      order,
    },
  });

  return response.data;
};

export const getChildContactById = async (childId, id) => {
  const response = await api.get(`/contacts/children/${childId}/${id}`);
  return response.data;
};

export const createChildContact = async (childId, contact) => {
  const response = await api.post(`/contacts/children/${childId}`, contact, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateChildContact = async (childId, id, contact) => {
  const response = await api.put(`/contacts/children/${childId}/${id}`, contact, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteChildContact = async (childId, id) => {
  const response = await api.delete(`/contacts/children/${childId}/${id}`);
  return response.data;
};