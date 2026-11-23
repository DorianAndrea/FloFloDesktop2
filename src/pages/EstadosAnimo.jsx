import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import {
  createMood,
  getMoods,
  createChildMood,
  getChildMoods,
} from "../services/moodService";

import feliz from "../assets/webp/felix_cara_sonriendo.webp";
import felixAvergonzado from "../modules/flocards/svg/felix_avergonzado_solo_cara_animado.svg";
import felixTranquilo from "../modules/flocards/svg/felix_tranquilo_solo_cara_animado.svg";
import felixFrustrado from "../modules/flocards/svg/felix_frustrado.svg";
import sorprendido from "../assets/webp/felix_cara_sorprendido.webp";
import triste from "../assets/webp/felix_cara_triste_animado.webp";
import enojado from "../assets/webp/felix_enojado_animado.webp";
import felixRespirando from "../assets/webp/felix_respirando.webp";
import felix_asustado from "../assets/webp/felix_asustado_animado_real.webp";
import felixFeliz from "../assets/svg/felix_feliz.svg";
import sparkle from "../assets/sounds/sparkle.mp3";

import AchievementPopup from "../components/AchievementPopup";
import { getCachedData, setCachedData } from "../utils/cache";
import { showUnlockedAchievements } from "../utils/showUnlockedAchievements";

const getCreatorProfileLabel = (mood) => {
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

  if (mood?.source === "child") {
    return "Registro del niño/a";
  }

  return (
    relationshipLabels[mood?.creator_relationship_key] || "Adulto/a de apoyo"
  );
};

const getCreatorName = (mood) => {
  const fullName = `${mood?.creator_first_name || ""} ${
    mood?.creator_last_name || ""
  }`.trim();

  return fullName || "Usuario FloFlo";
};

