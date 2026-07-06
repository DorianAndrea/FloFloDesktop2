import api from "./api";
import { validateChildId } from "../utils/validateChildId";

/*
  Lugares propios del usuario conectado.
  Esto lo usa el niño/a cuando entra a Lugares.
*/

export const getPlaces = async (search = "", order = "recientes") => {
  const response = await api.get("/places", {
    params: {
      search,
      order,
    },
  });

  return response.data;
};

export const getPlaceById = async (id) => {
  const response = await api.get(`/places/${id}`);
  return response.data;
};

export const createPlace = async (placeData) => {
  const response = await api.post("/places", placeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updatePlace = async (id, placeData) => {
  const response = await api.put(`/places/${id}`, placeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deletePlace = async (id) => {
  const response = await api.delete(`/places/${id}`);
  return response.data;
};

export const completePlace = async (id) => {
  const response = await api.post(`/places/${id}/complete`);
  return response.data;
};

export const getPlaceSteps = async (placeId) => {
  const response = await api.get(`/places/${placeId}/steps`);
  return response.data;
};

export const createPlaceStep = async (placeId, stepData) => {
  const response = await api.post(`/places/${placeId}/steps`, stepData);
  return response.data;
};

export const replacePlaceSteps = async (placeId, steps) => {
  const response = await api.put(`/places/${placeId}/steps/replace`, {
    steps,
  });

  return response.data;
};

/*
  Lugares de un hijo/a asociado.
  Esto lo usa el padre/cuidador cuando está viendo un niño activo.
*/

export const getChildPlaces = async (
  childId,
  search = "",
  order = "recientes",
) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/places/children/${cleanChildId}`, {
    params: {
      search,
      order,
    },
  });

  return response.data;
};

export const getChildPlaceById = async (childId, id) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(`/places/children/${cleanChildId}/${id}`);
  return response.data;
};

export const createChildPlace = async (childId, placeData) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(`/places/children/${cleanChildId}`, placeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateChildPlace = async (childId, id, placeData) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.put(
    `/places/children/${cleanChildId}/${id}`,
    placeData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const deleteChildPlace = async (childId, id) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.delete(`/places/children/${cleanChildId}/${id}`);
  return response.data;
};

export const completeChildPlace = async (childId, id) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(
    `/places/children/${cleanChildId}/${id}/complete`,
  );

  return response.data;
};

export const getChildPlaceSteps = async (childId, placeId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/places/children/${cleanChildId}/${placeId}/steps`,
  );

  return response.data;
};

export const createChildPlaceStep = async (childId, placeId, stepData) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.post(
    `/places/children/${cleanChildId}/${placeId}/steps`,
    stepData,
  );

  return response.data;
};

export const replaceChildPlaceSteps = async (childId, placeId, steps) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.put(
    `/places/children/${cleanChildId}/${placeId}/steps/replace`,
    {
      steps,
    },
  );

  return response.data;
};