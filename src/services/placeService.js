import api from "./api";

export const getPlaces = async () => {
  const response = await api.get("/places");
  return response.data;
};

export const getPlaceById = async (id) => {
  const response = await api.get(`/places/${id}`);
  return response.data;
};

export const createPlace = async (placeData) => {
  const response = await api.post("/places", placeData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
