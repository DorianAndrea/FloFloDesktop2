import { useEffect, useState } from "react";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import {
  createSupportTeamInvitation,
  getChildSupportTeam,
  removeSupportTeamMember,
} from "../services/supportTeamService";
import { useFloFlo } from "../context/FloFloContext";

const RELATIONSHIP_OPTIONS = [
  {
    value: "caregiver",
    label: "Cuidador/a",
    emoji: "💜",
  },
  {
    value: "family",
    label: "Familiar",
    emoji: "👨‍👩‍👧",
  },
  {
    value: "occupational_therapist",
    label: "Terapeuta ocupacional",
    emoji: "🧩",
  },
  {
    value: "psychologist",
    label: "Psicólogo/a",
    emoji: "🧠",
  },
  {
    value: "speech_therapist",
    label: "Fonoaudiólogo/a",
    emoji: "🗣️",
  },
  {
    value: "teacher",
    label: "Profesor/a",
    emoji: "🏫",
  },
  {
    value: "other_professional",
    label: "Otro profesional",
    emoji: "🤝",
  },
];

const getRelationshipLabel = (relationshipKey) => {
  const labels = {
    primary_caregiver: "Cuidador/a principal",
    caregiver: "Cuidador/a",
    family: "Familiar",
    occupational_therapist: "Terapeuta ocupacional",
    psychologist: "Psicólogo/a",
    speech_therapist: "Fonoaudiólogo/a",
    teacher: "Profesor/a",
    other_professional: "Otro profesional",
  };

  return labels[relationshipKey] || "Integrante";
};

const getMemberName = (member) => {
  const firstName = member?.firstName || member?.first_name || "";
  const lastName = member?.lastName || member?.last_name || "";

  return `${firstName} ${lastName}`.trim() || member?.email || "Integrante";
};

