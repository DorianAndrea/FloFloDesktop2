import api from "./api";
import { validateChildId } from "../utils/validateChildId";

const validatePositiveInteger = (value, label) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new Error(`${label} inválido.`);
  }

  return numberValue;
};

const normalizeEmail = (email) => {
  return String(email || "").trim().toLowerCase();
};

const normalizeToken = (token) => {
  return String(token || "").trim();
};

export const getChildSupportTeam = async (childId) => {
  const cleanChildId = validateChildId(childId);

  const response = await api.get(
    `/parent-child/children/${cleanChildId}/team`,
  );

  return Array.isArray(response.data?.team) ? response.data.team : [];
};

export const createSupportTeamInvitation = async ({
  childId,
  email,
  relationshipKey,
  message,
}) => {
  const cleanChildId = validateChildId(childId);
  const cleanEmail = normalizeEmail(email);
  const cleanRelationshipKey = String(relationshipKey || "").trim();
  const cleanMessage = String(message || "").trim();

  if (!cleanEmail) {
    throw new Error("Debes ingresar el correo de la persona invitada.");
  }

  if (!cleanRelationshipKey) {
    throw new Error("Debes seleccionar el tipo de integrante.");
  }

  const response = await api.post(
    `/parent-child/children/${cleanChildId}/team/invitations`,
    {
      email: cleanEmail,
      relationshipKey: cleanRelationshipKey,
      message: cleanMessage,
    },
  );

  return response.data;
};

export const getSupportTeamInvitation = async (token) => {
  const cleanToken = normalizeToken(token);

  if (!cleanToken) {
    throw new Error("La invitación no es válida.");
  }

  const response = await api.get(
    `/parent-child/team/invitations/${encodeURIComponent(cleanToken)}`,
  );

  return response.data?.invitation || null;
};

export const acceptSupportTeamInvitation = async (token) => {
  const cleanToken = normalizeToken(token);

  if (!cleanToken) {
    throw new Error("La invitación no es válida.");
  }

  const response = await api.post(
    `/parent-child/team/invitations/${encodeURIComponent(cleanToken)}/accept`,
  );

  return response.data;
};

export const cancelSupportTeamInvitation = async ({
  childId,
  invitationId,
}) => {
  const cleanChildId = validateChildId(childId);
  const cleanInvitationId = validatePositiveInteger(
    invitationId,
    "Invitación",
  );

  const response = await api.patch(
    `/parent-child/children/${cleanChildId}/team/invitations/${cleanInvitationId}/cancel`,
  );

  return response.data;
};

export const removeSupportTeamMember = async ({
  childId,
  memberId,
}) => {
  const cleanChildId = validateChildId(childId);
  const cleanMemberId = validatePositiveInteger(memberId, "Integrante");

  const response = await api.delete(
    `/parent-child/children/${cleanChildId}/team/members/${cleanMemberId}`,
  );

  return response.data;
};