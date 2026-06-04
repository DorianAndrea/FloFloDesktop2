import { useState } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import { useFloFlo } from "../context/FloFloContext";


import feliz from "../assets/svg/felix_cara_sonriendo.svg";
import sorprendido from "../assets/svg/felix_cara_sorprendido.svg";
import triste from "../assets/svg/felix_cara_triste_animado.svg";
import enojado from "../assets/svg/felix_enojado_animado.svg";
import felixFeliz from "../assets/svg/felix_feliz.svg";
import felixRespirando from "../assets/svg/felix_respirando.svg";
import felix_asustado from "../assets/svg/felix_asustado_animado_real.svg";

import sparkle from "../assets/sounds/sparkle.mp3";
// import sonidoSorprendido from "../assets/sounds/sorprendido.mp3";
// import sonidoTriste from "../assets/sounds/triste.mp3";
// import sonidoEnojado from "../assets/sounds/enojado.mp3";

const EstadosAnimo = () => {
  const { mood, setMood } = useFloFlo();
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);

  const [playSparkle] = useSound(sparkle, { volume: 0.5 });
  // const [playSorprendido] = useSound(sonidoSorprendido, { volume: 0.5 });
  // const [playTriste] = useSound(sonidoTriste, { volume: 0.4 });
  // const [playEnojado] = useSound(sonidoEnojado, { volume: 0.4 });

  const estados = [
    {
      nombre: "Feliz",
      valor: "feliz",
      imagen: feliz,
      mensaje: "Qué bueno que te sientes feliz hoy.",
      sonido: playSparkle,
    },
    {
      nombre: "Asustado",
      valor: "asustado",
      imagen: felix_asustado,
      mensaje: "¡Vaya! Parece que algo te asustó.",
      //sonido: playAsustado,
    },
    {
      nombre: "Triste",
      valor: "triste",
      imagen: triste,
      mensaje: "Veo que estás triste. ¿Quieres respirar conmigo?",
      //sonido: playTriste,
    },
    {
      nombre: "Enojado",
      valor: "enojado",
      imagen: enojado,
      mensaje: "Respiremos juntos para calmarnos.",
      //sonido: playEnojado,
    },
  ];

  const seleccionarEstado = (estado) => {
    setEstadoSeleccionado(estado.valor);
    setMood(estado.valor);

    if (estado.sonido) {
      estado.sonido();
    }
  };

  const estadoActual = estados.find(
    (estado) => estado.valor === estadoSeleccionado,
  );

  const felixGuia =
    estadoSeleccionado === "feliz" ? felixFeliz : felixRespirando;

  return (
    <main className="min-h-screen bg-[#F3ECFF] flex flex-col items-center px-6 py-10">
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
      </section>
    </main>
  );
};

export default EstadosAnimo;
