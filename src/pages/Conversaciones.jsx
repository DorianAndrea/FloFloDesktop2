import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import { useFloFlo } from "../context/FloFloContext";
import { generateConversation } from "../services/aiService";
import {
  createConversation,
  getConversations,
  completeConversation,
  getConversationProgress,
} from "../services/conversationService";
import { getUserProgress } from "../services/progressService";
import AchievementPopup from "../components/AchievementPopup";
import { getAllContactConversations } from "../services/contactConversationService";

import felix from "../assets/webp/felix_cara_sonriendo.webp";
import felixRespirando from "../assets/webp/felix_respirando.webp";
import felixFeliz from "../assets/svg/felix_feliz.svg"; // NO CAMBIAR


import successSound from "../assets/sounds/kid_success.mp3";
import wrongSound from "../assets/sounds/error.mp3";

const contenidoBasePorTitulo = {
  Saludar: {
    emoji: "👋",
    dialogo: [
      { personaje: "Félix", texto: "Hola." },
      { personaje: "Amigo", texto: "Hola." },
      { personaje: "Félix", texto: "¿Cómo estás?" },
      { personaje: "Amigo", texto: "Estoy bien." },
    ],
    ejercicio: {
      pregunta: "¿Qué debería decir Félix para saludar?",
      opciones: [
        { texto: "Hola.", correcta: true },
        { texto: "Adiós.", correcta: false },
        { texto: "No quiero.", correcta: false },
      ],
    },
  },
  "Pedir ayuda": {
    emoji: "🙋",
    dialogo: [
      { personaje: "Félix", texto: "Necesito ayuda." },
      { personaje: "Adulto", texto: "Te ayudaré." },
      { personaje: "Félix", texto: "Gracias." },
    ],
    ejercicio: {
      pregunta: "¿Qué puede decir Félix si necesita ayuda?",
      opciones: [
        { texto: "Necesito ayuda.", correcta: true },
        { texto: "Me voy.", correcta: false },
        { texto: "No hablo.", correcta: false },
      ],
    },
  },
  "Expresar emociones": {
    emoji: "💬",
    dialogo: [
      { personaje: "Mamá", texto: "¿Cómo te sientes?" },
      { personaje: "Félix", texto: "Estoy triste." },
      { personaje: "Mamá", texto: "Gracias por contármelo." },
    ],
    ejercicio: {
      pregunta: "¿Qué puede decir Félix para contar cómo se siente?",
      opciones: [
        { texto: "Estoy triste.", correcta: true },
        { texto: "Tengo una pelota.", correcta: false },
        { texto: "Quiero correr.", correcta: false },
      ],
    },
  },
  "Ir al médico": {
    emoji: "🩺",
    dialogo: [
      { personaje: "Médico", texto: "Hola, soy el doctor." },
      { personaje: "Félix", texto: "Hola." },
      { personaje: "Médico", texto: "Voy a revisarte." },
      { personaje: "Félix", texto: "Está bien." },
    ],
    ejercicio: {
      pregunta: "¿Qué puede decir Félix cuando el médico lo va a revisar?",
      opciones: [
        { texto: "Está bien.", correcta: true },
        { texto: "No sé sumar.", correcta: false },
        { texto: "Quiero un juguete.", correcta: false },
      ],
    },
  },
  Jugar: {
    emoji: "🧸",
    dialogo: [
      { personaje: "Félix", texto: "¿Puedo jugar?" },
      { personaje: "Niño", texto: "Sí." },
      { personaje: "Félix", texto: "Gracias." },
    ],
    ejercicio: {
      pregunta: "¿Qué puede decir Félix para jugar con otros niños?",
      opciones: [
        { texto: "¿Puedo jugar?", correcta: true },
        { texto: "Dame eso.", correcta: false },
        { texto: "Me voy a dormir.", correcta: false },
      ],
    },
  },
  Cumpleaños: {
    emoji: "🎂",
    dialogo: [
      { personaje: "Félix", texto: "¿Dónde vamos?" },
      { personaje: "Mamá", texto: "A un cumpleaños." },
      { personaje: "Félix", texto: "¿Quién estará?" },
      { personaje: "Mamá", texto: "Tus amigos." },
      { personaje: "Félix", texto: "¿Qué haré?" },
      { personaje: "Mamá", texto: "Saltarás y jugarás con tus amigos." },
    ],
    ejercicio: {
      pregunta: "¿Qué puede decir Félix cuando llegue al cumpleaños?",
      opciones: [
        { texto: "Quiero lavarme los dientes.", correcta: false },
        { texto: "Tengo frío.", correcta: false },
        { texto: "Hola, aquí está tu regalo.", correcta: true },
      ],
    },
  },
};

