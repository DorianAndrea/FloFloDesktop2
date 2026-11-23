import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { getProfile } from "../services/profileService";
import { getChildProgress } from "../services/progressService";
import { getChildAchievements } from "../services/achievementService";
import { getChildSupport } from "../services/dashboardService";
import SupportChart from "../components/dashboard/SupportChart";
import RoutineAnalytics from "../components/dashboard/RoutineAnalytics";
import felix from "../assets/svg/felix_feliz.svg";
import MiBienestar from "./dashboard/MiBienestar";

import {
  calculateAge,
  isBirthdayToday,
  formatAgeLabel,
} from "../utils/birthdayUtils";

const getBirthDateValue = (person) => {
  return (
    person?.birth_date ||
    person?.birthDate ||
    person?.date_of_birth ||
    person?.birthdate ||
    null
  );
};

const Home = () => {
  const { mood, user, setPoints } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    getChildDisplayName,
    selectedRelationshipKey,
    selectedAccessProfile,
  } = useSelectedChild();

  const [profile, setProfile] = useState(null);

  const relationshipLabels = {
    primary_caregiver: "Cuidador/a principal",
    caregiver: "Cuidador/a",
    family: "Familiar",
    occupational_therapist: "Terapeuta ocupacional",
    psychologist: "Psicólogo/a",
    speech_therapist: "Fonoaudiólogo/a",
    teacher: "Profesor/a",
    other_professional: "Otro profesional",
  };

  const accessProfileLabels = {
    caregiver: "Cuidador/a",
    family: "Familiar",
    therapist: "Profesional de terapia",
    teacher: "Profesor/a",
    professional: "Profesional",
  };

  const adultProfileLabel =
    relationshipLabels[selectedRelationshipKey] ||
    accessProfileLabels[selectedAccessProfile] ||
    "Adulto/a de apoyo";

  const adultProfileEmoji = (() => {
    switch (selectedRelationshipKey) {
      case "psychologist":
        return "🧠";
      case "occupational_therapist":
        return "🧩";
      case "speech_therapist":
        return "🗣️";
      case "teacher":
        return "🏫";
      case "family":
        return "👨‍👩‍👧";
      case "primary_caregiver":
      case "caregiver":
        return "👨‍👩‍👧";
      default:
        return "🤝";
    }
  })();
  const accesos = [
    {
      titulo: "Estados de ánimo",
      descripcion: "Cuenta cómo te sientes hoy.",
      emoji: "😊",
      ruta: "/emociones",
      color: "bg-[#FFF3C4]",
    },
    {
      titulo: "Conversaciones",
      descripcion: "Practica hablar con otras personas.",
      emoji: "💬",
      ruta: "/conversaciones",
      color: "bg-[#DDF7FF]",
    },
    {
      titulo: "Rutinas",
      descripcion: "Organiza actividades del día.",
      emoji: "⭐",
      ruta: "/rutinas",
      color: "bg-[#E8DDFF]",
    },
    {
      titulo: "Lugares",
      descripcion: "Prepárate antes de visitar un lugar.",
      emoji: "📍",
      ruta: "/lugares",
      color: "bg-[#E7F8E7]",
    },
    {
      titulo: "Logros",
      descripcion: "Mira tus insignias desbloqueadas.",
      emoji: "🏆",
      ruta: "/logros",
      color: "bg-[#FFE8F3]",
    },
    {
      titulo: "Mi Perfil",
      descripcion: "Revisa tus estrellas y nivel.",
      emoji: "👤",
      ruta: "/mi-perfil",
      color: "bg-[#F1E7FF]",
    },
  ];

  const loadProfile = async () => {
    if (!user) return;

    try {
      const data = await getProfile();
      setProfile(data);
      if (user?.role !== "parent") {
        setPoints(Number(data.progress?.points || 0));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const progress = profile?.progress;

  const caregiverBirthDate =
    getBirthDateValue(profile) || getBirthDateValue(user);

  const caregiverName =
    profile?.firstName ||
    profile?.first_name ||
    user?.firstName ||
    user?.first_name ||
    "amigo/a";

  const caregiverAge = calculateAge(caregiverBirthDate);
  const caregiverBirthdayToday = isBirthdayToday(caregiverBirthDate);

  const selectedChildBirthDate = getBirthDateValue(selectedChild);

  const selectedChildName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const selectedChildAge = calculateAge(selectedChildBirthDate);

  const selectedChildBirthdayToday =
    isParent && selectedChildId && isBirthdayToday(selectedChildBirthDate);

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-7xl mx-auto">
        {caregiverBirthdayToday && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 rounded-[2rem] border-2 border-[#F7D774] bg-[#FFF3C4] p-6 text-center shadow-md"
          >
            <p className="text-5xl">🎂</p>

            <h2 className="mt-3 text-3xl font-extrabold text-[#4B367C] md:text-4xl">
              ¡Feliz cumpleaños, {caregiverName}!
            </h2>

            {caregiverAge !== null && (
              <p className="mt-3 text-xl font-bold text-[#5C4A00]">
                Hoy cumples {formatAgeLabel(caregiverAge)} 🎉
              </p>
            )}

            <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold text-[#6B5A95]">
              FloFlo te desea un día lleno de alegría, calma y momentos bonitos.
            </p>
          </motion.div>
        )}

        {selectedChildBirthdayToday && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 rounded-[2rem] border-2 border-[#F7D774] bg-[#FFF3C4] p-6 text-center shadow-md"
          >
            <p className="text-5xl">🎈</p>

            <h2 className="mt-3 text-3xl font-extrabold text-[#4B367C] md:text-4xl">
              ¡Hoy es el cumpleaños de {selectedChildName}!
            </h2>

            {selectedChildAge !== null && (
              <p className="mt-3 text-xl font-bold text-[#5C4A00]">
                Hoy cumple {formatAgeLabel(selectedChildAge)} 🎉
              </p>
            )}

            <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold text-[#6B5A95]">
              FloFlo puede acompañar este día especial con calma, anticipación y
              alegría.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-10">
          <div className="text-center lg:text-left">
            <p className="text-[#8B6FD6] font-bold text-lg mb-2">
              Bienvenido a FloFlo
            </p>

            <p
              className={`inline-block text-sm font-bold px-4 py-2 rounded-full mb-4 ${
                user?.role === "parent"
                  ? "bg-[#CFEFD9] text-[#2F6B4F] border border-[#9ED5B3]"
                  : "bg-[#E8DDFF] text-[#6B4FC3] border border-[#D6C7FF]"
              }`}
            >
              {user?.role === "parent"
                ? `${adultProfileEmoji} ${adultProfileLabel}`
                : "👶 Niño/a"}
            </p>

            <h1 className="text-5xl md:text-7xl font-extrabold text-[#4B367C] leading-tight mb-6">
              {user?.role === "parent"
                ? `Hola${user?.firstName ? `, ${user.firstName}` : ""}`
                : `¡Hola${user?.firstName ? `, ${user.firstName}` : ""}! Soy Félix 👋`}
            </h1>

            <p className="text-xl md:text-2xl text-[#6B5A95] leading-relaxed mb-8 max-w-2xl">
              {user?.role === "parent"
                ? selectedChild
                  ? `Acompañas a ${selectedChildName} como ${adultProfileLabel} en FloFlo.`
                  : `Tu perfil en FloFlo es ${adultProfileLabel}.`
                : "Cuando entendemos lo que viene, todo se siente más fácil."}
            </p>

            <Link
              to={
                user?.role === "parent"
                  ? "/panel-padres"
                  : user
                    ? "/conversaciones"
                    : "/login"
              }
              className="inline-block bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white text-xl font-bold px-8 py-4 rounded-full transition"
            >
              {user?.role === "parent"
                ? "Ir al Panel de Apoyo"
                : user
                  ? "Continuar con Félix"
                  : "Iniciar sesión"}
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <motion.img
              src={felix}
              alt="Félix saludando"
              className="w-64 h-64 md:w-80 md:h-80 object-contain"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white rounded-[2rem] px-6 py-5 mt-4 shadow-md max-w-sm text-center"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45" />
              <p className="text-[#4B367C] text-lg font-bold">
                {user?.role === "parent"
                  ? "Puedes registrar avances aunque el niño necesite apoyo para usar la app."
                  : (progress?.points || 0) >= 20
                    ? "¡Lo estás haciendo increíble! Ya tienes muchas estrellas."
                    : "Podemos ir paso a paso. No hay prisa."}
              </p>
            </motion.div>
          </div>
        </div>

        {user?.role === "parent" && isParent && selectedChildId && (
          <ChildRewardStats
            key={`${user.id}:${selectedChildId}`}
            childId={selectedChildId}
            actorUserId={user.id}
          />
        )}

        {user && profile && user?.role !== "parent" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <DashboardCard
              icon="⭐"
              title="Estrellas"
              value={progress?.points || 0}
              color="bg-[#FFF3C4]"
            />
            <DashboardCard
              icon="🏆"
              title="Nivel"
              value={progress?.level || 1}
              color="bg-[#E8DDFF]"
            />
            <DashboardCard
              icon="🎖"
              title="Logros"
              value={profile.achievements || 0}
              color="bg-[#DDF7FF]"
            />
          </div>
        )}

        {user && profile && user?.role !== "parent" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <SmallStat
              icon="💬"
              title="Conversaciones"
              value={progress?.completed_conversations || 0}
            />
            <SmallStat
              icon="📍"
              title="Lugares Preparados"
              value={progress?.completed_places || 0}
            />
            <SmallStat
              icon="📅"
              title="Rutinas realizadas"
              value={progress?.completed_routines || 0}
            />
            <SmallStat
              icon="😊"
              title="Emociones"
              value={progress?.completed_moods || 0}
            />
          </div>
        )}

        {user?.role === "parent" && isParent && selectedChildId && (
          <HomeChildProgress
            key={`${user.id}:${selectedChildId}`}
            childId={selectedChildId}
            actorUserId={user.id}
            childName={selectedChildName}
          />
        )}

        {user?.role === "parent" && isParent && selectedChildId && (
          <div className="mb-12">
            <MiBienestar
              key={`${user.id}:${selectedChildId}`}
              childId={selectedChildId}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {accesos.map((item) => (
            <motion.div
              key={item.titulo}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
            >
              <Link
                to={item.ruta}
                className={`${item.color} block rounded-[2rem] p-7 shadow-md hover:shadow-lg transition min-h-[220px]`}
              >
                <div className="text-5xl mb-5">{item.emoji}</div>

                <h2 className="text-2xl font-extrabold text-[#4B367C] mb-3">
                  {item.titulo}
                </h2>

                <p className="text-[#6B5A95] text-lg leading-relaxed">
                  {item.descripcion}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[#9B7BE8] font-bold mb-2">
              {user?.role === "parent"
                ? "Actividad sugerida para acompañar"
                : "Actividad recomendada del día"}
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold text-[#4B367C] mb-3">
              Prepararme para visitar un lugar
            </h2>

            <p className="text-[#6B5A95] text-lg max-w-2xl">
              {user?.role === "parent"
                ? "Puedes preparar junto al niño una visita a un lugar nuevo o importante."
                : "Félix puede mostrarte paso a paso qué puede ocurrir antes de ir a un lugar nuevo."}
            </p>
          </div>

          <Link
            to="/lugares"
            className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold px-8 py-4 rounded-full transition whitespace-nowrap"
          >
            {user?.role === "parent" ? "Registrar lugar" : "Ir a prepararme"}
          </Link>
        </div>
      </section>
    </main>
  );
};

const normalizeUnlocked = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

const ChildRewardStats = ({ childId, actorUserId }) => {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, error: null });

    Promise.all([getChildProgress(childId), getChildAchievements(childId)])
      .then(([progress, achievements]) => {
        if (cancelled) return;
        if (progress?.child_id != null && Number(progress.child_id) !== Number(childId)) {
          throw new Error("El progreso recibido pertenece a otro perfil");
        }
        const unlocked = Array.isArray(achievements)
          ? achievements.filter((item) => normalizeUnlocked(item.unlocked)).length
          : null;
        setState({ loading: false, data: { progress, unlocked }, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          loading: false,
          data: null,
          error: error?.response?.status === 403
            ? "No tienes permiso para consultar este perfil."
            : "No pudimos cargar las recompensas del perfil infantil.",
        });
      });

    return () => { cancelled = true; };
  }, [childId, actorUserId]);

  if (state.loading) {
    return <p role="status" className="mb-12 text-[#6B5A95]">Cargando estrellas y logros...</p>;
  }
  if (state.error) {
    return <p role="alert" className="mb-12 text-[#925B24]">{state.error}</p>;
  }

  const progress = state.data?.progress;
  const count = (value) => value == null ? "—" : Number(value);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <DashboardCard icon="⭐" title="Estrellas" value={count(progress?.points)} color="bg-[#FFF3C4]" />
        <DashboardCard icon="🏆" title="Nivel" value={count(progress?.level)} color="bg-[#E8DDFF]" />
        <DashboardCard icon="🎖" title="Logros" value={state.data.unlocked ?? "—"} color="bg-[#DDF7FF]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <SmallStat icon="💬" title="Conversaciones" value={count(progress?.completed_conversations)} />
        <SmallStat icon="📍" title="Lugares Preparados" value={count(progress?.completed_places)} />
        <SmallStat icon="📅" title="Rutinas realizadas" value={count(progress?.completed_routines)} />
        <SmallStat icon="😊" title="Emociones" value={count(progress?.completed_moods)} />
      </div>
    </>
  );
};

const HomeChildProgress = ({ childId, actorUserId, childName }) => {
  const [state, setState] = useState({ loading: true, support: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, support: null, error: null });

    getChildSupport(childId)
      .then((support) => {
        if (cancelled) return;
        if (Number(support?.child_id) !== Number(childId)) {
          throw new Error("Perfil infantil recibido incorrecto");
        }
        setState({ loading: false, support, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          loading: false,
          support: null,
          error: error?.response?.status === 403
            ? "No tienes permiso para consultar este perfil."
            : "No pudimos cargar el resumen de apoyos.",
        });
      });

    return () => { cancelled = true; };
  }, [childId, actorUserId]);

  return (
    <section className="mb-12 rounded-[2.5rem] bg-white p-6 md:p-9 shadow-md" aria-label="Seguimiento de avances">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-bold text-[#8B6FD6]">Seguimiento individual</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#4B367C]">
            Avances de {childName}
          </h2>
          <p className="mt-2 text-[#6B5A95]">
            Acciones completadas y apoyos registrados en las rutinas.
          </p>
        </div>
        <Link
          to={`/dashboard/children/${childId}`}
          className="inline-flex justify-center rounded-full bg-[#9B7BE8] px-6 py-3 font-bold text-white hover:bg-[#8B6FD6] transition"
        >
          Ver seguimiento completo
        </Link>
      </div>

      {state.loading && <p role="status" className="text-[#6B5A95]">Cargando apoyos...</p>}
      {state.error && <p role="alert" className="text-[#925B24]">{state.error}</p>}

      {!state.loading && !state.error && state.support && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <HomeProgressStat title="Acciones completadas" value={state.support.total_completed_steps} />
            <HomeProgressStat title="Con apoyo informado" value={state.support.documented_support_steps} />
            <HomeProgressStat title="Apoyo no informado" value={state.support.unspecified_support_steps} />
          </div>
          <RoutineAnalytics childId={childId} actorUserId={actorUserId} />
          <SupportChart support={state.support} />
        </div>
      )}
    </section>
  );
};

const HomeProgressStat = ({ title, value }) => (
  <div className="rounded-2xl bg-[#F3ECFF] p-5">
    <p className="text-sm font-bold text-[#6B5A95]">{title}</p>
    <p className="mt-2 text-3xl font-extrabold text-[#4B367C]">
      {Number.isFinite(Number(value)) ? new Intl.NumberFormat("es-CL").format(Number(value)) : "—"}
    </p>
  </div>
);

const DashboardCard = ({ icon, title, value, color }) => {
  return (
    <div className={`${color} rounded-[2rem] p-6 shadow-md`}>
      <div className="text-5xl mb-3">{icon}</div>
      <h2 className="text-xl font-bold text-[#4B367C]">{title}</h2>
      <p className="text-5xl font-extrabold text-[#4B367C] mt-3">{value}</p>
    </div>
  );
};

const SmallStat = ({ icon, title, value }) => {
  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-md text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-[#6B5A95] font-semibold">{title}</p>
      <p className="text-3xl font-extrabold text-[#4B367C]">{value}</p>
    </div>
  );
};

export default Home;
