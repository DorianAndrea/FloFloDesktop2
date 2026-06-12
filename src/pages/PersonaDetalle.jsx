import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContactById } from "../services/contactService";

import {
  getContactConversationsByContactId,
  createContactConversation,
  updateContactConversation,
  deleteContactConversation,
} from "../services/contactConversationService";

const PersonaDetalle = () => {
  const { id } = useParams();

  const [contact, setContact] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [title, setTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [whatToSay, setWhatToSay] = useState("");
  const [reminder, setReminder] = useState("");
  const [editingConversationId, setEditingConversationId] = useState(null);

  const loadContact = async () => {
    try {
      const data = await getContactById(id);
      setContact(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await getContactConversationsByContactId(id);
      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadContact();
    loadConversations();
  }, [id]);

  const handleCreateConversation = async (e) => {
    e.preventDefault();

    if (!contact) {
      alert("Aún se está cargando la persona");
      return;
    }

    if (!title.trim()) {
      alert("Debes ingresar un título");
      return;
    }

    if (!situation.trim()) {
      alert("Debes ingresar una situación");
      return;
    }

    if (!whatToSay.trim()) {
      alert("Debes ingresar qué puede decir");
      return;
    }

    try {
      const conversationData = {
        user_id: contact.user_id,
        user_contact_id: contact.id,
        title: title.trim(),
        situation: situation.trim(),
        what_to_say: whatToSay.trim(),
        reminder: reminder.trim(),
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

      setTitle("");
      setSituation("");
      setWhatToSay("");
      setReminder("");
      setEditingConversationId(null);

      alert(
        editingConversationId
          ? "Conversación actualizada correctamente"
          : "Conversación guardada correctamente",
      );
    } catch (error) {
      console.error(error);
      alert("Error al guardar conversación");
    }
  };

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }
  const handleEditConversation = (conversation) => {
    setEditingConversationId(conversation.id);
    setTitle(conversation.title);
    setSituation(conversation.situation);
    setWhatToSay(conversation.what_to_say);
    setReminder(conversation.reminder || "");
  };
  const handleDeleteConversation = async (id) => {
    const confirmDelete = confirm(
      "¿Seguro que quieres eliminar esta conversación?",
    );

    if (!confirmDelete) return;

    try {
      await deleteContactConversation(id);
      await loadConversations();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar conversación");
    }
  };

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

              <p className="text-gray-700 text-lg">{contact.memory_note}</p>
            </div>
          </div>

          <div className="flex justify-center">
            {contact.image ? (
              <img
                src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${contact.image}`}
                alt={contact.name}
                className="w-80 h-80 object-cover rounded-3xl border"
              />
            ) : (
              <div className="w-80 h-80 bg-gray-200 rounded-3xl flex items-center justify-center">
                Sin foto
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-[#4B367C] mb-6">
            Conversaciones preparadas
          </h2>

          <form
            onSubmit={handleCreateConversation}
            className="bg-[#F3ECFF] rounded-2xl p-6 mb-8 space-y-4"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la conversación"
              className="w-full p-3 rounded-xl border"
            />

            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="¿En qué situación ocurre?"
              className="w-full p-3 rounded-xl border"
            />

            <textarea
              value={whatToSay}
              onChange={(e) => setWhatToSay(e.target.value)}
              placeholder="¿Qué puede decir?"
              className="w-full p-3 rounded-xl border"
            />

            <textarea
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              placeholder="Recordatorio"
              className="w-full p-3 rounded-xl border"
            />

            <button
              type="submit"
              className="bg-[#9B7BE8] text-white px-6 py-3 rounded-xl font-bold"
            >
              {editingConversationId
                ? "Actualizar conversación"
                : "Guardar conversación"}
            </button>
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
                      onClick={() => handleDeleteConversation(conversation.id)}
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
