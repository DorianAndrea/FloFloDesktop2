import api from "./api";
import { validateChildId } from "../utils/validateChildId";

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
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/contacts/children/${cleanChildId}`, {
    params: {
      search,
      order,
    },
  });

  return response.data;
};

export const getChildContactById = async (childId, id) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/contacts/children/${cleanChildId}/${id}`);
  return response.data;
};

export const createChildContact = async (childId, contact) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(`/contacts/children/${cleanChildId}`, contact, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateChildContact = async (childId, id, contact) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.put(
    `/contacts/children/${cleanChildId}/${id}`,
    contact,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const deleteChildContact = async (childId, id) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.delete(`/contacts/children/${cleanChildId}/${id}`);
  return response.data;
};