const EstadosAnimo = () => {
  const { setMood, user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,

    isCaregiver,
    isTherapist,
    isTeacher,
    isFamily,
    isProfessional,
    observationProfileLabel,
  } = useSelectedChild();

  const { showFeedback } = useFeedback();

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const supportModeLabel = (() => {
    if (isTherapist) return "Modo profesional activo";
    if (isTeacher) return "Modo educativo activo";
    if (isFamily) return "Modo familiar activo";
    if (isProfessional) return "Modo profesional activo";

    return "Modo cuidador activo";
  })();

  const supportObservationDescription = (() => {
    if (isTherapist) {
      return `Registrarás una observación profesional sobre el estado emocional de ${childName}.`;
    }

    if (isTeacher) {
      return `Registrarás una observación educativa sobre el estado emocional de ${childName}.`;
    }

    if (isFamily) {
      return `Registrarás una observación familiar sobre el estado emocional de ${childName}.`;
    }

    if (isProfessional) {
      return `Registrarás una observación profesional sobre el estado emocional de ${childName}.`;
    }

    return `Registrarás una observación emocional como cuidador/a para ${childName}.`;
  })();

  const observationSuccessMessage = (() => {
    if (isTherapist || isProfessional) {
      return `La observación profesional fue guardada para ${childName}.`;
    }

    if (isTeacher) {
      return `La observación educativa fue guardada para ${childName}.`;
    }

    if (isFamily) {
      return `La observación familiar fue guardada para ${childName}.`;
    }

    return `La observación emocional fue guardada para ${childName}.`;
  })();

  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [moods, setMoods] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null);
  const [loading, setLoading] = useState(true);

  const [playSparkle] = useSound(sparkle, { volume: 0.5 });

  const moodImages = {
    "felix_cara_sonriendo.svg": feliz,
    "felix_cara_sorprendido.svg": sorprendido,
    "felix_cara_triste_animado.svg": triste,
    "felix_enojado_animado.svg": enojado,
    "felix_feliz.svg": felixFeliz,
    "felix_respirando.svg": felixRespirando,
    "felix_asustado_animado_real.svg": felix_asustado,
    "felix_avergonzado_solo_cara_animado.svg": felixAvergonzado,
    "felix_tranquilo_solo_cara_animado.svg": felixTranquilo,
    "felix_frustrado.svg": felixFrustrado,
  };

  const estados = [
    {
      id: 1,
      nombre: "Feliz",
      valor: "feliz",
      imagen: feliz,
      mensaje: isParentMode
        ? `${childName} se mostró feliz.`
        : "Qué bueno que te sientes feliz hoy.",
      sonido: playSparkle,
    },
    {
      id: 4,
      nombre: "Asustado",
      valor: "asustado",
      imagen: felix_asustado,
      mensaje: isParentMode
        ? `${childName} se mostró asustado/a.`
        : "¡Vaya! Parece que algo te asustó.",
    },
    {
      id: 2,
      nombre: "Triste",
      valor: "triste",
      imagen: triste,
      mensaje: isParentMode
        ? `${childName} se mostró triste.`
        : "Veo que estás triste. ¿Quieres respirar conmigo?",
    },
    {
      id: 3,
      nombre: "Enojado",
      valor: "enojado",
      imagen: enojado,
      mensaje: isParentMode
        ? `${childName} se mostró enojado/a.`
        : "Respiremos juntos para calmarnos.",
    },
    {
      id: 9,
      nombre: "Avergonzado",
      valor: "avergonzado",
      imagen: felixAvergonzado,
      mensaje: isParentMode
        ? `${childName} se mostró avergonzado/a.`
        : "Está bien sentirse avergonzado/a. Félix está contigo.",
    },
    {
      id: 11,
      nombre: "Tranquilo",
      valor: "tranquilo",
      imagen: felixTranquilo,
      mensaje: isParentMode
        ? `${childName} se mostró tranquilo/a.`
        : "Qué bien que te sientes tranquilo/a. Disfruta este momento.",
    },
    {
      id: 12,
      nombre: "Frustrado",
      valor: "frustrado",
      imagen: felixFrustrado,
      color: "#FFF3E0",
       mensaje: isParentMode
        ? `${childName} se mostró frustrado/a.`
        : "Qué bien que te sientes frustrado/a. Disfruta este momento.",
    },
  ];

  const loadMoods = async ({ useCache = true } = {}) => {
    try {
      if (!user) return;

      if (isParent && loadingChildren) return;

      const ownerId = isParentMode ? selectedChildId : user.id;
      const cacheKey = `floflo_moods_${ownerId}`;

      if (isParentWithoutChild) {
        setMoods([]);
        setLoading(false);
        return;
      }

      if (useCache) {
        const cachedMoods = getCachedData(cacheKey);

        if (Array.isArray(cachedMoods)) {
          setMoods(cachedMoods);
          setLoading(false);
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }

      const data = isParentMode
        ? await getChildMoods(selectedChildId)
        : await getMoods();

      const safeMoods = Array.isArray(data) ? data : [];

      setMoods(safeMoods);
      setCachedData(cacheKey, safeMoods);
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cargar el historial",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoods();
  }, [user?.id, user?.role, selectedChildId, loadingChildren]);

  useEffect(() => {
    setEstadoSeleccionado(null);
  }, [selectedChildId, user?.id]);

  const seleccionarEstado = async (estado) => {
    if (!user) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Sesión requerida",
        title: "Debes iniciar sesión",
        message: "Inicia sesión para guardar cómo te sientes hoy.",
      });
      return;
    }

    if (isParentWithoutChild) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta niño/a activo",
        title: "Selecciona un niño/a",
        message:
          "Para registrar una observación emocional, primero debes seleccionar un niño/a activo.",
      });
      return;
    }

    setEstadoSeleccionado(estado.valor);

    if (!isParentMode) {
      setMood(estado.valor);
    }

    if (estado.sonido) {
      estado.sonido();
    }

    try {
      const payload = {
        mood_type_id: estado.id,
        comment: isParentMode
          ? `${observationProfileLabel}: hoy ${childName} se mostró ${estado.nombre.toLowerCase()}.`
          : `Hoy me siento ${estado.nombre}`,
      };

      const response = isParentMode
        ? await createChildMood(selectedChildId, payload)
        : await createMood(payload);

      const ownerId = isParentMode ? selectedChildId : user.id;
      localStorage.removeItem(`floflo_achievements_${ownerId}`);

      const unlockedAchievements = Array.isArray(response?.unlockedAchievements)
        ? response.unlockedAchievements
        : [];

      if (unlockedAchievements.length > 0) {
        showUnlockedAchievements(showFeedback, unlockedAchievements);

        setNewAchievement(unlockedAchievements[0]);

        setTimeout(() => {
          setNewAchievement(null);
        }, 5000);
      } else {
        showFeedback({
          type: "success",
          icon: isParentMode ? "✅" : "⭐",
          label: isParentMode ? "Observación guardada" : "Emoción registrada",
          title: isParentMode
            ? `${observationProfileLabel} registrada`
            : "¡Muy bien!",
          message: isParentMode
            ? observationSuccessMessage
            : "Félix guardó cómo te sientes hoy. Ganaste una estrella.",
        });
      }

      await loadMoods({ useCache: false });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo guardar",
        message:
          error.response?.data?.message ||
          "No se pudo guardar el estado de ánimo. Intenta nuevamente.",
      });
    }
  };

  const estadoActual = estados.find(
    (estado) => estado.valor === estadoSeleccionado,
  );

  const felixGuia =
    estadoSeleccionado === "feliz" ? felixFeliz : felixRespirando;

  if (loadingChildren || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-6 py-10">
        <p className="text-2xl font-bold text-[#4B367C]">
          Cargando emociones...
        </p>
      </main>
    );
  }

  if (isParentWithoutChild) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-6 py-10">
        <section className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#4B367C]">
            No hay niño/a seleccionado
          </h1>

          <p className="mt-4 text-[#6B5A95]">
            Para ver o registrar observaciones emocionales, primero debes
            seleccionar un niño/a activo.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F3ECFF] px-6 py-10">
      <AchievementPopup achievement={newAchievement} />

      <section className="w-full max-w-6xl pt-6 text-center">
        <div className="mb-20">
          <h1 className="mb-6 text-5xl font-extrabold text-[#4B367C] drop-shadow-sm md:text-7xl">
            {isParentMode
              ? `¿Cómo se sintió ${childName} hoy?`
              : "¿Cómo te sientes hoy?"}
          </h1>

          <p className="text-xl font-medium text-[#6B5A95] md:text-2xl">
            {isParentMode
              ? "Elige la emoción que observaste para dejarla registrada."
              : "Elige la carita que más se parece a cómo te sientes."}
          </p>
        </div>

        {isParentMode && (
          <div className="mx-auto mb-10 max-w-3xl rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 shadow-sm">
            <p className="font-bold text-[#2F6B4F]">{supportModeLabel}</p>

            <p className="mt-1 text-[#2F6B4F]">
              {supportObservationDescription} Esta observación no suma estrellas
              al niño/a.
            </p>
          </div>
        )}

        <div className="mb-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {estados.map((estado) => {
            const seleccionado = estadoSeleccionado === estado.valor;

            return (
              <motion.button
                key={estado.valor}
                type="button"
                onClick={() => seleccionarEstado(estado)}
                whileHover={{ scale: 1.04 }}
                animate={{ scale: seleccionado ? 1.08 : 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`
                  flex flex-col items-center justify-center rounded-[2rem] bg-white p-6 shadow-md
                  transition-all duration-300
                  ${
                    seleccionado
                      ? "shadow-xl ring-4 ring-[#9B7BE8]"
                      : "ring-2 ring-transparent"
                  }
                `}
              >
                <img
                  src={estado.imagen}
                  alt={estado.nombre}
                  className="h-36 w-36 object-contain md:h-44 md:w-44"
                />

                <span className="mt-5 text-2xl font-bold text-[#4B367C]">
                  {estado.nombre}
                </span>
              </motion.button>
            );
          })}
        </div>

        {estadoActual && (
          <div className="flex flex-col items-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={felixGuia}
                alt="Félix guía"
                className="h-56 w-56 object-contain md:h-80 md:w-80"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative max-w-xl rounded-[2rem] bg-white px-8 py-6 shadow-md"
            >
              <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-white" />

              <p className="text-xl font-semibold leading-relaxed text-[#4B367C] md:text-2xl">
                {estadoActual.mensaje}
              </p>
            </motion.div>
          </div>
        )}

        <div className="mx-auto mt-16 w-full max-w-3xl rounded-[2rem] bg-white p-8 shadow-md">
          <h2 className="mb-6 text-3xl font-bold text-[#4B367C]">
            Historial de emociones
          </h2>

          {moods.length === 0 ? (
            <p className="text-[#6B5A95]">Aún no hay emociones registradas.</p>
          ) : (
            moods.map((mood) => {
              const isAdultObservation =
                mood.source === "adult" || mood.source === "parent";

              return (
                <div
                  key={mood.id}
                  className="mb-4 rounded-2xl border-2 border-[#DCCCF8] p-4"
                >
                  <img
                    src={moodImages[mood.icon]}
                    alt={mood.mood_name}
                    className="mx-auto mb-3 h-20 w-20 object-contain"
                  />

                  <h3 className="text-xl font-bold text-[#4B367C]">
                    {mood.mood_name}
                  </h3>

                  <div
                    className={`mx-auto mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                      isAdultObservation
                        ? "bg-[#EAF8EF] text-[#2F6B4F]"
                        : "bg-[#F3ECFF] text-[#4B367C]"
                    }`}
                  >
                    {getCreatorProfileLabel(mood)}
                  </div>

                  {isAdultObservation && (
                    <p className="mt-2 text-sm font-semibold text-[#6B5A95]">
                      Registrado por {getCreatorName(mood)}
                    </p>
                  )}

                  <p className="mt-3 text-[#6B5A95]">{mood.comment}</p>

                  <p className="mt-2 text-sm text-[#8A7BB0]">
                    {new Date(mood.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};

export default EstadosAnimo;