const getEmojiByTitle = (title) => {
  return contenidoBasePorTitulo[title]?.emoji || "✨";
};

const Conversaciones = () => {
  const {
    points,
    setPoints,
    level,
    setLevel,
    completedConversations,
    setCompletedConversations,
    soundEnabled,
    setSoundEnabled,
  } = useFloFlo();

  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] =
    useState(null);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  const [formIA, setFormIA] = useState({
    topic: "",
    situation: "",
    person: "",
    emotion: "",
  });

  const [playSuccess] = useSound(successSound, { volume: 0.45 });
  const [playWrongSound] = useSound(wrongSound, { volume: 0.35 });

  const cargarUserProgress = async () => {
    const progress = await getUserProgress();
    setPoints(Number(progress.points || 0));
    setLevel(Number(progress.level || 1));
  };

  const cargarProgreso = async () => {
    const progress = await getConversationProgress();
    const completedIds = progress.map((item) => Number(item.conversation_id));
    setCompletedConversations(completedIds);
  };

 const loadConversations = async () => {
  try {
    const data = await getConversations();
    const contactData = await getAllContactConversations();

    const conversacionesNormales = data.map((item) => {
      const base = contenidoBasePorTitulo[item.title];

      const dialogo =
        item.messages?.length > 0
          ? item.messages.map((msg) => ({
              personaje: msg.speaker,
              texto: msg.text,
            }))
          : base?.dialogo || [];

      const opciones =
        item.exercise?.options?.length > 0
          ? item.exercise.options.map((op) => ({
              texto: op.text,
              correcta: op.isCorrect,
            }))
          : base?.ejercicio?.opciones || [];

      return {
        id: `normal-${item.id}`,
        conversationId: Number(item.id),
        tipo: "normal",
        titulo: item.title,
        emoji: getEmojiByTitle(item.title),
        escenario: item.situation,
        habilidad: item.reminder || "Conversación personalizada",
        dialogo,
        ejercicio: {
          pregunta:
            item.exercise?.question ||
            base?.ejercicio?.pregunta ||
            "¿Qué debería decir Félix?",
          opciones,
        },
      };
    });

    const conversacionesContactos = contactData.map((item) => {
      const opciones = [
        {
          texto: item.correct_answer || item.what_to_say,
          correcta: true,
        },
        {
          texto: item.wrong_answer_1 || "No sé qué decir.",
          correcta: false,
        },
        {
          texto: item.wrong_answer_2 || "Me voy sin responder.",
          correcta: false,
        },
      ].filter((op) => op.texto && op.texto.trim() !== "");

      return {
        id: `contact-${item.id}`,
        conversationId: Number(item.id),
        tipo: "contacto",
        titulo: item.title,
        emoji: "✨",
        escenario: item.situation,
        habilidad: item.reminder || "Conversación personalizada",
        dialogo: [
          {
            personaje: "Félix",
            texto: item.what_to_say,
          },
        ],
        ejercicio: {
          pregunta: "¿Qué debería decir Félix?",
          opciones,
        },
      };
    });

    const todas = [...conversacionesNormales, ...conversacionesContactos];

    setConversaciones(todas);

    if (todas.length > 0) {
      setConversacionSeleccionada(todas[0]);
    }
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    loadConversations();
    cargarProgreso();
    cargarUserProgress();
  }, []);

  const progreso =
    conversaciones.length > 0
      ? (completedConversations.length / conversaciones.length) * 100
      : 0;

  const seleccionarConversacion = (conversacion) => {
    setConversacionSeleccionada(conversacion);
    setRespuestaSeleccionada(null);
  };

  const seleccionarRespuesta = async (opcion) => {
  setRespuestaSeleccionada(opcion);

  if (!opcion.correcta) {
    if (soundEnabled) playWrongSound();
    return;
  }

  if (soundEnabled) playSuccess();

  if (conversacionSeleccionada.tipo !== "normal") {
    setNewAchievement({
      icon: "⭐",
      name: "¡Muy bien!",
      description: "Practicaste una conversación personalizada.",
    });

    setTimeout(() => {
      setNewAchievement(null);
    }, 5000);

    return;
  }

  const idNumerico = conversacionSeleccionada.conversationId;

  if (completedConversations.includes(idNumerico)) return;

  try {
    const response = await completeConversation(idNumerico);

    if (response.unlockedAchievements?.length > 0) {
      setNewAchievement(response.unlockedAchievements[0]);
    } else {
      setNewAchievement({
        icon: "⭐",
        name: "¡Muy bien!",
        description: "Ganaste una estrella por completar la conversación.",
      });
    }

    setTimeout(() => {
      setNewAchievement(null);
    }, 5000);

    setCompletedConversations((prev) => [...prev, idNumerico]);

    await cargarProgreso();
    await cargarUserProgress();
  } catch (error) {
    console.error(error);
  }
};

  const handleChangeIA = (e) => {
    setFormIA({
      ...formIA,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateConversationIA = async () => {
    if (!formIA.topic.trim() || !formIA.situation.trim()) {
      alert("Debes ingresar tema y situación");
      return;
    }

    try {
      setGenerandoIA(true);

      const data = await generateConversation(formIA);

      const nuevaConversacion = {
        id: `ia-${Date.now()}`,
        titulo: data.title || formIA.topic,
        emoji: "✨",
        escenario: formIA.situation,
        habilidad: `Conversación generada con IA sobre ${formIA.topic}`,
        dialogo: data.messages.map((msg) => ({
          personaje: msg.speaker,
          texto: msg.text,
        })),
        ejercicio: {
          pregunta: data.exercise.question,
          opciones: data.exercise.options.map((op) => ({
            texto: op.text,
            correcta: op.isCorrect,
          })),
        },
      };

      const savedConversation = await createConversation({
        title: nuevaConversacion.titulo,
        situation: nuevaConversacion.escenario,
        what_to_say:
          nuevaConversacion.dialogo.find((msg) => msg.personaje === "Félix")
            ?.texto || "",
        reminder: nuevaConversacion.habilidad,
        messages: data.messages,
        exercise: data.exercise,
      });

      nuevaConversacion.id = Number(savedConversation.conversation.id);

      setConversaciones((prev) => [nuevaConversacion, ...prev]);
      setConversacionSeleccionada(nuevaConversacion);
      setRespuestaSeleccionada(null);

      alert("Félix generó una conversación correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al generar conversación con IA");
    } finally {
      setGenerandoIA(false);
    }
  };

  const esCorrecta = respuestaSeleccionada?.correcta;

  const felixActual = respuestaSeleccionada
    ? esCorrecta
      ? felixFeliz
      : felixRespirando
    : felix;

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <AchievementPopup achievement={newAchievement} />

      <section className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#4B367C] mb-3">
              Conversaciones
            </h1>

            <p className="text-lg md:text-xl text-[#6B5A95]">
              Practica situaciones simples con Félix.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FFF3C4] text-[#5C4A00] font-bold px-5 py-3 rounded-full shadow-sm">
              <div className="flex gap-4">
                <div className="bg-yellow-100 px-6 py-3 rounded-full shadow">
                  ⭐ {points} Estrellas
                </div>

                <div className="bg-purple-100 px-6 py-3 rounded-full shadow">
                  🏆 Nivel {level}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white text-[#4B367C] font-bold px-5 py-3 rounded-full shadow-sm"
            >
              {soundEnabled ? "🔊 Sonido" : "🔇 Silencio"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow-sm mb-10">
          <div className="flex justify-between mb-3">
            <p className="font-bold text-[#4B367C]">Progreso</p>
            <p className="text-[#6B5A95]">
              {completedConversations.length} de {conversaciones.length}
            </p>
          </div>

          <div className="h-4 bg-[#E8DDFF] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#9B7BE8] rounded-full"
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm mb-10">
          <h2 className="text-2xl font-bold text-[#4B367C] mb-2">
            ✨ Crear conversación con Félix
          </h2>

          <p className="text-[#6B5A95] mb-5">
            Escribe una situación y Félix generará una conversación para
            practicar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="topic"
              value={formIA.topic}
              onChange={handleChangeIA}
              placeholder="Tema: Pedir ayuda"
              className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />

            <input
              name="situation"
              value={formIA.situation}
              onChange={handleChangeIA}
              placeholder="Situación"
              className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />

            <input
              name="person"
              value={formIA.person}
              onChange={handleChangeIA}
              placeholder="Persona: Profesora"
              className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />

            <input
              name="emotion"
              value={formIA.emotion}
              onChange={handleChangeIA}
              placeholder="Emoción: Nervioso"
              className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateConversationIA}
            disabled={generandoIA}
            className="mt-5 bg-[#4B367C] hover:bg-[#3E2E68] text-white font-bold px-6 py-3 rounded-full disabled:opacity-50"
          >
            {generandoIA ? "Félix está pensando..." : "✨ Generar conversación"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr] gap-10 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {conversaciones.map((item) => {
              const activo = conversacionSeleccionada?.id === item.id;
              const completada = completedConversations.includes(
                Number(item.id),
              );

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => seleccionarConversacion(item)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ scale: activo ? 1.03 : 1 }}
                  transition={{ duration: 0.25 }}
                  className={`
                    bg-white rounded-[2rem] p-6 text-left shadow-md transition-all
                    ${
                      activo
                        ? "ring-4 ring-[#9B7BE8]"
                        : "ring-2 ring-transparent"
                    }
                  `}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-4xl">{item.emoji}</span>

                    {completada && (
                      <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                        Hecho
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-[#4B367C] mb-2">
                    {item.titulo}
                  </h2>

                  <p className="text-[#6B5A95] text-base">{item.escenario}</p>
                </motion.button>
              );
            })}
          </div>

          {conversacionSeleccionada && (
            <div className="bg-white rounded-[2.5rem] shadow-lg p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <motion.img
                  key={felixActual}
                  src={felixActual}
                  alt="Félix acompañando"
                  className="w-36 h-36 md:w-44 md:h-44 object-contain"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#4B367C]">
                    {conversacionSeleccionada.titulo}
                  </h2>

                  <p className="text-[#6B5A95] mt-2">
                    {conversacionSeleccionada.habilidad}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {conversacionSeleccionada.dialogo.map((linea, index) => {
                  const esFelix = linea.personaje === "Félix";

                  return (
                    <motion.div
                      key={`${linea.personaje}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className={`flex ${
                        esFelix ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`
                          max-w-[85%] rounded-[1.5rem] px-6 py-4 shadow-sm
                          ${
                            esFelix
                              ? "bg-[#E8DDFF] text-[#4B367C]"
                              : "bg-[#FFF3C4] text-[#5C4A00]"
                          }
                        `}
                      >
                        <p className="font-bold mb-1">{linea.personaje}</p>
                        <p className="text-xl">{linea.texto}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 bg-[#F3ECFF] rounded-[2rem] p-6">
                <p className="text-[#4B367C] font-bold mb-2">Escenario:</p>
                <p className="text-[#6B5A95]">
                  {conversacionSeleccionada.escenario}
                </p>
              </div>

              <div className="mt-8 bg-[#FDFBFF] border-2 border-[#E4D8FF] rounded-[2rem] p-6">
                <p className="text-sm font-bold text-[#9B7BE8] mb-2">
                  Nivel 2 · Elige la respuesta correcta
                </p>

                <h3 className="text-2xl font-bold text-[#4B367C] mb-5">
                  {conversacionSeleccionada.ejercicio.pregunta}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {conversacionSeleccionada.ejercicio.opciones.map((opcion) => {
                    const seleccionada =
                      respuestaSeleccionada?.texto === opcion.texto;
                    
                    return (
                      <motion.button
                        key={opcion.texto}
                        type="button"
                        onClick={() => seleccionarRespuesta(opcion)}
                        aria-pressed={seleccionada}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          w-full text-left rounded-2xl px-5 py-4 font-semibold
                          border-2 transition-all text-lg
                          ${
                            seleccionada && opcion.correcta
                              ? "bg-green-100 border-green-400 text-green-800"
                              : seleccionada && !opcion.correcta
                                ? "bg-[#FFE1E1] border-[#F2A3A3] text-[#8A3A3A]"
                                : "bg-white border-[#DCCCF8] text-[#4B367C] hover:border-[#9B7BE8]"
                          }
                        `}
                      >
                        {opcion.texto}
                      </motion.button>
                    );
                  })}
                </div>

                {respuestaSeleccionada && (
                  <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      mt-6 rounded-2xl p-5 font-bold text-lg
                      ${
                        respuestaSeleccionada.correcta
                          ? "bg-green-100 text-green-800"
                          : "bg-[#FFE1E1] text-[#8A3A3A]"
                      }
                    `}
                  >
                    {respuestaSeleccionada.correcta
                      ? "¡Muy bien! Félix está feliz por tu esfuerzo."
                      : "Está bien. Podemos intentarlo otra vez con calma."}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Conversaciones;
