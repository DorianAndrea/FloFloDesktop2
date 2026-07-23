import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getContactById,
  getChildContactById,
} from "../services/contactService";
import { generateContactConversation } from "../services/aiService";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import {
  getContactConversationsByContactId,
  createContactConversation,
  updateContactConversation,
  deleteContactConversation,
  getChildContactConversationsByContactId,
  createChildContactConversation,
  updateChildContactConversation,
  deleteChildContactConversation,
} from "../services/contactConversationService";
import { getCachedData, setCachedData } from "../utils/cache";

const PersonaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
    canManageSelectedChildTeam,
  } = useSelectedChild();

  const { showFeedback, showConfirm } = useFeedback();
  const previousSelectedChildId = useRef(selectedChildId);

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const canDeleteConversations =
    isParentMode && Boolean(canManageSelectedChildTeam);

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const protagonistName = isParentMode
    ? childName
    : user?.firstName || user?.first_name || user?.name || "Félix";

  const [contact, setContact] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [generatedSituation, setGeneratedSituation] = useState("");
  const [whatToSay, setWhatToSay] = useState("");
  const [reminder, setReminder] = useState("");
  const [generandoIA, setGenerandoIA] = useState(false);

  const [correctAnswer, setCorrectAnswer] = useState("");
  const [wrongAnswer1, setWrongAnswer1] = useState("");
  const [wrongAnswer2, setWrongAnswer2] = useState("");

  const [editingConversationId, setEditingConversationId] = useState(null);

  const getPersonaDetalleCacheKey = () => {
    const ownerId = isParentMode ? selectedChildId : user?.id;

    return ownerId ? `floflo_persona_detalle_${ownerId}_${id}` : null;
  };

  const validateParentChildSelection = () => {
    if (!isParent) return true;

    if (!selectedChildId) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta niño/a activo",
        title: "Selecciona un niño/a",
        message:
          "Para gestionar conversaciones desde tu perfil, primero debes tener un niño/a asociado y seleccionado.",
      });

      return false;
    }

    return true;
  };

  const fetchContactData = async () => {
    return isParentMode
      ? await getChildContactById(selectedChildId, id)
      : await getContactById(id);
  };

  const fetchConversationsData = async () => {
    const data = isParentMode
      ? await getChildContactConversationsByContactId(selectedChildId, id)
      : await getContactConversationsByContactId(id);

    return Array.isArray(data) ? data : [];
  };

  const loadPage = async ({ useCache = true } = {}) => {
    let hasCache = false;

    try {
      if (!user) return;

      if (isParent && loadingChildren) {
        return;
      }

      const cacheKey = getPersonaDetalleCacheKey();
      const cachedPage = useCache && cacheKey ? getCachedData(cacheKey) : null;

      if (cachedPage) {
        hasCache = true;

        setContact(cachedPage.contact || null);
        setConversations(
          Array.isArray(cachedPage.conversations)
            ? cachedPage.conversations
            : [],
        );
        setLoading(false);
      } else {
        setLoading(true);
      }

      if (isParentWithoutChild) {
        setContact(null);
        setConversations([]);
        setLoading(false);
        return;
      }

      if (isParentMode && previousSelectedChildId.current) {
        if (
          String(previousSelectedChildId.current) !== String(selectedChildId)
        ) {
          previousSelectedChildId.current = selectedChildId;
          navigate("/amigos", { replace: true });
          setLoading(false);
          return;
        }
      }

      if (isParentMode && !previousSelectedChildId.current) {
        previousSelectedChildId.current = selectedChildId;
      }

      const [contactData, conversationsData] = await Promise.all([
        fetchContactData(),
        fetchConversationsData(),
      ]);

      setContact(contactData);
      setConversations(conversationsData);

      if (cacheKey) {
        setCachedData(cacheKey, {
          contact: contactData,
          conversations: conversationsData,
        });
      }
    } catch (error) {
      console.error(error);

      if (!hasCache) {
        setContact(null);
        setConversations([]);
      }
      if (isParentMode && error.response?.status === 404) {
        navigate("/amigos", { replace: true });
        return;
      }

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cargar la persona",
        message:
          error.response?.data?.message ||
          "La persona no existe o no tienes permiso para verla.",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshConversations = async () => {
    try {
      if (!user) return;

      if (isParentWithoutChild) {
        setConversations([]);
        return;
      }

      const cacheKey = getPersonaDetalleCacheKey();
      const conversationsData = await fetchConversationsData();

      setConversations(conversationsData);

      if (cacheKey) {
        const cachedPage = getCachedData(cacheKey);

        setCachedData(cacheKey, {
          ...(cachedPage || {}),
          contact: cachedPage?.contact || contact,
          conversations: conversationsData,
        });
      }
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar las conversaciones",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    }
  };

  useEffect(() => {
    loadPage();
  }, [id, user?.id, user?.role, selectedChildId, loadingChildren]);

  useEffect(() => {
    resetForm();
  }, [id, selectedChildId, user?.id]);

  const resetForm = () => {
    setTitle("");
    setSituation("");
    setGeneratedSituation("");
    setWhatToSay("");
    setReminder("");
    setCorrectAnswer("");
    setWrongAnswer1("");
    setWrongAnswer2("");
    setEditingConversationId(null);
  };

  const handleGenerateConversationAI = async () => {
    if (!contact) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Cargando información",
        title: "Espera un momento",
        message: "Aún se está cargando la información de la persona.",
      });
      return;
    }

    if (!situation.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Escribe el escenario",
        message:
          "Primero escribe la situación para que Félix genere la conversación.",
      });
      return;
    }

    try {
      setGenerandoIA(true);

      const cleanSituation = situation.trim();

      const data = await generateContactConversation({
        contactName: contact.name,
        relationshipName: contact.relationship_name,
        situation: cleanSituation,
      });

      setGeneratedSituation(cleanSituation);
      setSituation("");

      setTitle(data.title || "");
      setWhatToSay(data.what_to_say || "");
      setCorrectAnswer(data.correct_answer || "");
      setWrongAnswer1(data.wrong_answer_1 || "");
      setWrongAnswer2(data.wrong_answer_2 || "");
      setReminder(data.reminder || "");

      showFeedback({
        type: "success",
        icon: "✨",
        label: "Conversación generada",
        title: "Félix creó una conversación",
        message: "Puedes revisarla, editarla y guardarla cuando esté lista.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo generar",
        message: "Félix no pudo generar la conversación. Intenta nuevamente.",
      });
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();

    if (!validateParentChildSelection()) return;

    if (!contact) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Cargando información",
        title: "Espera un momento",
        message: "Aún se está cargando la información de la persona.",
      });
      return;
    }

    if (!title.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Título obligatorio",
        message: "Debes ingresar un título para la conversación.",
      });
      return;
    }

    const finalSituation = (generatedSituation || situation).trim();

    if (!finalSituation) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Situación obligatoria",
        message: "Debes ingresar una situación para practicar.",
      });
      return;
    }

    if (!whatToSay.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Falta qué decir",
        message: `Debes ingresar qué puede decir ${protagonistName} en esta situación.`,
      });
      return;
    }

    if (!correctAnswer.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Respuesta correcta obligatoria",
        message: "Debes ingresar la respuesta correcta.",
      });
      return;
    }

    if (!wrongAnswer1.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Falta una respuesta incorrecta",
        message: "Debes ingresar la respuesta incorrecta 1.",
      });
      return;
    }

    if (!wrongAnswer2.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Falta una respuesta incorrecta",
        message: "Debes ingresar la respuesta incorrecta 2.",
      });
      return;
    }

    try {
      const wasEditing = Boolean(editingConversationId);

      const conversationData = {
        user_contact_id: contact.id,
        title: title.trim(),
        situation: finalSituation,
        what_to_say: whatToSay.trim(),
        reminder: reminder.trim(),
        correct_answer: correctAnswer.trim(),
        wrong_answer_1: wrongAnswer1.trim(),
        wrong_answer_2: wrongAnswer2.trim(),
      };

      if (editingConversationId) {
        if (isParentMode) {
          await updateChildContactConversation(
            selectedChildId,
            editingConversationId,
            conversationData,
          );
        } else {
          await updateContactConversation(
            editingConversationId,
            conversationData,
          );
        }
      } else if (isParentMode) {
        await createChildContactConversation(selectedChildId, conversationData);
      } else {
        await createContactConversation(conversationData);
      }

      await refreshConversations();
      resetForm();

      showFeedback({
        type: "success",
        icon: "✅",
        label: wasEditing ? "Cambios guardados" : "Conversación guardada",
        title: wasEditing
          ? "Conversación actualizada"
          : "Guardada correctamente",
        message: wasEditing
          ? isParentMode
            ? `Los cambios de la conversación de ${childName} se guardaron correctamente.`
            : "Los cambios de la conversación se guardaron correctamente."
          : isParentMode
            ? `La conversación fue guardada para ${childName}.`
            : "La conversación fue guardada y ya está disponible en FloFlo.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo guardar",
        message:
          error.response?.data?.message ||
          "Revisa los datos e intenta nuevamente.",
      });
    }
  };

  const handleEditConversation = (conversation) => {
    setEditingConversationId(conversation.id);
    setTitle(conversation.title || "");
    setSituation(conversation.situation || "");
    setGeneratedSituation("");
    setWhatToSay(conversation.what_to_say || "");
    setReminder(conversation.reminder || "");
    setCorrectAnswer(conversation.correct_answer || "");
    setWrongAnswer1(conversation.wrong_answer_1 || "");
    setWrongAnswer2(conversation.wrong_answer_2 || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeleteConversation = async (conversation) => {
    if (!validateParentChildSelection()) return;

    if (!canDeleteConversations) {
      showFeedback({
        type: "warning",
        icon: "🔒",
        label: "Acción restringida",
        title: "No puedes eliminar conversaciones",
        message:
          "Solo el administrador del grupo puede eliminar conversaciones.",
      });

      return;
    }

    const confirmed = await showConfirm({
      type: "danger",
      icon: "🗑️",
      label: "Eliminar conversación",
      title: "¿Eliminar esta conversación?",
      message: isParentMode
        ? `Estás por eliminar "${conversation.title}" del perfil de ${childName}. Esta acción no se puede deshacer.`
        : `Estás por eliminar "${conversation.title}". Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      if (isParentMode) {
        await deleteChildContactConversation(selectedChildId, conversation.id);
      } else {
        await deleteContactConversation(conversation.id);
      }

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Conversación eliminada",
        title: "Eliminada correctamente",
        message: isParentMode
          ? `La conversación fue eliminada para ${childName}.`
          : "La conversación fue eliminada de FloFlo.",
      });

      if (Number(editingConversationId) === Number(conversation.id)) {
        resetForm();
      }

      await refreshConversations();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo eliminar",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const getRoleLabel = (relationshipKey, accessProfile) => {
    const role = relationshipKey || accessProfile;

    if (!role) return "";

    const labels = {
      child: "Niño/a",
      primary_caregiver: "Cuidador principal",
      caregiver: "Cuidador/a",
      family: "Familiar",
      therapist: "Terapeuta",
      occupational_therapist: "Terapeuta ocupacional",
      psychologist: "Psicólogo/a",
      speech_therapist: "Fonoaudiólogo/a",
      special_educator: "Educador/a diferencial",
      teacher: "Profesor/a",
      professional: "Profesional",
    };

    return (
      labels[role] ||
      String(role)
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    );
  };

  const getFullName = (firstName, lastName) => {
    return [firstName, lastName].filter(Boolean).join(" ");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3ECFF]">
        <p className="text-2xl font-bold text-[#4B367C]">Cargando persona...</p>
      </div>
    );
  }

  if (isParentWithoutChild) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-8 py-10">
        <section className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#4B367C]">
            No hay niño/a seleccionado
          </h1>

          <p className="mt-4 text-[#6B5A95]">
            Para revisar personas importantes como cuidador, primero debes
            seleccionar un niño/a activo.
          </p>

          <Link
            to="/amigos"
            className="mt-6 inline-block rounded-full bg-[#9B7BE8] px-6 py-3 font-bold text-white"
          >
            Volver a amigos
          </Link>
        </section>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-8 py-10">
        <section className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#4B367C]">
            Persona no encontrada
          </h1>

          <p className="mt-4 text-[#6B5A95]">
            La persona no existe o no tienes permiso para verla.
          </p>

          <Link
            to="/amigos"
            className="mt-6 inline-block rounded-full bg-[#9B7BE8] px-6 py-3 font-bold text-white"
          >
            Volver a amigos
          </Link>
        </section>
      </div>
    );
  }

  const imagenValida =
    contact.image && contact.image.startsWith("https://res.cloudinary.com");

  return (
    <div className="min-h-screen bg-[#F3ECFF] px-8 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow">
        <Link
          to="/amigos"
          className="mb-6 inline-block rounded-full bg-[#F3ECFF] px-5 py-3 font-bold text-[#4B367C] transition hover:bg-[#E8DDFF]"
        >
          ← Volver a amigos
        </Link>

        {isParentMode && (
          <div className="mb-8 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
            <p className="font-bold text-[#2F6B4F]">
              {canManageSelectedChildTeam
                ? "Administrador del grupo activo"
                : "Perfil de apoyo activo"}
            </p>

            <p className="mt-1 text-[#2F6B4F]">
              Estás viendo y gestionando conversaciones de {childName}.
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-5xl font-bold text-[#4B367C]">
              {contact.name}
            </h1>

            <p className="mt-4 text-2xl text-[#6B5A95]">
              {contact.relationship_name}
            </p>

            <p className="mt-6 text-xl">📍 {contact.where_met}</p>

            {getRoleLabel(
              contact.creator_relationship_key,
              contact.creator_access_profile,
            ) && (
              <p className="mt-4 inline-flex rounded-full bg-[#EAF8EF] px-3 py-1 text-sm font-bold text-[#2F6B4F]">
                👤 Creado por:{" "}
                {getRoleLabel(
                  contact.creator_relationship_key,
                  contact.creator_access_profile,
                )}
                {getFullName(
                  contact.creator_first_name,
                  contact.creator_last_name,
                )
                  ? ` · ${getFullName(
                      contact.creator_first_name,
                      contact.creator_last_name,
                    )}`
                  : ""}
              </p>
            )}

            <div className="mt-8 rounded-2xl bg-[#F3ECFF] p-6">
              <h3 className="mb-2 text-xl font-bold text-[#4B367C]">
                ¿Cómo puedo recordarlo?
              </h3>

              <p className="text-lg text-gray-700">
                {contact.memory_note || "Sin recordatorio"}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            {imagenValida ? (
              <img
                src={contact.image}
                alt={contact.name}
                className="h-80 w-80 rounded-3xl border object-cover"
              />
            ) : (
              <div className="flex h-80 w-80 items-center justify-center rounded-3xl bg-gray-200 font-bold text-[#6B5A95]">
                Sin foto
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-3xl font-bold text-[#4B367C]">
            Conversaciones de {protagonistName} con {contact.name}
          </h2>

          <form
            onSubmit={handleCreateConversation}
            className="mb-8 space-y-4 rounded-2xl bg-[#F3ECFF] p-6"
          >
            <textarea
              value={situation}
              onChange={(e) => {
                setSituation(e.target.value);
                setGeneratedSituation("");
              }}
              placeholder="Escribe el escenario. Ej: cuando nos vemos en el colegio"
              className="min-h-28 w-full rounded-xl border p-3"
            />

            <button
              type="button"
              onClick={handleGenerateConversationAI}
              disabled={generandoIA}
              className="rounded-xl bg-[#4B367C] px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {generandoIA
                ? "Félix está pensando..."
                : "✨ Generar conversación con Félix"}
            </button>

            {title && (
              <div className="space-y-4 rounded-2xl border-2 border-[#DCCCF8] bg-white p-5">
                <div>
                  <label className="mb-2 block font-bold text-[#4B367C]">
                    Título
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-[#DCCCF8] p-3 focus:border-[#9B7BE8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-[#4B367C]">
                    Situación
                  </label>

                  <textarea
                    value={generatedSituation || situation}
                    onChange={(e) => {
                      setGeneratedSituation("");
                      setSituation(e.target.value);
                    }}
                    className="min-h-24 w-full rounded-xl border border-[#DCCCF8] p-3 focus:border-[#9B7BE8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-[#4B367C]">
                    Qué decir
                  </label>

                  <textarea
                    value={whatToSay}
                    onChange={(e) => setWhatToSay(e.target.value)}
                    className="min-h-24 w-full rounded-xl border border-[#DCCCF8] p-3 focus:border-[#9B7BE8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-green-700">
                    Respuesta correcta
                  </label>

                  <input
                    type="text"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full rounded-xl border border-green-200 p-3 focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-red-600">
                    Respuesta incorrecta 1
                  </label>

                  <input
                    type="text"
                    value={wrongAnswer1}
                    onChange={(e) => setWrongAnswer1(e.target.value)}
                    className="w-full rounded-xl border border-red-200 p-3 focus:border-red-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-red-600">
                    Respuesta incorrecta 2
                  </label>

                  <input
                    type="text"
                    value={wrongAnswer2}
                    onChange={(e) => setWrongAnswer2(e.target.value)}
                    className="w-full rounded-xl border border-red-200 p-3 focus:border-red-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-[#4B367C]">
                    Recordatorio
                  </label>

                  <textarea
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    className="min-h-20 w-full rounded-xl border border-[#DCCCF8] p-3 focus:border-[#9B7BE8] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!title || generandoIA}
                className="rounded-xl bg-[#9B7BE8] px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {editingConversationId
                  ? "Actualizar conversación"
                  : isParentMode
                    ? "Guardar conversación para niño/a"
                    : "Guardar conversación"}
              </button>

              {editingConversationId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[#DCCCF8] bg-white px-6 py-3 font-bold text-[#4B367C]"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          <div className="space-y-4">
            {conversations.length === 0 ? (
              <p className="text-[#6B5A95]">
                Aún no hay conversaciones preparadas.
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="rounded-2xl border-2 border-[#DCCCF8] bg-white p-5"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-[#4B367C]">
                        {conversation.title}
                      </h3>
                      {getRoleLabel(
                        conversation.creator_relationship_key,
                        conversation.creator_access_profile,
                      ) && (
                        <p className="mt-2 inline-flex rounded-full bg-[#EAF8EF] px-3 py-1 text-sm font-bold text-[#2F6B4F]">
                          👤 Creada por:{" "}
                          {getRoleLabel(
                            conversation.creator_relationship_key,
                            conversation.creator_access_profile,
                          )}
                          {getFullName(
                            conversation.creator_first_name,
                            conversation.creator_last_name,
                          )
                            ? ` · ${getFullName(
                                conversation.creator_first_name,
                                conversation.creator_last_name,
                              )}`
                            : ""}
                        </p>
                      )}
                      {conversation.updated_by &&
                        Number(conversation.updated_by) !==
                          Number(conversation.created_by) && (
                          <p className="mt-2 inline-flex rounded-full bg-[#E8F1FF] px-3 py-1 text-sm font-bold text-[#345A8A]">
                            ✏️ Editada por:{" "}
                            {getRoleLabel(
                              conversation.updater_relationship_key,
                              conversation.updater_access_profile,
                            ) || "Integrante"}
                            {getFullName(
                              conversation.updater_first_name,
                              conversation.updater_last_name,
                            )
                              ? ` · ${getFullName(
                                  conversation.updater_first_name,
                                  conversation.updater_last_name,
                                )}`
                              : ""}
                          </p>
                        )}
                    </div>
                  </div>

                  <p className="mt-4 text-[#6B5A95]">
                    <strong>Situación:</strong> {conversation.situation}
                  </p>

                  <p className="mt-2 text-[#6B5A95]">
                    <strong>Qué decir:</strong> {conversation.what_to_say}
                  </p>

                  <p className="mt-2 text-green-700">
                    <strong>Respuesta correcta:</strong>{" "}
                    {conversation.correct_answer || "No registrada"}
                  </p>

                  <p className="mt-2 text-red-600">
                    <strong>Incorrecta 1:</strong>{" "}
                    {conversation.wrong_answer_1 || "No registrada"}
                  </p>

                  <p className="mt-2 text-red-600">
                    <strong>Incorrecta 2:</strong>{" "}
                    {conversation.wrong_answer_2 || "No registrada"}
                  </p>

                  {conversation.reminder && (
                    <p className="mt-2 text-[#6B5A95]">
                      <strong>Recordatorio:</strong> {conversation.reminder}
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEditConversation(conversation)}
                      className="rounded-xl bg-[#9B7BE8] px-5 py-2 font-bold text-white"
                    >
                      Editar
                    </button>

                    {canDeleteConversations && (
                      <button
                        type="button"
                        onClick={() => handleDeleteConversation(conversation)}
                        className="rounded-xl bg-red-500 px-5 py-2 font-bold text-white"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaDetalle;
