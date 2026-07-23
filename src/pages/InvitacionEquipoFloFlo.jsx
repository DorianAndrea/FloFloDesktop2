import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import {
  acceptSupportTeamInvitation,
  getSupportTeamInvitation,
} from "../services/supportTeamService";

const getRelationshipLabel = (relationshipKey) => {
  const labels = {
    caregiver: "Cuidador/a",
    family: "Familiar",
    occupational_therapist: "Terapeuta ocupacional",
    psychologist: "Psicólogo/a",
    speech_therapist: "Fonoaudiólogo/a",
    teacher: "Profesor/a",
    other_professional: "Otro profesional",
  };

  return labels[relationshipKey] || "Integrante del equipo";
};

const InvitacionEquipoFloFlo = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { user } = useFloFlo();
  const { showFeedback } = useFeedback();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getSupportTeamInvitation(token);

        setInvitation(data);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error.response?.data?.message ||
            "La invitación no existe o ya no está disponible.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleAccept = async () => {
    try {
      setAccepting(true);

      await acceptSupportTeamInvitation(token);

      showFeedback({
        type: "success",
        icon: "🤝",
        label: "Invitación aceptada",
        title: "¡Ya formas parte del Equipo FloFlo!",
        message: "Ahora podrás acompañar al niño/a desde tu cuenta.",
      });

      navigate("/panel-padres");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo aceptar",
        title: "Revisa tu cuenta",
        message:
          error.response?.data?.message ||
          "No fue posible aceptar esta invitación.",
      });
    } finally {
      setAccepting(false);
    }
  };

  const childName = invitation
    ? `${invitation.child_first_name || ""} ${
        invitation.child_last_name || ""
      }`.trim()
    : "";

  const inviterName = invitation
    ? `${invitation.inviter_first_name || ""} ${
        invitation.inviter_last_name || ""
      }`.trim()
    : "";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F0FF] flex items-center justify-center">
        <p className="font-bold text-[#4B367C]">
          Cargando invitación...
        </p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-[#F6F0FF] px-4 py-10">
        <section className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-md">
          <p className="text-5xl">⚠️</p>

          <h1 className="mt-4 text-3xl font-extrabold text-[#4B367C]">
            Invitación no disponible
          </h1>

          <p className="mt-4 text-gray-600">{errorMessage}</p>

          <Link
            to="/"
            className="mt-7 inline-block rounded-2xl bg-[#9B7BE8] px-6 py-3 font-bold text-white"
          >
            Volver a FloFlo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F0FF] px-4 py-10">
      <section className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-md">
        <p className="text-6xl">🤝</p>

        <h1 className="mt-4 text-3xl font-extrabold text-[#4B367C]">
          Te invitaron al Equipo FloFlo
        </h1>

        <p className="mt-5 text-lg text-gray-600">
          <strong>{inviterName || "Una persona cuidadora"}</strong> quiere que
          formes parte del Equipo FloFlo de{" "}
          <strong>{childName || "un niño/a"}</strong>.
        </p>

        <div className="mt-6 rounded-2xl bg-[#FFF3C4] p-4">
          <p className="text-sm font-bold text-[#8A6A00]">
            Tu perfil dentro del equipo
          </p>

          <p className="mt-1 text-xl font-extrabold text-[#5C4A00]">
            {getRelationshipLabel(invitation?.relationship_key)}
          </p>
        </div>

        {invitation?.message && (
          <div className="mt-6 rounded-2xl border-l-4 border-[#9B7BE8] bg-[#F3ECFF] p-5 text-left">
            <p className="font-bold text-[#4B367C]">
              Mensaje de {inviterName}
            </p>

            <p className="mt-2 whitespace-pre-line text-gray-600">
              {invitation.message}
            </p>
          </div>
        )}

        {!user ? (
          <div className="mt-8 space-y-3">
            <p className="text-gray-600">
              Inicia sesión o crea una cuenta adulta con el mismo correo que
              recibió esta invitación.
            </p>

            <Link
              to="/login"
              className="block w-full rounded-2xl bg-[#9B7BE8] px-6 py-4 font-extrabold text-white"
            >
              Iniciar sesión
            </Link>

            <Link
              to="/registro"
              className="block w-full rounded-2xl border-2 border-[#9B7BE8] px-6 py-4 font-extrabold text-[#4B367C]"
            >
              Crear cuenta
            </Link>

            <p className="text-sm text-gray-400">
              Después vuelve a abrir el enlace del correo para aceptar.
            </p>
          </div>
        ) : user.role !== "parent" ? (
          <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">
            Esta invitación debe aceptarse desde una cuenta adulta.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAccept}
            disabled={accepting}
            className="mt-8 w-full rounded-2xl bg-[#9B7BE8] px-6 py-4 font-extrabold text-white shadow-md transition hover:bg-[#8265CF] disabled:opacity-60"
          >
            {accepting
              ? "Aceptando invitación..."
              : `Quiero acompañar a ${childName}`}
          </button>
        )}
      </section>
    </main>
  );
};

export default InvitacionEquipoFloFlo;