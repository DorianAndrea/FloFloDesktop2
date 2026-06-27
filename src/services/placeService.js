import api from "./api";

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
  const response = await api.get(`/places/children/${childId}`, {
    params: {
      search,
      order,
    },
  });

  return response.data;
};

export const getChildPlaceById = async (childId, id) => {
  const response = await api.get(`/places/children/${childId}/${id}`);
  return response.data;
};

export const createChildPlace = async (childId, placeData) => {
  const response = await api.post(`/places/children/${childId}`, placeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateChildPlace = async (childId, id, placeData) => {
  const response = await api.put(
    `/places/children/${childId}/${id}`,
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
  const response = await api.delete(`/places/children/${childId}/${id}`);
  return response.data;
};

export const completeChildPlace = async (childId, id) => {
  const response = await api.post(`/places/children/${childId}/${id}/complete`);
  return response.data;
};

export const getChildPlaceSteps = async (childId, placeId) => {
  const response = await api.get(
    `/places/children/${childId}/${placeId}/steps`,
  );

  return response.data;
};

export const createChildPlaceStep = async (childId, placeId, stepData) => {
  const response = await api.post(
    `/places/children/${childId}/${placeId}/steps`,
    stepData,
  );

  return response.data;
};

export const replaceChildPlaceSteps = async (childId, placeId, steps) => {
  const response = await api.put(
    `/places/children/${childId}/${placeId}/steps/replace`,
    {
      steps,
    },
  );

  return response.data;
};