const EquipoFloFlo = () => {
  const {
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
  } = useSelectedChild();

  const { showFeedback } = useFeedback();
  const { user } = useFloFlo();

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const [email, setEmail] = useState("");
  const [relationshipKey, setRelationshipKey] = useState("");
  const [message, setMessage] = useState("");

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const currentMembership = team.find(
    (member) => Number(member.user_id) === Number(user?.id),
  );

  const canManageTeam = Boolean(currentMembership?.can_manage_team);

  const loadTeam = async () => {
    if (!selectedChildId) {
      setTeam([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getChildSupportTeam(selectedChildId);

      setTeam(data);
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cargar el equipo",
        message:
          error.response?.data?.message ||
          "No fue posible cargar el Equipo FloFlo.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingChildren) {
      loadTeam();
    }
  }, [selectedChildId, loadingChildren]);

  const handleInvite = async (event) => {
    event.preventDefault();

    if (!selectedChildId) return;

    if (!email.trim() || !relationshipKey) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Completa la invitación",
        message: "Ingresa el correo y selecciona el tipo de integrante.",
      });

      return;
    }

    try {
      setSendingInvitation(true);

      await createSupportTeamInvitation({
        childId: selectedChildId,
        email,
        relationshipKey,
        message,
      });

      showFeedback({
        type: "success",
        icon: "📧",
        label: "Invitación enviada",
        title: "Correo enviado correctamente",
        message: `La invitación al Equipo FloFlo de ${childName} fue enviada.`,
      });

      setEmail("");
      setRelationshipKey("");
      setMessage("");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo invitar",
        title: "Revisa la información",
        message:
          error.response?.data?.message ||
          error.message ||
          "No fue posible enviar la invitación.",
      });
    } finally {
      setSendingInvitation(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!selectedChildId || !member?.membership_id) return;

    const confirmed = window.confirm(
      `¿Quieres quitar a ${getMemberName(member)} del Equipo FloFlo?`,
    );

    if (!confirmed) return;

    try {
      setRemovingMemberId(member.membership_id);

      await removeSupportTeamMember({
        childId: selectedChildId,
        memberId: member.membership_id,
      });

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Equipo actualizado",
        title: "Integrante removido",
        message: `${getMemberName(member)} ya no forma parte de este equipo.`,
      });

      await loadTeam();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo quitar",
        title: "No fue posible actualizar el equipo",
        message:
          error.response?.data?.message || "No se pudo remover al integrante.",
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (loadingChildren || loading) {
    return (
      <main className="min-h-screen bg-[#F6F0FF] flex items-center justify-center">
        <p className="font-bold text-[#4B367C]">Cargando Equipo FloFlo...</p>
      </main>
    );
  }

  if (!selectedChildId) {
    return (
      <main className="min-h-screen bg-[#F6F0FF] p-6">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-md">
          <p className="text-5xl">🤝</p>

          <h1 className="mt-4 text-3xl font-extrabold text-[#4B367C]">
            Equipo FloFlo
          </h1>

          <p className="mt-3 text-gray-600">
            Selecciona un niño/a desde el Panel Padres para ver su equipo.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F0FF] px-4 py-8 md:px-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-md">
          <p className="text-5xl">🤝</p>

          <h1 className="mt-3 text-3xl font-extrabold text-[#4B367C]">
            Equipo FloFlo de {childName}
          </h1>

          <p className="mt-3 max-w-3xl text-gray-600">
            Reúne a familiares, cuidadores y profesionales que acompañan al
            niño/a, manteniendo los accesos organizados y seguros.
          </p>
        </div>

        <section className="rounded-[2rem] bg-white p-6 shadow-md">
          <h2 className="text-2xl font-extrabold text-[#4B367C]">
            Integrantes
          </h2>

          {team.length === 0 ? (
            <p className="mt-5 text-gray-500">
              Todavía no hay integrantes visibles en este equipo.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {team.map((member) => (
                <article
                  key={member.membership_id}
                  className="rounded-3xl border border-[#E4D8FF] bg-[#F9F6FF] p-5"
                >
                  <div className="flex items-start gap-4">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={getMemberName(member)}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E4D8FF] text-3xl">
                        👤
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-[#4B367C]">
                        {getMemberName(member)}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-[#8A6BC7]">
                        {getRelationshipLabel(member.relationship_key)}
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-500">
                        {member.email}
                      </p>

                      {member.can_manage_team && (
                        <span className="mt-3 inline-block rounded-full bg-[#FFF3C4] px-3 py-1 text-xs font-bold text-[#5C4A00]">
                          Administra el equipo
                        </span>
                      )}
                    </div>
                  </div>

                  {canManageTeam &&
                    !member.can_manage_team &&
                    Number(member.user_id) !== Number(user?.id) && (
                      <button
                        type="button"
                        disabled={
                          Number(removingMemberId) ===
                          Number(member.membership_id)
                        }
                        onClick={() => handleRemoveMember(member)}
                        className="mt-5 w-full rounded-xl border border-red-200 bg-white px-4 py-2 font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        {Number(removingMemberId) ===
                        Number(member.membership_id)
                          ? "Quitando..."
                          : "Quitar del equipo"}
                      </button>
                    )}
                </article>
              ))}
            </div>
          )}
        </section>

        {canManageTeam && (
          <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-md">
            <h2 className="text-2xl font-extrabold text-[#4B367C]">
              Invitar a una persona
            </h2>

            <p className="mt-2 text-gray-600">
              Recibirá un correo con un enlace seguro para unirse al equipo.
            </p>

            <form onSubmit={handleInvite} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block font-bold text-[#4B367C]">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="persona@correo.com"
                  className="w-full rounded-2xl border border-[#DCCCF8] px-4 py-3 outline-none focus:border-[#9B7BE8]"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-[#4B367C]">
                  ¿Qué relación tiene con {childName}?
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRelationshipKey(option.value)}
                      className={`rounded-2xl border-2 p-4 text-left font-bold transition ${
                        relationshipKey === option.value
                          ? "border-[#9B7BE8] bg-[#F3ECFF] text-[#4B367C]"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      <span className="mr-2 text-2xl">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-bold text-[#4B367C]">
                  Mensaje personal
                  <span className="ml-2 font-normal text-gray-400">
                    (opcional)
                  </span>
                </label>

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value.slice(0, 1000))
                  }
                  rows={4}
                  placeholder="Escribe un mensaje para la persona invitada..."
                  className="w-full resize-none rounded-2xl border border-[#DCCCF8] px-4 py-3 outline-none focus:border-[#9B7BE8]"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {message.length}/1000
                </p>
              </div>

              <button
                type="submit"
                disabled={sendingInvitation}
                className="w-full rounded-2xl bg-[#9B7BE8] px-5 py-4 font-extrabold text-white shadow-md transition hover:bg-[#8265CF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingInvitation
                  ? "Enviando invitación..."
                  : "📧 Enviar invitación"}
              </button>
            </form>
          </section>
        )}
      </section>
    </main>
  );
};

export default EquipoFloFlo;
