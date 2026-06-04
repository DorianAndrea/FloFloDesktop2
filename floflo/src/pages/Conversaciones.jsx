import { useState } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import { useFloFlo } from "../context/FloFloContext";

import felix from "../assets/svg/felix_cara_sonriendo.svg";
import felixFeliz from "../assets/svg/felix_feliz.svg";
import felixRespirando from "../assets/svg/felix_respirando.svg";

import successSound from "../assets/sounds/kid_success.mp3";
import wrongSound from "../assets/sounds/error.mp3";

const conversaciones = [
  {
    id: 1,
    titulo: "Saludar",
    emoji: "👋",
    escenario: "Félix encuentra a un amigo.",
    habilidad: "Saludo y contacto social básico.",
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
  {
    id: 2,
    titulo: "Pedir ayuda",
    emoji: "🙋",
    escenario: "Félix no puede abrir una caja.",
    habilidad: "Solicitar apoyo.",
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
  {
    id: 3,
    titulo: "Expresar emociones",
    emoji: "💬",
    escenario: "Félix se siente triste.",
    habilidad: "Comunicación emocional.",
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
  {
    id: 4,
    titulo: "Ir al médico",
    emoji: "🩺",
    escenario: "Félix llega al centro médico.",
    habilidad: "Anticipación y comprensión.",
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
  {
    id: 5,
    titulo: "Jugar",
    emoji: "🧸",
    escenario: "Félix está en el parque.",
    habilidad: "Integración social.",
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
   {
    id: 6,
    titulo: "Cumpleaños",
    emoji: "🎂",
    escenario: "Félix va por primera vez a un cumpleaños.",
    habilidad: "Integración social.",
    dialogo: [
      { personaje: "Félix", texto: "¿Donde vamos?" },
      { personaje: "Mamá", texto: "A un cumpleaños." },
      { personaje: "Félix", texto: "¿Quién estará?." },
      { personaje: "Mamá", texto: "Tus amigos." },
      { personaje: "Félix", texto: "¿Quién haré?." },
      { personaje: "Mamá", texto: "Saltarás y jugarás con tus amigos!." },
    ],
    ejercicio: {
      pregunta: "¿Qué puede decir Félix cuando llegue al cumpleaños?",
      opciones: [
        { texto: "Quiero lavarme los dientes.", correcta: false },
        { texto: "Tengo frío.", correcta: false },
        { texto: "Hola, aquí está tu regalo", correcta: true },
      ],
    },
  },
];

const Conversaciones = () => {
  const {
    points,
    setPoints,
    completedConversations,
    setCompletedConversations,
    soundEnabled,
    setSoundEnabled,
  } = useFloFlo();

  const [conversacionSeleccionada, setConversacionSeleccionada] = useState(
    conversaciones[0]
  );
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);

  const [playSuccess] = useSound(successSound, { volume: 0.45 });
  const [playWrongSound] = useSound(wrongSound, { volume: 0.35 });

  const progreso =
    (completedConversations.length / conversaciones.length) * 100;

  const seleccionarConversacion = (conversacion) => {
    setConversacionSeleccionada(conversacion);
    setRespuestaSeleccionada(null);
  };

  const seleccionarRespuesta = (opcion) => {
    setRespuestaSeleccionada(opcion);

    if (opcion.correcta) {
      if (soundEnabled) {
        playSuccess();
      }

      if (!completedConversations.includes(conversacionSeleccionada.id)) {
        setCompletedConversations([
          ...completedConversations,
          conversacionSeleccionada.id,
        ]);

        setPoints(points + 1);
      }
    } else {
      if (soundEnabled) {
        playWrongSound();
      }
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
              ⭐ {points} puntos
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

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr] gap-10 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {conversaciones.map((item) => {
              const activo = conversacionSeleccionada.id === item.id;
              const completada = completedConversations.includes(item.id);

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
                    bg-white rounded-[2rem] p-6 text-left shadow-md
                    transition-all
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

                  <p className="text-[#6B5A95] text-base">
                    {item.escenario}
                  </p>
                </motion.button>
              );
            })}
          </div>

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
        </div>
      </section>
    </main>
  );
};

export default Conversaciones;