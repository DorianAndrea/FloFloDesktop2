import api from "./api";

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

export const generateIntelligentObservation = async (childId, periodDays = 30) => {
  const response = await api.post(
    `/intelligent-observations/children/${childId}/generate?periodDays=${periodDays}`,
  );

  return response.data;
};

export const getLatestIntelligentObservation = async (childId) => {
  const response = await api.get(
    `/intelligent-observations/children/${childId}/latest`,
  );

  return response.data;
};

export const getIntelligentObservationHistory = async (childId) => {
  const response = await api.get(
    `/intelligent-observations/children/${childId}/history`,
  );

  return response.data;
};

export const getIntelligentObservationById = async (childId, reportId) => {
  const response = await api.get(
    `/intelligent-observations/children/${childId}/reports/${reportId}`,
  );

  return response.data;
};

export const downloadLatestIntelligentObservationPdf = async (childId) => {
  const reportInfo = await getLatestIntelligentObservation(childId);

  const response = await api.get(
    `/intelligent-observations/children/${childId}/latest/pdf`,
    {
      responseType: "blob",
    },
  );

  const fileName = buildPdfFileName({
    childName: reportInfo?.childName,
    createdAt: reportInfo?.createdAt,
    childId,
  });

  downloadBlobAsPdf(response.data, fileName);
};

export const downloadIntelligentObservationPdfById = async (
  childId,
  reportId,
) => {
  const reportInfo = await getIntelligentObservationById(childId, reportId);

  const response = await api.get(
    `/intelligent-observations/children/${childId}/reports/${reportId}/pdf`,
    {
      responseType: "blob",
    },
  );

  const fileName = buildPdfFileName({
    childName: reportInfo?.childName,
    createdAt: reportInfo?.createdAt,
    childId,
    reportId,
  });

  downloadBlobAsPdf(response.data, fileName);
};