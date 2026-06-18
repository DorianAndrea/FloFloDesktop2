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
  getPaginatedConversations,
  deleteConversation,
  updateConversation,
  toggleFavoriteConversation,
} from "../services/conversationService";

import { getUserProgress } from "../services/progressService";
import AchievementPopup from "../components/AchievementPopup";
import {
  completeContactConversation,
  getContactConversationProgress,
} from "../services/contactConversationService";

import felix from "../assets/webp/felix_cara_sonriendo.webp";
import felixRespirando from "../assets/webp/felix_respirando.webp";
import felixFeliz from "../assets/svg/felix_feliz.svg";

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

const generarOpcionesConIA = async (whatToSay, situation) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `Eres un asistente para una app de habilidades sociales para niños con autismo.
Dado este escenario: "${situation}"
Y la respuesta CORRECTA que debe decir Félix: "${whatToSay}"

Genera exactamente 2 respuestas INCORRECTAS que Félix NO debería decir en esta situación.
Las respuestas incorrectas deben ser cortas, simples y claramente inadecuadas para el contexto.

Responde SOLO con JSON válido, sin texto adicional, sin backticks:
{"wrong_1": "...", "wrong_2": "..."}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const parsed = JSON.parse(text.trim());
    return [parsed.wrong_1, parsed.wrong_2];
  } catch (e) {
    return ["Me quedo en silencio.", "Me alejo sin responder."];
  }
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
  const [cargandoOpciones, setCargandoOpciones] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalConversaciones, setTotalConversaciones] = useState(0);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [conversacionAEliminar, setConversacionAEliminar] = useState(null);

  const conversacionesPorPagina = 6;

  const [editando, setEditando] = useState(false);
  const [orden, setOrden] = useState("recientes");
  const [formEditar, setFormEditar] = useState({
    title: "",
    situation: "",
    reminder: "",
    messageFelix: "",
    question: "",
    correctAnswer: "",
    wrongAnswer1: "",
    wrongAnswer2: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounce, setBusquedaDebounce] = useState("");

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
    const normalProgress = await getConversationProgress();
    const contactProgress = await getContactConversationProgress();

    const normalIds = normalProgress.map(
      (item) => `normal-${Number(item.conversation_id)}`,
    );

    const contactIds = contactProgress.map(
      (item) => `contact-${Number(item.contact_conversation_id)}`,
    );

    setCompletedConversations([...normalIds, ...contactIds]);
  };

  const loadConversations = async () => {
    try {
      const data = await getPaginatedConversations(
        paginaActual,
        conversacionesPorPagina,
        busqueda,
        busquedaDebounce,
        orden,
      );

      const conversacionesMapeadas = data.conversations.map((item) => {
        const base = contenidoBasePorTitulo[item.title];

        const esContacto = item.tipo === "contacto";

        const dialogo =
          item.messages?.length > 0
            ? item.messages.map((msg) => ({
                personaje: msg.speaker,
                texto: msg.text,
              }))
            : esContacto
              ? [
                  {
                    personaje: "Félix",
                    texto: item.what_to_say,
                  },
                ]
              : base?.dialogo || [];

        const opciones = esContacto
          ? [
              {
                texto: item.correct_answer || item.what_to_say,
                correcta: true,
              },
              {
                texto: item.wrong_answer_1 || "Me quedo en silencio.",
                correcta: false,
              },
              {
                texto: item.wrong_answer_2 || "Me voy sin responder.",
                correcta: false,
              },
            ]
              .filter((op) => op.texto && op.texto.trim() !== "")
              .sort(() => Math.random() - 0.5)
          : item.exercise?.options?.length > 0
            ? item.exercise.options.map((op) => ({
                texto: op.text,
                correcta: op.isCorrect,
              }))
            : base?.ejercicio?.opciones || [];

        return {
          id: esContacto ? `contact-${item.id}` : `normal-${item.id}`,
          conversationId: Number(item.id),
          tipo: esContacto ? "contacto" : "normal",
          titulo: item.title,
          emoji: esContacto ? "✨" : getEmojiByTitle(item.title),
          escenario: item.situation,
          habilidad: item.reminder || "Conversación personalizada",
          what_to_say: item.what_to_say,
          correct_answer: item.correct_answer,
          wrong_answer_1: item.wrong_answer_1,
          wrong_answer_2: item.wrong_answer_2,
          is_favorite: item.is_favorite || false,
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

      setConversaciones(conversacionesMapeadas);
      setTotalPaginas(data.totalPages);
      setTotalConversaciones(data.total);

      if (conversacionesMapeadas.length > 0) {
        setConversacionSeleccionada((prev) => {
          if (!prev) return conversacionesMapeadas[0];

          const actualizada = conversacionesMapeadas.find(
            (item) => item.id === prev.id,
          );

          return actualizada || conversacionesMapeadas[0];
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadConversations();
    cargarProgreso();
    cargarUserProgress();
  }, [paginaActual, busquedaDebounce, orden]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounce(busqueda);
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    if (
      conversacionSeleccionada?.tipo === "contacto" &&
      conversacionSeleccionada?.ejercicio?.opciones?.length === 0 &&
      conversacionSeleccionada?.what_to_say
    ) {
      const generarOpciones = async () => {
        setCargandoOpciones(true);

        const [wrong1, wrong2] = await generarOpcionesConIA(
          conversacionSeleccionada.what_to_say,
          conversacionSeleccionada.escenario,
        );

        const nuevasOpciones = [
          { texto: conversacionSeleccionada.what_to_say, correcta: true },
          { texto: wrong1, correcta: false },
          { texto: wrong2, correcta: false },
        ].sort(() => Math.random() - 0.5);

        setConversacionSeleccionada((prev) => ({
          ...prev,
          ejercicio: { ...prev.ejercicio, opciones: nuevasOpciones },
        }));

        setConversaciones((prev) =>
          prev.map((c) =>
            c.id === conversacionSeleccionada.id
              ? {
                  ...c,
                  ejercicio: { ...c.ejercicio, opciones: nuevasOpciones },
                }
              : c,
          ),
        );

        setCargandoOpciones(false);
      };

      generarOpciones();
    }
  }, [conversacionSeleccionada?.id]);

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

    const idNumerico = Number(
      conversacionSeleccionada?.conversationId ||
        String(conversacionSeleccionada?.id)
          .replace("contact-", "")
          .replace("normal-", "")
          .replace("ia-", ""),
    );

    if (!idNumerico) {
      console.error("Conversación sin ID válido:", conversacionSeleccionada);
      alert("Esta conversación no tiene ID válido. Recarga la página.");
      return;
    }

    const progressKey =
      conversacionSeleccionada.tipo === "contacto"
        ? `contact-${idNumerico}`
        : `normal-${idNumerico}`;

    if (completedConversations.includes(progressKey)) return;

    try {
      const response =
        conversacionSeleccionada.tipo === "contacto"
          ? await completeContactConversation(idNumerico)
          : await completeConversation(idNumerico);

      setNewAchievement(
        response.unlockedAchievements?.[0] || {
          icon: "⭐",
          name: "¡Muy bien!",
          description:
            conversacionSeleccionada.tipo === "contacto"
              ? "Practicaste una conversación personalizada."
              : "Ganaste una estrella por completar la conversación.",
        },
      );

      setCompletedConversations((prev) => [...prev, progressKey]);

      setTimeout(() => setNewAchievement(null), 5000);

      await cargarUserProgress();
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeIA = (e) => {
    setFormIA({ ...formIA, [e.target.name]: e.target.value });
  };

  const handleGenerateConversationIA = async () => {
    if (!formIA.topic.trim() || !formIA.situation.trim()) {
      alert("Debes ingresar tema y situación");
      return;
    }

    try {
      setGenerandoIA(true);

      const data = await generateConversation(formIA);

      const savedConversation = await createConversation({
        title: data.title || formIA.topic,
        situation: formIA.situation,
        what_to_say:
          data.messages.find((msg) => msg.speaker === "Félix")?.text || "",
        reminder: `Conversación generada con IA sobre ${formIA.topic}`,
        messages: data.messages,
        exercise: data.exercise,
      });

      const savedId = Number(savedConversation.conversation.id);

      const nuevaConversacion = {
        id: `normal-${savedId}`,
        conversationId: savedId,
        tipo: "normal",
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

      setConversaciones((prev) => [nuevaConversacion, ...prev]);
      setConversacionSeleccionada(nuevaConversacion);
      setRespuestaSeleccionada(null);
      setPaginaActual(1);

      setFormIA({
        topic: "",
        situation: "",
        person: "",
        emotion: "",
      });

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

  const opcionesNivel2 = (
    conversacionSeleccionada?.ejercicio?.opciones || []
  ).filter((op) => op.texto && op.texto.trim() !== "");

  const handleDeleteConversation = async () => {
    if (!conversacionAEliminar) return;

    try {
      await deleteConversation(conversacionAEliminar.conversationId);

      setConversaciones((prev) =>
        prev.filter((item) => item.id !== conversacionAEliminar.id),
      );

      if (conversacionSeleccionada?.id === conversacionAEliminar.id) {
        setConversacionSeleccionada(null);
        setRespuestaSeleccionada(null);
      }

      setModalEliminar(false);
      setConversacionAEliminar(null);

      await loadConversations();
      await cargarProgreso();
      await cargarUserProgress();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar conversación");
    }
  };

  const abrirEditor = (conversation) => {
    const mensajeFelix =
      conversation.dialogo?.find((msg) => msg.personaje === "Félix")?.texto ||
      conversation.what_to_say ||
      "";

    const correcta =
      conversation.ejercicio?.opciones?.find((op) => op.correcta)?.texto || "";

    const incorrectas =
      conversation.ejercicio?.opciones?.filter((op) => !op.correcta) || [];

    setFormEditar({
      title: conversation.titulo || "",
      situation: conversation.escenario || "",
      reminder: conversation.habilidad || "",
      messageFelix: mensajeFelix,
      question: conversation.ejercicio?.pregunta || "¿Qué debería decir Félix?",
      correctAnswer: correcta,
      wrongAnswer1: incorrectas[0]?.texto || "",
      wrongAnswer2: incorrectas[1]?.texto || "",
    });

    setConversacionSeleccionada(conversation);
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setFormEditar({
      title: "",
      situation: "",
      reminder: "",
      messageFelix: "",
      question: "",
      correctAnswer: "",
      wrongAnswer1: "",
      wrongAnswer2: "",
    });
  };

  const handleChangeEditar = (e) => {
    setFormEditar({
      ...formEditar,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateConversation = async (e) => {
    e.preventDefault();

    if (!conversacionSeleccionada?.conversationId) {
      alert("No hay conversación seleccionada");
      return;
    }

    try {
      const payload = {
        title: formEditar.title,
        situation: formEditar.situation,
        what_to_say: formEditar.messageFelix,
        reminder: formEditar.reminder,
        messages: [
          {
            speaker: "Félix",
            text: formEditar.messageFelix,
          },
        ],
        exercise: {
          question: formEditar.question,
          options: [
            {
              text: formEditar.correctAnswer,
              isCorrect: true,
            },
            {
              text: formEditar.wrongAnswer1,
              isCorrect: false,
            },
            {
              text: formEditar.wrongAnswer2,
              isCorrect: false,
            },
          ].filter((op) => op.text && op.text.trim() !== ""),
        },
      };

      await updateConversation(
        conversacionSeleccionada.conversationId,
        payload,
      );

      setEditando(false);
      await loadConversations();

      alert("Conversación actualizada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar conversación");
    }
  };

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <AchievementPopup achievement={newAchievement} />
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold text-[#4B367C] mb-3">
              ¿Eliminar conversación?
            </h2>

            <p className="text-[#6B5A95] mb-6">
              Esta acción eliminará "{conversacionAEliminar?.titulo}" y no se
              podrá recuperar.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setModalEliminar(false);
                  setConversacionAEliminar(null);
                }}
                className="bg-white text-[#4B367C] border-2 border-[#DCCCF8] font-bold px-5 py-3 rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeleteConversation}
                className="bg-red-500 text-white font-bold px-5 py-3 rounded-xl hover:bg-red-600"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
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
              {completedConversations.length} de {totalConversaciones}
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
          <div>
            <div className="bg-white rounded-[2rem] p-5 shadow-sm mb-6">
              <input
                id="buscar-conversaciones"
                name="buscar-conversaciones"
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                placeholder="🔍 Buscar por título, situación o persona..."
                className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] text-[#4B367C] font-semibold"
              />
            </div>
            <div className="bg-white rounded-[2rem] p-5 shadow-sm mb-6">
              <select
                id="orden-conversaciones"
                name="orden-conversaciones"
                value={orden}
                onChange={(e) => {
                  setOrden(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] text-[#4B367C] font-semibold focus:outline-none focus:border-[#9B7BE8]"
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {conversaciones.map((item) => {
                const activo = conversacionSeleccionada?.id === item.id;

                const progressKey =
                  item.tipo === "contacto"
                    ? `contact-${item.conversationId}`
                    : `normal-${item.conversationId}`;

                const completada = completedConversations.includes(progressKey);

                return (
                  <motion.div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => seleccionarConversacion(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") seleccionarConversacion(item);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ scale: activo ? 1.03 : 1 }}
                    transition={{ duration: 0.25 }}
                    className={`
                    bg-white rounded-[2rem] p-8 text-left shadow-md transition-all cursor-pointer min-h-[360px] flex flex-col justify-between
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

                    <div className="grid grid-cols-1 gap-2 mt-6">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirEditor(item);
                          }}
                          className="bg-[#E8DDFF] text-[#4B367C] font-bold px-4 py-3 rounded-xl hover:bg-[#DCCCF8]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversacionAEliminar(item);
                            setModalEliminar(true);
                          }}
                          className="bg-red-100 text-red-600 font-bold px-4 py-3 rounded-xl hover:bg-red-200"
                        >
                          Eliminar
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await toggleFavoriteConversation(item.conversationId);
                          await loadConversations();
                        }}
                        className={`font-bold px-4 py-3 rounded-xl w-full ${
                          item.is_favorite
                            ? "bg-[#F2E08A] text-[#6A4D00]"
                            : "bg-[#F7F0B6] text-[#7A5A00] hover:bg-[#F2E08A]"
                        }`}
                      >
                        {item.is_favorite ? "⭐ Favorita" : "☆ Favorita"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPaginas > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() =>
                    setPaginaActual((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={paginaActual === 1}
                  className="px-5 py-3 rounded-xl bg-white text-[#4B367C] font-bold border-2 border-[#DCCCF8] disabled:opacity-40"
                >
                  Anterior
                </button>

                <span className="font-bold text-[#4B367C]">
                  Página {paginaActual} de {totalPaginas}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaActual === totalPaginas}
                  className="px-5 py-3 rounded-xl bg-[#9B7BE8] text-white font-bold disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>

          <div>
            {editando && (
              <div className="bg-white rounded-[2rem] shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-[#4B367C] mb-5">
                  Editar conversación
                </h2>

                <form onSubmit={handleUpdateConversation} className="space-y-4">
                  <input
                    name="title"
                    value={formEditar.title}
                    onChange={handleChangeEditar}
                    placeholder="Título"
                    className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8]"
                  />

                  <textarea
                    name="situation"
                    value={formEditar.situation}
                    onChange={handleChangeEditar}
                    placeholder="Situación"
                    className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8]"
                  />

                  <textarea
                    name="messageFelix"
                    value={formEditar.messageFelix}
                    onChange={handleChangeEditar}
                    placeholder="¿Qué dice Félix?"
                    className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8]"
                  />

                  <input
                    name="question"
                    value={formEditar.question}
                    onChange={handleChangeEditar}
                    placeholder="Pregunta"
                    className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8]"
                  />

                  <input
                    name="correctAnswer"
                    value={formEditar.correctAnswer}
                    onChange={handleChangeEditar}
                    placeholder="Respuesta correcta"
                    className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8]"
                  />

                  <input
                    name="wrongAnswer1"
                    value={formEditar.wrongAnswer1}
                    onChange={handleChangeEditar}
                    placeholder="Respuesta incorrecta 1"
                    className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8]"
                  />

                  <input
                    name="wrongAnswer2"
                    value={formEditar.wrongAnswer2}
                    onChange={handleChangeEditar}
                    placeholder="Respuesta incorrecta 2"
                    className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8]"
                  />

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-[#4B367C] text-white font-bold px-6 py-3 rounded-xl"
                    >
                      Guardar cambios
                    </button>

                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="bg-white text-[#4B367C] border-2 border-[#DCCCF8] font-bold px-6 py-3 rounded-xl"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                    {cargandoOpciones ? (
                      <div className="flex items-center gap-3 bg-[#F3ECFF] rounded-2xl p-5">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-6 h-6 border-4 border-[#9B7BE8] border-t-transparent rounded-full"
                        />

                        <p className="text-[#4B367C] font-semibold">
                          Félix está preparando las opciones...
                        </p>
                      </div>
                    ) : opcionesNivel2.length === 0 ? (
                      <p className="text-[#8A3A3A] bg-[#FFE1E1] rounded-2xl p-4 font-bold">
                        Esta conversación aún no tiene respuestas preparadas.
                      </p>
                    ) : (
                      opcionesNivel2.map((opcion) => {
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
                      })
                    )}
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
        </div>
      </section>
    </main>
  );
};

export default Conversaciones;
