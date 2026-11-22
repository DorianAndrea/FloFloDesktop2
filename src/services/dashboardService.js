import api from "./api";

import {
  validateChildId,
} from "../utils/validateChildId";

/*
 * Dashboard general
 */

export const getDashboardOverview = async () => {
  const response = await api.get(
    "/dashboard/overview"
  );

  return response.data;
};

/*
 * Dashboard individual
 */

export const getChildDashboardOverview = async (
  childId
) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/dashboard/children/${cleanChildId}/overview`
  );

  return response.data;
};

/*
 * Distribución general de apoyos
 */

export const getChildSupport = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/dashboard/children/${cleanChildId}/support`
  );

  return response.data;
};

/*
 * Análisis detallado de rutinas,
 * acciones y niveles de apoyo.
 */

export const getChildRoutineAnalytics = async (
  childId
) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/dashboard/children/${cleanChildId}/routines`
  );

  return response.data;
};