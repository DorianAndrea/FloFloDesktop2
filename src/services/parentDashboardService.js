import api from "./api";
import { validateChildId } from "../utils/validateChildId";

export const getMyDashboard = async () => {
  const response = await api.get("/parent-dashboard/me");
  return response.data;
};

export const getChildDashboard = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/parent-dashboard/children/${cleanChildId}`,
  );

  return response.data;
};

export const getChildWeeklySupportPlanHistory = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/parent-dashboard/children/${cleanChildId}/weekly-plan-history`,
  );

  return response.data;
};

export const getChildEvolutionDashboard = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/parent-dashboard/children/${cleanChildId}/evolution`,
  );

  return response.data;
};