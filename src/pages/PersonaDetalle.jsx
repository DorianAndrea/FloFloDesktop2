import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContactById } from "../services/contactService";
import { generateContactConversation } from "../services/aiService";
import { useFeedback } from "../context/FeedbackContext";
import {
  getContactConversationsByContactId,
  createContactConversation,
  updateContactConversation,
  deleteContactConversation,
} from "../services/contactConversationService";

const PersonaDetalle = () => {
  const { id } = useParams();
  const { showFeedback, showConfirm } = useFeedback();

  const [contact, setContact] = useState(null);
  const [conversations, setConversations] = useState([]);

  const [title, setTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [whatToSay, setWhatToSay] = useState("");
  const [reminder, setReminder] = useState("");
  const [generandoIA, setGenerandoIA] = useState(false);

  const [correctAnswer, setCorrectAnswer] = useState("");
  const [wrongAnswer1, setWrongAnswer1] = useState("");
  const [wrongAnswer2, setWrongAnswer2] = useState("");

  const [editingConversationId, setEditingConversationId] = useState(null);

  const loadContact = async () => {
    try {
      const data = await getContactById(id);
      setContact(data);
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cargar la persona",
        message: "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const loadConversations = async () => {
    try {
      const data = await getContactConversationsByContactId(id);
      setConversations(data);
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar las conversaciones",
        message: "Intenta nuevamente en unos segundos.",
      });
    }
  };

  useEffect(() => {
    loadContact();
    loadConversations();
  }, [id]);

  const resetForm = () => {
    setTitle("");
    setSituation("");
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
        message: "Primero escribe la situación para que Félix genere la conversación.",
      });
      return;
    }

    try {
      setGenerandoIA(true);

      const data = await generateContactConversation({
        contactName: contact.name,
        relationshipName: contact.relationship_name,
        situation: situation.trim(),
      });

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

    if (!situation.trim()) {
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
        message: "Debes ingresar qué puede decir Félix en esta situación.",
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
        situation: situation.trim(),
        what_to_say: whatToSay.trim(),
        reminder: reminder.trim(),
        correct_answer: correctAnswer.trim(),
        wrong_answer_1: wrongAnswer1.trim(),
        wrong_answer_2: wrongAnswer2.trim(),
      };

      if (editingConversationId) {
        await updateContactConversation(
          editingConversationId,
          conversationData,
        );
      } else {
        await createContactConversation(conversationData);
      }

      await loadConversations();
      resetForm();

      showFeedback({
        type: "success",
        icon: "✅",
        label: wasEditing ? "Cambios guardados" : "Conversación guardada",
        title: wasEditing
          ? "Conversación actualizada"
          : "Guardada correctamente",
        message: wasEditing
          ? "Los cambios de la conversación se guardaron correctamente."
          : "La conversación fue guardada y ya está disponible en FloFlo.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo guardar",
        message: "Revisa los datos e intenta nuevamente.",
      });
    }
  };

  const handleEditConversation = (conversation) => {
    setEditingConversationId(conversation.id);
    setTitle(conversation.title || "");
    setSituation(conversation.situation || "");
    setWhatToSay(conversation.what_to_say || "");
    setReminder(conversation.reminder || "");
    setCorrectAnswer(conversation.correct_answer || "");
    setWrongAnswer1(conversation.wrong_answer_1 || "");
    setWrongAnswer2(conversation.wrong_answer_2 || "");
  };

  const handleDeleteConversation = async (conversation) => {
    const confirmed = await showConfirm({
      type: "danger",
      icon: "🗑️",
      label: "Eliminar conversación",
      title: "¿Eliminar esta conversación?",
      message: `Estás por eliminar "${conversation.title}". Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      await deleteContactConversation(conversation.id);

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Conversación eliminada",
        title: "Eliminada correctamente",
        message: "La conversación fue eliminada de FloFlo.",
      });

      if (editingConversationId === conversation.id) {
        resetForm();
      }

      await loadConversations();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo eliminar",
        message: "Intenta nuevamente en unos segundos.",
      });
    }
  };

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  const imagenValida =
    contact.image && contact.image.startsWith("https://res.cloudinary.com");

  return (
    <div className="min-h-screen bg-[#F3ECFF] px-8 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-5xl font-bold text-[#4B367C]">
              {contact.name}
            </h1>

            <p className="mt-4 text-2xl text-[#6B5A95]">
              {contact.relationship_name}
            </p>

            <p className="mt-6 text-xl">📍 {contact.where_met}</p>

            <div className="mt-8 bg-[#F3ECFF] rounded-2xl p-6">
              <h3 className="font-bold text-[#4B367C] text-xl mb-2">
                ¿Cómo puedo recordarlo?
              </h3>

              <p className="text-gray-700 text-lg">
                {contact.memory_note || "Sin recordatorio"}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            {imagenValida ? (
              <img
                src={contact.image}
                alt={contact.name}
                className="w-80 h-80 object-cover rounded-3xl border"
              />
            ) : (
              <div className="w-80 h-80 bg-gray-200 rounded-3xl flex items-center justify-center text-[#6B5A95] font-bold">
                Sin foto
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-[#4B367C] mb-6">
            Conversaciones de Félix con {contact.name}
          </h2>

          <form
            onSubmit={handleCreateConversation}
            className="bg-[#F3ECFF] rounded-2xl p-6 mb-8 space-y-4"
          >
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Escribe el escenario. Ej: cuando nos vemos en el colegio"
              className="w-full p-3 rounded-xl border min-h-28"
            />

            <button
              type="button"
              onClick={handleGenerateConversationAI}
              disabled={generandoIA}
              className="bg-[#4B367C] text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {generandoIA
                ? "Félix está pensando..."
                : "✨ Generar conversación con Félix"}
            </button>

            {title && (
              <div className="bg-white rounded-2xl p-5 border-2 border-[#DCCCF8]">
                <h3 className="text-2xl font-bold text-[#4B367C] mb-3">
                  {title}
                </h3>

                <p className="text-[#6B5A95]">
                  <strong>Situación:</strong> {situation}
                </p>

                <p className="text-[#6B5A95] mt-2">
                  <strong>Qué decir:</strong> {whatToSay}
                </p>

                <p className="text-green-700 mt-2">
                  <strong>Respuesta correcta:</strong> {correctAnswer}
                </p>

                <p className="text-red-600 mt-2">
                  <strong>Incorrecta 1:</strong> {wrongAnswer1}
                </p>

                <p className="text-red-600 mt-2">
                  <strong>Incorrecta 2:</strong> {wrongAnswer2}
                </p>

                {reminder && (
                  <p className="text-[#6B5A95] mt-2">
                    <strong>Recordatorio:</strong> {reminder}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!title || generandoIA}
                className="bg-[#9B7BE8] text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {editingConversationId
                  ? "Actualizar conversación"
                  : "Guardar conversación"}
              </button>

              {editingConversationId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white text-[#4B367C] border border-[#DCCCF8] px-6 py-3 rounded-xl font-bold"
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
                  className="bg-white border-2 border-[#DCCCF8] rounded-2xl p-5"
                >
                  <h3 className="text-2xl font-bold text-[#4B367C]">
                    {conversation.title}
                  </h3>

                  <p className="mt-2 text-[#6B5A95]">
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

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => handleEditConversation(conversation)}
                      className="bg-[#9B7BE8] text-white px-5 py-2 rounded-xl font-bold"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteConversation(conversation)}
                      className="bg-red-500 text-white px-5 py-2 rounded-xl font-bold"
                    >
                      Eliminar
                    </button>
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