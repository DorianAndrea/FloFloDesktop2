import api from "./api";
import { validateChildId } from "../utils/validateChildId";

const validatePeriodDays = (periodDays) => {
  const numberDays = Number(periodDays);

  const allowedDays = [7, 30, 60, 90];

  if (!allowedDays.includes(numberDays)) {
    return 30;
  }

  return numberDays;
};
const validateReportId = (reportId) => {
  const numberId = Number(reportId);

  if (!Number.isInteger(numberId) || numberId <= 0) {
    throw new Error("Informe inválido.");
  }

  return numberId;
};

const slugify = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
};

const buildPdfFileName = ({ childName, createdAt, childId, reportId }) => {
  const cleanChildName = slugify(childName) || `nino-${childId || "sin-id"}`;

  const date = createdAt
    ? new Date(createdAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const reportPart = reportId ? `-${reportId}` : "";

  return `informe-inteligente-${cleanChildName}-${date}${reportPart}.pdf`;
};

const downloadBlobAsPdf = (blobData, fileName) => {
  const blob = new Blob([blobData], {
    type: "application/pdf",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

/*
  Informe Inteligente.
  Exclusivo para padre/cuidador sobre un hijo/a asociado.
*/

export const generateIntelligentObservation = async (
  childId,
  periodDays = 30,
) => {
  const cleanChildId = validateChildId(childId);
  const cleanPeriodDays = validatePeriodDays(periodDays);

  const response = await api.post(
    `/intelligent-observations/children/${cleanChildId}/generate?periodDays=${cleanPeriodDays}`,
  );

  return response.data;
};

export const getLatestIntelligentObservation = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/intelligent-observations/children/${cleanChildId}/latest`,
  );

  return response.data;
};

export const getIntelligentObservationHistory = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/intelligent-observations/children/${cleanChildId}/history`,
  );

  return response.data;
};

export const getIntelligentObservationById = async (childId, reportId) => {
  const cleanChildId = validateChildId(childId);
  const cleanReportId = validateReportId(reportId);

  const response = await api.get(
    `/intelligent-observations/children/${cleanChildId}/reports/${cleanReportId}`,
  );

  return response.data;
};

export const downloadLatestIntelligentObservationPdf = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const reportInfo = await getLatestIntelligentObservation(cleanChildId);

  const response = await api.get(
    `/intelligent-observations/children/${cleanChildId}/latest/pdf`,
    {
      responseType: "blob",
    },
  );

  const fileName = buildPdfFileName({
    childName: reportInfo?.childName,
    createdAt: reportInfo?.createdAt || reportInfo?.created_at,
    childId: cleanChildId,
  });

  downloadBlobAsPdf(response.data, fileName);
};

export const downloadIntelligentObservationPdfById = async (
  childId,
  reportId,
) => {
  const cleanChildId = validateChildId(childId);
  const cleanReportId = validateReportId(reportId);

  const reportInfo = await getIntelligentObservationById(
    cleanChildId,
    cleanReportId,
  );

  const response = await api.get(
    `/intelligent-observations/children/${cleanChildId}/reports/${cleanReportId}/pdf`,
    {
      responseType: "blob",
    },
  );

  const fileName = buildPdfFileName({
    childName: reportInfo?.childName,
    createdAt: reportInfo?.createdAt || reportInfo?.created_at,
    childId: cleanChildId,
    reportId: cleanReportId,
  });

  downloadBlobAsPdf(response.data, fileName);
};