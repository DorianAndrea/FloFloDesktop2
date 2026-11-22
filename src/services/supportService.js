import api from "./api";

export const getSupportTypes = async () => {
  const response = await api.get("/support/types");
  return response.data;
};

export const registerSupportObservation = async (
  personId,
  progressId,
  supportCodes,
  notes = null,
) => {
  const response = await api.post(
    `/support/people/${personId}/observations`,
    {
      sourceModule: "routines",
      sourceEntityType: "routine_step_progress",
      sourceEntityId: progressId,
      supportCodes,
      notes,
    },
  );

  return response.data;
};