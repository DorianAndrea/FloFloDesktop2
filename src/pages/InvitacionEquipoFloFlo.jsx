import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import {
  acceptSupportTeamInvitation,
  getSupportTeamInvitation,
  registerAndAcceptSupportTeamInvitation,
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
  const location = useLocation();

  const { user } = useFloFlo();
  const { showFeedback } = useFeedback();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registering, setRegistering] = useState(false);
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

  const handleRegisterAndAccept = async (event) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Faltan datos",
        title: "Completa tu nombre",
        message: "Debes ingresar tu nombre y apellido.",
      });

      return;
    }

    if (password !== confirmPassword) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Contraseñas distintas",
        title: "Revisa tu contraseña",
        message: "Las contraseñas deben coincidir.",
      });

      return;
    }

    try {
      setRegistering(true);

      await registerAndAcceptSupportTeamInvitation({
        token,
        firstName,
        lastName,
        password,
      });

      showFeedback({
        type: "success",
        icon: "🤝",
        label: "Cuenta creada",
        title: "¡Ya formas parte del Equipo FloFlo!",
        message:
          "Tu cuenta fue creada correctamente. Ahora inicia sesión para comenzar.",
      });

      navigate("/login");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo crear la cuenta",
        title: "Revisa tus datos",
        message:
          error.response?.data?.message ||
          "No fue posible crear tu cuenta y aceptar la invitación.",
      });
    } finally {
      setRegistering(false);
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
        <p className="font-bold text-[#4B367C]">Cargando invitación...</p>
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
            <p className="font-bold text-[#4B367C]">Mensaje de {inviterName}</p>

            <p className="mt-2 whitespace-pre-line text-gray-600">
              {invitation.message}
            </p>
          </div>
        )}

        {!user ? (
          invitation?.account_exists ? (
            <div className="mt-8 space-y-4">
              <p className="text-gray-600">
                Ya existe una cuenta FloFlo con el correo:
              </p>

              <p className="font-extrabold text-[#4B367C]">
                {invitation.email}
              </p>

              <p className="text-gray-600">
                Inicia sesión con esa cuenta para aceptar la invitación.
              </p>

              <Link
                to="/login"
                state={{ from: location }}
                className="block w-full rounded-2xl bg-[#9B7BE8] px-6 py-4 font-extrabold text-white"
              >
                Iniciar sesión y continuar
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleRegisterAndAccept}
              className="mt-8 space-y-4 text-left"
            >
              <div className="text-center">
                <h2 className="text-xl font-extrabold text-[#4B367C]">
                  Crea tu cuenta FloFlo
                </h2>

                <p className="mt-2 text-gray-600">
                  Al crearla quedarás automáticamente incorporado/a al equipo de{" "}
                  <strong>{childName}</strong>.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-bold text-[#4B367C]">
                  Nombre
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-2xl border-2 border-[#E4D8FF] px-4 py-3 outline-none focus:border-[#9B7BE8]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-[#4B367C]">
                  Apellido
                </label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-2xl border-2 border-[#E4D8FF] px-4 py-3 outline-none focus:border-[#9B7BE8]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-[#4B367C]">
                  Correo
                </label>

                <input
                  type="email"
                  value={invitation?.email || ""}
                  disabled
                  className="w-full rounded-2xl border-2 border-[#E4D8FF] bg-gray-50 px-4 py-3 text-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-[#4B367C]">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border-2 border-[#E4D8FF] px-4 py-3 pr-14 outline-none focus:border-[#9B7BE8]"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    title={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Mínimo 8 caracteres, con mayúscula, minúscula y número.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-bold text-[#4B367C]">
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border-2 border-[#E4D8FF] px-4 py-3 pr-14 outline-none focus:border-[#9B7BE8]"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación de contraseña"
                        : "Mostrar confirmación de contraseña"
                    }
                    title={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full rounded-2xl bg-[#9B7BE8] px-6 py-4 font-extrabold text-white shadow-md transition hover:bg-[#8265CF] disabled:opacity-60"
              >
                {registering
                  ? "Creando cuenta..."
                  : `Crear mi cuenta y acompañar a ${childName}`}
              </button>
            </form>
          )
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
