import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import { generateConversation } from "../services/aiService";
import {
  createConversation,
  completeConversation,
  getConversationProgress,
  getPaginatedConversations,
  deleteConversation,
  updateConversation,
  toggleFavoriteConversation,
  createChildConversation,
  completeChildConversation,
  getChildConversationProgress,
  getChildPaginatedConversations,
  deleteChildConversation,
  updateChildConversation,
  toggleFavoriteChildConversation,
} from "../services/conversationService";

import { getUserProgress } from "../services/progressService";
import AchievementPopup from "../components/AchievementPopup";
import {
  completeContactConversation,
  getContactConversationProgress,
  toggleFavoriteContactConversation,
  completeChildContactConversation,
  getChildContactConversationProgress,
  toggleFavoriteChildContactConversation,
} from "../services/contactConversationService";

import felix from "../assets/webp/felix_cara_sonriendo.webp";
import felixRespirando from "../assets/webp/felix_respirando.webp";
import felixFeliz from "../assets/svg/felix_feliz.svg";

import successSound from "../assets/sounds/kid_success.mp3";
import wrongSound from "../assets/sounds/error.mp3";
import { getCachedData, setCachedData } from "../utils/cache";

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

const normalizeBoolean = (value) => {
  return value === true || value === "true" || value === 1 || value === "1";
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
    user,
    points,
    setPoints,
    level,
    setLevel,
    completedConversations,
    setCompletedConversations,
    soundEnabled,
    setSoundEnabled,
  } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
  } = useSelectedChild();

  const { showFeedback, showConfirm } = useFeedback();

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const getFirstName = (name) => {
    return (
      String(name || "")
        .trim()
        .split(" ")[0] || ""
    );
  };

  const getCleanAdultLabel = (personValue) => {
    const raw = String(personValue || "").trim();

    if (!raw) return "Adulto";

    const childFirstName = getFirstName(childName).toLowerCase();
    const childFullName = String(childName || "")
      .trim()
      .toLowerCase();

    const parts = raw
      .split(/,| y /i)
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => {
        const lower = part.toLowerCase();
        return lower !== childFirstName && lower !== childFullName;
      });

    if (parts.length === 0) return "Adulto";
    if (parts.length === 1) return parts[0];

    return parts.join(" y ");
  };

  const normalizeAIGeneratedContent = (data, personValue) => {
    const adultLabel = getCleanAdultLabel(personValue);
    const childLabel = isParentMode
      ? getFirstName(childName)
      : user?.firstName || "el niño/a";

    const cleanText = (text) => {
      return String(text || "")
        .replaceAll("Félix", childLabel)
        .replaceAll("Felix", childLabel)
        .replaceAll("Persona", childLabel);
    };

    const cleanAdultSpeaker = (speaker) => {
      const rawSpeaker = String(speaker || "").trim();
      const lowerSpeaker = rawSpeaker.toLowerCase();

      if (
        !rawSpeaker ||
        lowerSpeaker === "félix" ||
        lowerSpeaker === "felix" ||
        lowerSpeaker === "persona" ||
        lowerSpeaker === "niño" ||
        lowerSpeaker === "niña"
      ) {
        return adultLabel;
      }

      if (lowerSpeaker.includes(childLabel.toLowerCase())) {
        return adultLabel;
      }

      return rawSpeaker;
    };

    const messages = Array.isArray(data.messages)
      ? data.messages.map((msg, index) => ({
          ...msg,
          // Regla fija:
          // pares = adulto, impares = niño/a
          speaker:
            index % 2 === 0 ? cleanAdultSpeaker(msg.speaker) : childLabel,
          text: cleanText(msg.text),
        }))
      : [];

    const exercise = {
      question: cleanText(
        data.exercise?.question || `¿Qué debería decir ${childLabel}?`,
      ),
      options: Array.isArray(data.exercise?.options)
        ? data.exercise.options.map((op) => ({
            ...op,
            text: cleanText(op.text),
          }))
        : [],
    };

    const childAnswer =
      messages.find((msg) => msg.speaker === childLabel)?.text || "";

    return {
      messages,
      exercise,
      childAnswer,
    };
  };

  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] =
    useState(null);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [regenerandoConversationId, setRegenerandoConversationId] =
    useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [cargandoOpciones, setCargandoOpciones] = useState(false);
  const [cargandoPagina, setCargandoPagina] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalConversaciones, setTotalConversaciones] = useState(0);

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

  const editorRef = useRef(null);

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
    try {
      if (!user) return;

      // El progreso general con estrellas/nivel solo lo carga el niño/a.
      // El cuidador no debe llamar /api/progress porque esa ruta es child-only.
      if (isParent) return;

      const progress = await getUserProgress();

      setPoints(Number(progress.points || 0));
      setLevel(Number(progress.level || 1));
    } catch (error) {
      console.error("Error cargando progreso general:", error);
    }
  };

  const cargarProgreso = async () => {
    if (!user) return;

    if (isParent && loadingChildren) return;

    if (isParentWithoutChild) {
      setCompletedConversations([]);
      return;
    }

    const normalProgress = isParentMode
      ? await getChildConversationProgress(selectedChildId)
      : await getConversationProgress();

    const contactProgress = isParentMode
      ? await getChildContactConversationProgress(selectedChildId)
      : await getContactConversationProgress();

    const normalIds = normalProgress.map(
      (item) => `normal-${Number(item.conversation_id)}`,
    );

    const contactIds = contactProgress.map((item) => {
      const progressId =
        item.contact_conversation_id || item.conversation_id || item.id;

      return `contact-${Number(progressId)}`;
    });

    setCompletedConversations([...normalIds, ...contactIds]);
  };

  const loadConversations = async ({
    showFullLoader = true,
    useCache = true,
  } = {}) => {
    try {
      if (!user) return;

      if (isParent && loadingChildren) return;

      const ownerId = isParentMode ? selectedChildId : user.id;
      const searchKey = busquedaDebounce.trim() || "all";
      const cacheKey = `floflo_conversations_${ownerId}_${paginaActual}_${searchKey}_${orden}`;

      if (showFullLoader) {
        const cachedData = useCache ? getCachedData(cacheKey) : null;

        if (cachedData) {
          setConversaciones(
            Array.isArray(cachedData.conversaciones)
              ? cachedData.conversaciones
              : [],
          );

          setTotalPaginas(cachedData.totalPaginas || 1);
          setTotalConversaciones(cachedData.totalConversaciones || 0);

          if (
            Array.isArray(cachedData.conversaciones) &&
            cachedData.conversaciones.length > 0
          ) {
            setConversacionSeleccionada((prev) => {
              if (!prev) return cachedData.conversaciones[0];

              const actualizada = cachedData.conversaciones.find(
                (item) => item.id === prev.id,
              );

              return actualizada || cachedData.conversaciones[0];
            });
          } else {
            setConversacionSeleccionada(null);
          }

          setCargandoPagina(false);
        } else {
          setCargandoPagina(true);
        }
      }

      if (isParentWithoutChild) {
        setConversaciones([]);
        setConversacionSeleccionada(null);
        setTotalPaginas(1);
        setTotalConversaciones(0);
        setCargandoPagina(false);
        return;
      }

      const data = isParentMode
        ? await getChildPaginatedConversations(
            selectedChildId,
            paginaActual,
            conversacionesPorPagina,
            busquedaDebounce,
            orden,
          )
        : await getPaginatedConversations(
            paginaActual,
            conversacionesPorPagina,
            busquedaDebounce,
            orden,
          );
      console.table(
        data.conversations
          .filter((item) => item.tipo === "contacto")
          .map((item) => ({
            id: item.id,
            title: item.title,
            tipo: item.tipo,
            managed_by_parent: item.managed_by_parent,
            managedByParent: item.managedByParent,
            tipoManagedSnake: typeof item.managed_by_parent,
            tipoManagedCamel: typeof item.managedByParent,
          })),
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
          user_id: item.user_id,
          user_contact_id: item.user_contact_id,
          titulo: item.title,
          emoji: esContacto ? "✨" : getEmojiByTitle(item.title),
          escenario: item.situation,
          habilidad: item.reminder || "Conversación personalizada",
          what_to_say: item.what_to_say,
          correct_answer: item.correct_answer,
          wrong_answer_1: item.wrong_answer_1,
          wrong_answer_2: item.wrong_answer_2,
          is_favorite: item.is_favorite || false,
          managed_by_parent: normalizeBoolean(
            item.managed_by_parent ?? item.managedByParent,
          ),
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
      setTotalPaginas(data.totalPages || 1);
      setTotalConversaciones(data.total || 0);

      setCachedData(cacheKey, {
        conversaciones: conversacionesMapeadas,
        totalPaginas: data.totalPages || 1,
        totalConversaciones: data.total || 0,
      });

      if (conversacionesMapeadas.length > 0) {
        setConversacionSeleccionada((prev) => {
          if (!prev) return conversacionesMapeadas[0];

          const actualizada = conversacionesMapeadas.find(
            (item) => item.id === prev.id,
          );

          return actualizada || conversacionesMapeadas[0];
        });
      } else {
        setConversacionSeleccionada(null);
      }
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar las conversaciones",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    } finally {
      if (showFullLoader) {
        setCargandoPagina(false);
      }
    }
  };

  useEffect(() => {
    loadConversations();
    cargarProgreso();
    cargarUserProgress();
  }, [
    user?.id,
    user?.role,
    paginaActual,
    busquedaDebounce,
    orden,
    selectedChildId,
    loadingChildren,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounce(busqueda);
      setPaginaActual(1);
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
    totalConversaciones > 0
      ? Math.min(
          (completedConversations.length / totalConversaciones) * 100,
          100,
        )
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

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "Conversación inválida",
        message: "Esta conversación no tiene un ID válido. Recarga la página.",
      });

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
          ? isParentMode
            ? await completeChildContactConversation(
                selectedChildId,
                idNumerico,
              )
            : await completeContactConversation(idNumerico)
          : isParentMode
            ? await completeChildConversation(selectedChildId, idNumerico)
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

      await cargarProgreso();
      await cargarUserProgress();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo completar",
        message:
          error.response?.data?.message ||
          "No se pudo guardar el avance de esta conversación.",
      });
    }
  };

  const handleChangeIA = (e) => {
    setFormIA({ ...formIA, [e.target.name]: e.target.value });
  };

  const handleGenerateConversationIA = async () => {
    if (!formIA.topic.trim() || !formIA.situation.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Tema y situación obligatorios",
        message:
          "Debes ingresar un tema y una situación para que Félix genere la conversación.",
      });
      return;
    }

    try {
      setGenerandoIA(true);

      const adultLabel = getCleanAdultLabel(formIA.person);
      const childLabel = isParentMode
        ? getFirstName(childName)
        : user?.firstName || "el niño/a";

      const data = await generateConversation({
        ...formIA,
        person: adultLabel,
        situation: `${formIA.situation}. La conversación debe ser entre ${adultLabel} y ${childLabel}. ${adultLabel} debe hablarle directamente a ${childLabel}. ${childLabel} debe responder en primera persona.`,
      });

      const normalizedContent = normalizeAIGeneratedContent(
        data,
        formIA.person,
      );

      const payload = {
        title: data.title || formIA.topic,
        situation: formIA.situation,
        what_to_say: normalizedContent.childAnswer,
        reminder: `Conversación generada con IA sobre ${formIA.topic}`,
        messages: normalizedContent.messages,
        exercise: normalizedContent.exercise,
      };

      const savedConversation = isParentMode
        ? await createChildConversation(selectedChildId, payload)
        : await createConversation(payload);

      const savedId = Number(savedConversation.conversation.id);

      const nuevaConversacion = {
        id: `normal-${savedId}`,
        conversationId: savedId,
        tipo: "normal",
        user_id: savedConversation.conversation.user_id,
        titulo: data.title || formIA.topic,
        emoji: "✨",
        escenario: formIA.situation,
        habilidad: `Conversación generada con IA sobre ${formIA.topic}`,
        managed_by_parent: isParentMode,
        dialogo: normalizedContent.messages.map((msg) => ({
          personaje: msg.speaker,
          texto: msg.text,
        })),
        ejercicio: {
          pregunta: normalizedContent.exercise.question,
          opciones: normalizedContent.exercise.options.map((op) => ({
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

      showFeedback({
        type: "success",
        icon: "✨",
        label: "Conversación generada",
        title: "Félix creó una conversación",
        message: isParentMode
          ? `La conversación fue guardada para ${childName}.`
          : "Ya puedes practicarla o editarla si quieres ajustarla.",
      });

      await loadConversations({ useCache: false });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo generar",
        message:
          error.response?.data?.message ||
          "Félix no pudo generar la conversación. Intenta nuevamente.",
      });
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

  const handleRegenerateConversation = async (conversation) => {
    if (!conversation) return;
    if (conversation.tipo === "contacto") {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Conversación de contacto",
        title: "Regénérala desde Amigos",
        message:
          "Esta conversación pertenece a un contacto. Puedes regenerarla desde el módulo Amigos.",
      });
      return;
    }

    if (!conversation.conversationId) {
      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "Conversación inválida",
        message: "No se encontró el ID de esta conversación.",
      });
      return;
    }

    try {
      setRegenerandoConversationId(conversation.id);

      const adultLabel = "Adulto";
      const childLabel = isParentMode
        ? getFirstName(childName)
        : user?.firstName || "el niño/a";

      const data = await generateConversation({
        topic: conversation.titulo || "Conversación social",
        situation: `${conversation.escenario}. La conversación debe ser entre ${adultLabel} y ${childLabel}. ${adultLabel} debe hacer preguntas o apoyar. ${childLabel} debe responder en primera persona. No uses el nombre Félix. No uses el hablante Persona.`,
        person: adultLabel,
        emotion: "",
      });

      const normalizedContent = normalizeAIGeneratedContent(data, adultLabel);

      const payload = {
        title: data.title || conversation.titulo,
        situation: conversation.escenario,
        what_to_say: normalizedContent.childAnswer,
        reminder:
          conversation.habilidad ||
          `Conversación regenerada con IA sobre ${conversation.titulo}`,
        messages: normalizedContent.messages,
        exercise: normalizedContent.exercise,
      };
      if (isParentMode) {
        await updateChildConversation(
          selectedChildId,
          conversation.conversationId,
          payload,
        );
      } else {
        await updateConversation(conversation.conversationId, payload);
      }

      const regeneratedConversation = {
        ...conversation,
        titulo: payload.title,
        escenario: payload.situation,
        habilidad: payload.reminder,
        what_to_say: payload.what_to_say,
        dialogo: normalizedContent.messages.map((msg) => ({
          personaje: msg.speaker,
          texto: msg.text,
        })),
        ejercicio: {
          pregunta: normalizedContent.exercise.question,
          opciones: normalizedContent.exercise.options.map((op) => ({
            texto: op.text,
            correcta: op.isCorrect,
          })),
        },
      };

      setPaginaActual(1);

      await loadConversations({ useCache: false });

      setConversaciones((prev) => [
        regeneratedConversation,
        ...prev.filter((item) => item.id !== conversation.id),
      ]);

      setConversacionSeleccionada(regeneratedConversation);
      setRespuestaSeleccionada(null);

      showFeedback({
        type: "success",
        icon: "✨",
        label: "Conversación regenerada",
        title: "Félix actualizó la conversación",
        message: isParentMode
          ? `La conversación fue regenerada para ${childName}.`
          : "La conversación fue regenerada correctamente.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo regenerar",
        message:
          error.response?.data?.message ||
          "Félix no pudo regenerar la conversación. Intenta nuevamente.",
      });
    } finally {
      setRegenerandoConversationId(null);
    }
  };

  const handleDeleteConversation = async (conversation) => {
    if (!conversation) return;

    if (conversation.tipo === "contacto") {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Conversación de contacto",
        title: "Elimínala desde Amigos",
        message:
          "Esta conversación pertenece a un contacto. Puedes eliminarla o editarla desde el módulo Amigos.",
      });
      return;
    }

    const confirmed = await showConfirm({
      type: "danger",
      icon: "🗑️",
      label: "Eliminar conversación",
      title: "¿Eliminar conversación?",
      message: isParentMode
        ? `Esta acción eliminará "${conversation.titulo}" del perfil de ${childName} y no se podrá recuperar.`
        : `Esta acción eliminará "${conversation.titulo}" y no se podrá recuperar.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      if (isParentMode) {
        await deleteChildConversation(
          selectedChildId,
          conversation.conversationId,
        );
      } else {
        await deleteConversation(conversation.conversationId);
      }

      setConversaciones((prev) =>
        prev.filter((item) => item.id !== conversation.id),
      );

      if (conversacionSeleccionada?.id === conversation.id) {
        setConversacionSeleccionada(null);
        setRespuestaSeleccionada(null);
      }

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Conversación eliminada",
        title: "Eliminada correctamente",
        message: isParentMode
          ? `La conversación fue eliminada para ${childName}.`
          : "La conversación fue eliminada de FloFlo.",
      });

      await loadConversations({ useCache: false });
      await cargarProgreso();
      await cargarUserProgress();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo eliminar",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const abrirEditor = (conversation) => {
    if (conversation.tipo === "contacto") {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Conversación de contacto",
        title: "Edítala desde Amigos",
        message:
          "Esta conversación pertenece a un contacto. Puedes editarla desde el módulo Amigos.",
      });
      return;
    }

    const mensajeFelix =
      conversation.what_to_say ||
      conversation.dialogo?.find((msg) => msg.personaje === "Félix")?.texto ||
      "";

    const correcta =
      conversation.correct_answer ||
      conversation.ejercicio?.opciones?.find((op) => op.correcta)?.texto ||
      "";

    const incorrectas =
      conversation.ejercicio?.opciones?.filter((op) => !op.correcta) || [];

    setFormEditar({
      title: conversation.titulo || "",
      situation: conversation.escenario || "",
      reminder: conversation.habilidad || "",
      messageFelix: mensajeFelix,
      question: conversation.ejercicio?.pregunta || "¿Qué debería decir Félix?",
      correctAnswer: correcta,
      wrongAnswer1: conversation.wrong_answer_1 || incorrectas[0]?.texto || "",
      wrongAnswer2: conversation.wrong_answer_2 || incorrectas[1]?.texto || "",
    });

    setConversacionSeleccionada(conversation);
    setRespuestaSeleccionada(null);
    setEditando(true);

    setTimeout(() => {
      editorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
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
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta selección",
        title: "No hay conversación seleccionada",
        message: "Selecciona una conversación antes de guardar cambios.",
      });
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

      if (isParentMode) {
        await updateChildConversation(
          selectedChildId,
          conversacionSeleccionada.conversationId,
          payload,
        );
      } else {
        await updateConversation(
          conversacionSeleccionada.conversationId,
          payload,
        );
      }

      setEditando(false);
      await loadConversations({ useCache: false });

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Cambios guardados",
        title: "Conversación actualizada",
        message: isParentMode
          ? `Los cambios de la conversación de ${childName} se guardaron correctamente.`
          : "Los cambios de la conversación se guardaron correctamente.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo actualizar",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const handleToggleFavorite = async (item) => {
    try {
      const nuevoEstadoFavorito = !item.is_favorite;

      setConversaciones((prev) =>
        prev.map((conversation) =>
          conversation.id === item.id
            ? {
                ...conversation,
                is_favorite: nuevoEstadoFavorito,
              }
            : conversation,
        ),
      );

      setConversacionSeleccionada((prev) =>
        prev?.id === item.id
          ? {
              ...prev,
              is_favorite: nuevoEstadoFavorito,
            }
          : prev,
      );

      if (item.tipo === "contacto") {
        if (isParentMode) {
          await toggleFavoriteChildContactConversation(
            selectedChildId,
            item.conversationId,
          );
        } else {
          await toggleFavoriteContactConversation(item.conversationId);
        }
      } else if (isParentMode) {
        await toggleFavoriteChildConversation(
          selectedChildId,
          item.conversationId,
        );
      } else {
        await toggleFavoriteConversation(item.conversationId);
      }

      await loadConversations({
        showFullLoader: false,
        useCache: false,
      });
    } catch (error) {
      console.error(error);

      setConversaciones((prev) =>
        prev.map((conversation) =>
          conversation.id === item.id
            ? {
                ...conversation,
                is_favorite: item.is_favorite,
              }
            : conversation,
        ),
      );

      setConversacionSeleccionada((prev) =>
        prev?.id === item.id
          ? {
              ...prev,
              is_favorite: item.is_favorite,
            }
          : prev,
      );

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo actualizar favorito",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    }
  };

  if (loadingChildren || cargandoPagina) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-6 py-10">
        <p className="text-2xl font-bold text-[#4B367C]">
          Cargando conversaciones...
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
            Para gestionar conversaciones como cuidador, primero debes
            seleccionar un niño/a activo.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <AchievementPopup achievement={newAchievement} />

      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h1 className="mb-3 text-4xl font-extrabold text-[#4B367C] md:text-6xl">
              Conversaciones
            </h1>

            <p className="text-lg text-[#6B5A95] md:text-xl">
              {isParentMode
                ? `Practica y gestiona situaciones simples para ${childName}.`
                : "Practica situaciones simples con Félix."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isParentMode ? (
              <div className="rounded-full bg-[#EAF8EF] px-6 py-3 font-bold text-[#2F6B4F] shadow-sm">
                👨‍👩‍👧 Modo cuidador · {childName}
              </div>
            ) : (
              <div className="rounded-full bg-[#FFF3C4] px-5 py-3 font-bold text-[#5C4A00] shadow-sm">
                <div className="flex gap-4">
                  <div className="rounded-full bg-yellow-100 px-6 py-3 shadow">
                    ⭐ {points} Estrellas
                  </div>

                  <div className="rounded-full bg-purple-100 px-6 py-3 shadow">
                    🏆 Nivel {level}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-full bg-white px-5 py-3 font-bold text-[#4B367C] shadow-sm"
            >
              {soundEnabled ? "🔊 Sonido" : "🔇 Silencio"}
            </button>
          </div>
        </div>

        {isParentMode && (
          <div className="mb-10 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
            <p className="font-bold text-[#2F6B4F]">Modo cuidador activo</p>
            <p className="mt-1 text-[#2F6B4F]">
              Estás viendo, creando y editando conversaciones del niño/a
              seleccionado: {childName}.
            </p>
          </div>
        )}

        <div className="mb-10 rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="mb-3 flex justify-between">
            <p className="font-bold text-[#4B367C]">Progreso</p>
            <p className="text-[#6B5A95]">
              {completedConversations.length} de {totalConversaciones}
            </p>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-[#E8DDFF]">
            <motion.div
              className="h-full rounded-full bg-[#9B7BE8]"
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="mb-10 rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-[#4B367C]">
            ✨ Crear conversación con Félix
          </h2>

          <p className="mb-5 text-[#6B5A95]">
            {isParentMode
              ? `Escribe una situación y Félix generará una conversación para ${childName}.`
              : "Escribe una situación y Félix generará una conversación para practicar."}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              name="topic"
              value={formIA.topic}
              onChange={handleChangeIA}
              placeholder="Tema: Pedir ayuda"
              className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
            />

            <input
              name="situation"
              value={formIA.situation}
              onChange={handleChangeIA}
              placeholder="Situación"
              className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
            />

            <input
              name="person"
              value={formIA.person}
              onChange={handleChangeIA}
              placeholder="Persona que habla: Mamá"
              className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
            />

            <input
              name="emotion"
              value={formIA.emotion}
              onChange={handleChangeIA}
              placeholder="Emoción: Nervioso"
              className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateConversationIA}
            disabled={generandoIA}
            className="mt-5 rounded-full bg-[#4B367C] px-6 py-3 font-bold text-white hover:bg-[#3E2E68] disabled:opacity-50"
          >
            {generandoIA
              ? "Félix está pensando..."
              : "✨ Generar conversación con Félix"}
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.9fr_1.4fr]">
          <div>
            <div className="mb-6 rounded-[2rem] bg-white p-5 shadow-sm">
              <input
                id="buscar-conversaciones"
                name="buscar-conversaciones"
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar por título, situación o persona..."
                className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 font-semibold text-[#4B367C] focus:border-[#9B7BE8] focus:outline-none"
              />
            </div>

            <div className="mb-6 rounded-[2rem] bg-white p-5 shadow-sm">
              <select
                id="orden-conversaciones"
                name="orden-conversaciones"
                value={orden}
                onChange={(e) => {
                  setOrden(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 font-semibold text-[#4B367C] focus:border-[#9B7BE8] focus:outline-none"
              >
                <option value="favoritas">Favoritas primero</option>
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {conversaciones.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-8 text-center shadow-md">
                  <p className="font-bold text-[#4B367C]">
                    Aún no hay conversaciones.
                  </p>
                  <p className="mt-2 text-[#6B5A95]">
                    Puedes crear una conversación con Félix desde el formulario.
                  </p>
                </div>
              ) : (
                conversaciones.map((item) => {
                  const activo = conversacionSeleccionada?.id === item.id;

                  const progressKey =
                    item.tipo === "contacto"
                      ? `contact-${item.conversationId}`
                      : `normal-${item.conversationId}`;

                  const completada =
                    completedConversations.includes(progressKey);

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
                        flex min-h-[360px] cursor-pointer flex-col justify-between rounded-[2rem] bg-white p-8 text-left shadow-md transition-all
                        ${
                          activo
                            ? "ring-4 ring-[#9B7BE8]"
                            : "ring-2 ring-transparent"
                        }
                      `}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-4xl">{item.emoji}</span>

                        <div className="flex flex-col items-end gap-2">
                          {item.tipo === "contacto" && (
                            <>
                              <span
                                className={`rounded-full px-3 py-1 text-sm font-bold ${
                                  item.managed_by_parent
                                    ? "bg-[#EAF8EF] text-[#2F6B4F]"
                                    : "bg-[#FFF3C4] text-[#5C4A00]"
                                }`}
                              >
                                {item.managed_by_parent ? "Cuidador" : "Niño"}
                              </span>

                              <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-sm font-bold text-[#6B4FC3]">
                                👥 Desde Amigos
                              </span>
                            </>
                          )}

                          {completada && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                              Hecho
                            </span>
                          )}
                        </div>
                      </div>

                      <h2 className="mb-2 text-2xl font-bold text-[#4B367C]">
                        {item.titulo}
                      </h2>

                      <p className="text-base text-[#6B5A95]">
                        {item.escenario}
                      </p>

                      <div className="mt-6 grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegenerateConversation(item);
                            }}
                            disabled={regenerandoConversationId === item.id}
                            className="rounded-xl bg-[#E8DDFF] px-4 py-3 font-bold text-[#4B367C] hover:bg-[#DCCCF8] disabled:opacity-50"
                          >
                            {regenerandoConversationId === item.id
                              ? "Regenerando..."
                              : "✨ Regenerar"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(item);
                            }}
                            className="rounded-xl bg-red-100 px-4 py-3 font-bold text-red-600 hover:bg-red-200"
                          >
                            Eliminar
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item);
                          }}
                          className={`w-full rounded-xl px-4 py-3 font-bold ${
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
                })
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPaginaActual((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={paginaActual === 1}
                  className="rounded-xl border-2 border-[#DCCCF8] bg-white px-5 py-3 font-bold text-[#4B367C] disabled:opacity-40"
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
                  className="rounded-xl bg-[#9B7BE8] px-5 py-3 font-bold text-white disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>

          <div>
            {editando && (
              <div
                ref={editorRef}
                className="mb-8 rounded-[2rem] bg-white p-6 shadow-lg"
              >
                <h2 className="mb-5 text-2xl font-bold text-[#4B367C]">
                  Editar conversación
                </h2>

                <form onSubmit={handleUpdateConversation} className="space-y-4">
                  <input
                    name="title"
                    value={formEditar.title}
                    onChange={handleChangeEditar}
                    placeholder="Título"
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4"
                  />

                  <textarea
                    name="situation"
                    value={formEditar.situation}
                    onChange={handleChangeEditar}
                    placeholder="Situación"
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4"
                  />

                  <textarea
                    name="messageFelix"
                    value={formEditar.messageFelix}
                    onChange={handleChangeEditar}
                    placeholder="¿Qué dice Félix?"
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4"
                  />

                  <input
                    name="question"
                    value={formEditar.question}
                    onChange={handleChangeEditar}
                    placeholder="Pregunta"
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4"
                  />

                  <input
                    name="correctAnswer"
                    value={formEditar.correctAnswer}
                    onChange={handleChangeEditar}
                    placeholder="Respuesta correcta"
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4"
                  />

                  <input
                    name="wrongAnswer1"
                    value={formEditar.wrongAnswer1}
                    onChange={handleChangeEditar}
                    placeholder="Respuesta incorrecta 1"
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4"
                  />

                  <input
                    name="wrongAnswer2"
                    value={formEditar.wrongAnswer2}
                    onChange={handleChangeEditar}
                    placeholder="Respuesta incorrecta 2"
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4"
                  />

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="rounded-xl bg-[#4B367C] px-6 py-3 font-bold text-white"
                    >
                      Guardar cambios
                    </button>

                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="rounded-xl border-2 border-[#DCCCF8] bg-white px-6 py-3 font-bold text-[#4B367C]"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {conversacionSeleccionada && (
              <div className="rounded-[2.5rem] bg-white p-8 shadow-lg md:p-10">
                <div className="mb-8 flex flex-col items-center gap-6 md:flex-row">
                  <motion.img
                    key={felixActual}
                    src={felixActual}
                    alt="Félix acompañando"
                    className="h-36 w-36 object-contain md:h-44 md:w-44"
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-[#4B367C] md:text-4xl">
                      {conversacionSeleccionada.titulo}
                    </h2>

                    <p className="mt-2 text-[#6B5A95]">
                      {conversacionSeleccionada.habilidad}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {conversacionSeleccionada.dialogo
                    .filter((linea) => linea.texto)
                    .map((linea, index) => {
                      const activeChildLabel = isParentMode
                        ? getFirstName(childName)
                        : user?.firstName || "el niño/a";

                      const rawSpeaker = String(linea.personaje || "").trim();
                      const speakerLower = rawSpeaker.toLowerCase();
                      const childLower = activeChildLabel.toLowerCase();

                      const isGeneratedByAI = String(
                        conversacionSeleccionada.habilidad || "",
                      )
                        .toLowerCase()
                        .includes("ia");

                      const esNino =
                        speakerLower === childLower ||
                        speakerLower === "persona" ||
                        speakerLower === "niño" ||
                        speakerLower === "niña" ||
                        (isGeneratedByAI && index % 2 === 1);

                      const displaySpeaker = esNino
                        ? activeChildLabel
                        : rawSpeaker &&
                            rawSpeaker.toLowerCase() !== "félix" &&
                            rawSpeaker.toLowerCase() !== "felix" &&
                            rawSpeaker.toLowerCase() !== "persona"
                          ? rawSpeaker
                          : "Adulto";

                      const displayText = String(linea.texto || "")
                        .replaceAll("Félix", activeChildLabel)
                        .replaceAll("Felix", activeChildLabel)
                        .replaceAll("Persona", activeChildLabel);

                      return (
                        <motion.div
                          key={`${displaySpeaker}-${index}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className={`flex w-full ${esNino ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`
                              max-w-[85%] rounded-[1.5rem] px-6 py-4 shadow-sm
                              ${
                                esNino
                                  ? "bg-[#FFF3C4] text-[#5C4A00]"
                                  : "bg-[#E8DDFF] text-[#4B367C]"
                              }
                            `}
                          >
                            <p className="mb-1 font-bold">{displaySpeaker}</p>
                            <p className="text-xl">{displayText}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>

                <div className="mt-8 rounded-[2rem] bg-[#F3ECFF] p-6">
                  <p className="mb-2 font-bold text-[#4B367C]">Escenario:</p>
                  <p className="text-[#6B5A95]">
                    {conversacionSeleccionada.escenario}
                  </p>
                </div>

                <div className="mt-8 rounded-[2rem] border-2 border-[#E4D8FF] bg-[#FDFBFF] p-6">
                  <p className="mb-2 text-sm font-bold text-[#9B7BE8]">
                    Nivel 2 · Elige la respuesta correcta
                  </p>

                  <h3 className="mb-5 text-2xl font-bold text-[#4B367C]">
                    {conversacionSeleccionada.ejercicio.pregunta}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {cargandoOpciones ? (
                      <div className="flex items-center gap-3 rounded-2xl bg-[#F3ECFF] p-5">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="h-6 w-6 rounded-full border-4 border-[#9B7BE8] border-t-transparent"
                        />

                        <p className="font-semibold text-[#4B367C]">
                          Félix está preparando las opciones...
                        </p>
                      </div>
                    ) : opcionesNivel2.length === 0 ? (
                      <p className="rounded-2xl bg-[#FFE1E1] p-4 font-bold text-[#8A3A3A]">
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
                              w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition-all
                              ${
                                seleccionada && opcion.correcta
                                  ? "border-green-400 bg-green-100 text-green-800"
                                  : seleccionada && !opcion.correcta
                                    ? "border-[#F2A3A3] bg-[#FFE1E1] text-[#8A3A3A]"
                                    : "border-[#DCCCF8] bg-white text-[#4B367C] hover:border-[#9B7BE8]"
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
                        mt-6 rounded-2xl p-5 text-lg font-bold
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
