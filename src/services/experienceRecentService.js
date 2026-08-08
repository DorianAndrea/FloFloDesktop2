import api from "./api";

export const getExperienceRecents = async (childId = null) => {
  const url = childId
    ? `/experience-recents/children/${childId}`
    : "/experience-recents";

  const { data } = await api.get(url);

  return data;
};

export const registerExperienceRecent = async (
  templateId,
  childId = null,
) => {
  const url = childId
    ? `/experience-recents/children/${childId}/${templateId}`
    : `/experience-recents/${templateId}`;

  const { data } = await api.post(url);

  return data;
};