import api from "./api";
import { validateChildId } from "../utils/validateChildId";

export const getExperienceRecommendations = async (childId = null) => {
  if (childId !== null && childId !== undefined && childId !== "") {
    const cleanChildId = validateChildId(childId);

    const response = await api.get(
      "/experience-recommendations",
      {
        params: {
          childId: cleanChildId,
        },
      },
    );

    return response.data;
  }

  const response = await api.get(
    "/experience-recommendations",
  );

  return response.data;
};

