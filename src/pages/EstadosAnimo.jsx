import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import { useFloFlo } from "../context/FloFloContext";
import { createMood } from "../services/moodService";
import { getMoods } from "../services/moodService";

import feliz from "../assets/webp/felix_cara_sonriendo.webp";
import sorprendido from "../assets/webp/felix_cara_sorprendido.webp";
import triste from "../assets/webp/felix_cara_triste_animado.webp";
import enojado from "../assets/webp/felix_enojado_animado.webp";
import felixRespirando from "../assets/webp/felix_respirando.webp";
import felix_asustado from "../assets/webp/felix_asustado_animado_real.webp";
import felixFeliz from "../assets/svg/felix_feliz.svg"; // NO CAMBIAR
import sparkle from "../assets/sounds/sparkle.mp3";

import AchievementPopup from "../components/AchievementPopup";

const EstadosAnimo = () => {
  const { mood, setMood, user } = useFloFlo();
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [moods, setMoods] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null);

  const [playSparkle] = useSound(sparkle, { volume: 0.5 });

  const moodImages = {
    "felix_cara_sonriendo.svg": feliz,
    "felix_cara_sorprendido.svg": sorprendido,
    "felix_cara_triste_animado.svg": triste,
    "felix_enojado_animado.svg": enojado,
    "felix_feliz.svg": felixFeliz,
    "felix_respirando.svg": felixRespirando,
    "felix_asustado_animado_real.svg": felix_asustado,
  };
  const estados = [
    {
      id: 1,
      nombre: "Feliz",
      valor: "feliz",
      imagen: feliz,
      mensaje: "Qué bueno que te sientes feliz hoy.",
      sonido: playSparkle,
    },
    {
      id: 4,
      nombre: "Asustado",
      valor: "asustado",
      imagen: felix_asustado,
      mensaje: "¡Vaya! Parece que algo te asustó.",
      //sonido: playAsustado,
    },
    {
      id: 2,
      nombre: "Triste",
      valor: "triste",
      imagen: triste,
      mensaje: "Veo que estás triste. ¿Quieres respirar conmigo?",
      //sonido: playTriste,
    },
    {
      id: 3,
      nombre: "Enojado",
      valor: "enojado",
      imagen: enojado,
      mensaje: "Respiremos juntos para calmarnos.",
      //sonido: playEnojado,
    },
  ];

  useEffect(() => {
    loadMoods();
  }, [user]);

  const loadMoods = async () => {
    try {
      if (!user) return;

      const data = await getMoods();

      const moodsUsuario = data.filter(
        (mood) => Number(mood.user_id) === Number(user.id),
      );

      setMoods(moodsUsuario);
    } catch (error) {
      console.error(error);
    }
  };

  const seleccionarEstado = async (estado) => {
    if (!user) {
      alert("Debes iniciar sesión primero");
      return;
    }
    setEstadoSeleccionado(estado.valor);
    setMood(estado.valor);
    if (estado.sonido) {
      estado.sonido();
    }
    try {
      const response = await createMood({
        user_id: user.id,
        mood_type_id: estado.id,
        comment: `Hoy me siento ${estado.nombre}`,
      });

      if (response.unlockedAchievements?.length > 0) {
        setNewAchievement(response.unlockedAchievements[0]);
      } else {
        setNewAchievement({
          icon: "😊",
          name: "Emoción registrada",
          description:
            "Félix guardó cómo te sientes hoy. Ganaste una estrella.",
        });
      }

      setTimeout(() => {
        setNewAchievement(null);
      }, 5000);
      await loadMoods();
      console.log("Estado guardado");
    } catch (error) {
      console.error(error);
      alert("Error al guardar estado de ánimo");
    }
  };

  const estadoActual = estados.find(
    (estado) => estado.valor === estadoSeleccionado,
  );

  const felixGuia =
    estadoSeleccionado === "feliz" ? felixFeliz : felixRespirando;

  return (
    <main className="min-h-screen bg-[#F3ECFF] flex flex-col items-center px-6 py-10">
      <AchievementPopup achievement={newAchievement} />
      <section className="w-full max-w-6xl text-center pt-6">
        <div className="mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#4B367C] mb-6 drop-shadow-sm">
            ¿Cómo te sientes hoy?
          </h1>

          <p className="text-xl md:text-2xl font-medium text-[#6B5A95]">
            Elige la carita que más se parece a cómo te sientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
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
                  bg-white rounded-[2rem] p-6 shadow-md
                  flex flex-col items-center justify-center
                  transition-all duration-300
                  ${
                    seleccionado
                      ? "ring-4 ring-[#9B7BE8] shadow-xl"
                      : "ring-2 ring-transparent"
                  }
                `}
              >
                <img
                  src={estado.imagen}
                  alt={estado.nombre}
                  className="w-36 h-36 md:w-44 md:h-44 object-contain"
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
                className="w-56 h-56 md:w-80 md:h-80 object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative bg-white rounded-[2rem] px-8 py-6 max-w-xl shadow-md"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45" />

              <p className="text-xl md:text-2xl font-semibold text-[#4B367C] leading-relaxed">
                {estadoActual.mensaje}
              </p>
            </motion.div>
          </div>
        )}
        <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-md p-8 mt-16 mx-auto">
          <h2 className="text-3xl font-bold text-[#4B367C] mb-6">
            Historial de emociones
          </h2>

          {moods.length === 0 ? (
            <p className="text-[#6B5A95]">Aún no hay emociones registradas.</p>
          ) : (
            moods.map((mood) => (
              <div
                key={mood.id}
                className="border-2 border-[#DCCCF8] rounded-2xl p-4 mb-4"
              >
                <img
                  src={moodImages[mood.icon]}
                  alt={mood.mood_name}
                  className="w-20 h-20 object-contain mx-auto mb-3"
                />
                <h3 className="text-xl font-bold text-[#4B367C]">
                  {mood.mood_name}
                </h3>

                <p className="text-[#6B5A95]">{mood.comment}</p>

                <p className="text-sm text-[#8A7BB0] mt-2">
                  {new Date(mood.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default EstadosAnimo;
