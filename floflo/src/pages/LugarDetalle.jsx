import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";

import felix from "../assets/svg/felix_respirando.svg";

const lugares = [
  {
    id: 1,
    nombre: "Médico",
    emoji: "🩺",
    imagen: null,
    direccion: "Centro médico cercano",
    descripcion: "Es un lugar donde revisan nuestra salud.",
    actividad: "El doctor nos revisará unos minutos.",
    personas: "Mamá, Félix y el doctor.",
    transporte: "Automóvil",
    duracion: "30 minutos",
    consejos: "Puedes llevar tu juguete favorito.",
    pasos: [
      "Vamos a salir de casa.",
      "Iremos en automóvil.",
      "Llegaremos al médico.",
      "El doctor nos saludará.",
      "La revisión durará unos minutos.",
      "Luego volveremos a casa.",
    ],
  },
  {
    id: 2,
    nombre: "Colegio",
    emoji: "🏫",
    imagen: null,
    direccion: "Colegio",
    descripcion: "Es un lugar donde aprendemos y compartimos.",
    actividad: "Entraremos a clases y haremos actividades.",
    personas: "Profesora, compañeros y Félix.",
    transporte: "Automóvil o bus escolar",
    duracion: "Media jornada",
    consejos: "Puedes llevar tu mochila y tu colación.",
    pasos: [
      "Vamos a preparar la mochila.",
      "Saldremos de casa.",
      "Iremos al colegio.",
      "La profesora nos saludará.",
      "Haremos actividades en la sala.",
      "Luego volveremos a casa.",
    ],
  },
  {
    id: 3,
    nombre: "Parque",
    emoji: "🌳",
    imagen: null,
    direccion: "Parque cercano",
    descripcion: "Es un lugar para caminar, jugar y descansar.",
    actividad: "Podremos caminar, mirar árboles o jugar.",
    personas: "Familia, otros niños y Félix.",
    transporte: "Caminando o en automóvil",
    duracion: "1 hora",
    consejos: "Puedes llevar agua y usar bloqueador.",
    pasos: [
      "Vamos a salir de casa.",
      "Iremos al parque.",
      "Veremos árboles y juegos.",
      "Podremos caminar o jugar.",
      "Descansaremos si lo necesitas.",
      "Luego volveremos a casa.",
    ],
  },
];

const LugarDetalle = () => {
  const { id } = useParams();

  const lugarDemo = lugares.find((lugar) => lugar.id === Number(id));

  const [modoPreparacion, setModoPreparacion] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);

  const siguientePaso = () => {
    if (pasoActual < lugarDemo.pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    }
  };

  const anteriorPaso = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  if (modoPreparacion) {
    return (
      <main className="min-h-screen bg-[#F3ECFF] flex items-center justify-center px-6 py-10">
        <section className="bg-white rounded-[2.5rem] shadow-lg p-8 max-w-3xl w-full text-center">
          <p className="text-[#9B7BE8] font-bold mb-4">
            Paso {pasoActual + 1} de {lugarDemo.pasos.length}
          </p>

          <motion.img
            src={felix}
            alt="Félix acompañando"
            className="w-52 h-52 object-contain mx-auto mb-6"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#4B367C] mb-8">
            {lugarDemo.pasos[pasoActual]}
          </h1>

          <div className="flex justify-center gap-4">
            <button
              onClick={anteriorPaso}
              disabled={pasoActual === 0}
              className="px-6 py-3 rounded-full bg-[#E8DDFF] text-[#4B367C] font-bold disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              onClick={siguientePaso}
              disabled={pasoActual === lugarDemo.pasos.length - 1}
              className="px-6 py-3 rounded-full bg-[#9B7BE8] text-white font-bold disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>

          <button
            onClick={() => setModoPreparacion(false)}
            className="mt-6 text-[#6B5A95] font-semibold"
          >
            Volver al lugar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-6xl mx-auto">
        <Link
          to="/lugares"
          className="inline-block mb-6 text-[#4B367C] font-bold bg-white px-5 py-3 rounded-full shadow-sm hover:shadow-md transition"
        >
          ← Volver a lugares
        </Link>
        {lugarDemo.imagen ? (
          <img
            src={lugarDemo.imagen}
            alt={lugarDemo.nombre}
            className="w-full h-72 object-cover rounded-[2.5rem] shadow-md mb-8"
          />
        ) : (
          <div className="w-full h-72 rounded-[2.5rem] bg-[#E8DDFF] flex items-center justify-center text-7xl mb-8">
            {lugarDemo.emoji}
          </div>
        )}
        <div className="bg-white rounded-[2.5rem] shadow-lg p-8 md:p-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#4B367C] mb-4">
            {lugarDemo.nombre}
          </h1>

          <p className="text-xl text-[#6B5A95] mb-8">{lugarDemo.descripcion}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <InfoCard
              icono="📍"
              titulo="Dirección"
              texto={lugarDemo.direccion}
            />
            <InfoCard
              icono="✅"
              titulo="Qué haremos"
              texto={lugarDemo.actividad}
            />
            <InfoCard
              icono="👥"
              titulo="Quién estará"
              texto={lugarDemo.personas}
            />
            <InfoCard
              icono="🚗"
              titulo="Cómo iremos"
              texto={lugarDemo.transporte}
            />
            <InfoCard icono="⏱️" titulo="Duración" texto={lugarDemo.duracion} />
            <InfoCard
              icono="💡"
              titulo="Recordatorio"
              texto={lugarDemo.consejos}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#F3ECFF] rounded-[2rem] p-6">
            <div>
              <h2 className="text-2xl font-bold text-[#4B367C] mb-2">
                Prepararme para ir
              </h2>

              <p className="text-[#6B5A95]">
                Félix te mostrará paso a paso lo que puede ocurrir.
              </p>
            </div>

            <button
              onClick={() => setModoPreparacion(true)}
              className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold px-8 py-4 rounded-full transition"
            >
              Empezar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

const InfoCard = ({ icono, titulo, texto }) => {
  return (
    <div className="bg-[#FDFBFF] border-2 border-[#E4D8FF] rounded-[2rem] p-5">
      <div className="text-4xl mb-3">{icono}</div>
      <h3 className="text-xl font-bold text-[#4B367C] mb-2">{titulo}</h3>
      <p className="text-[#6B5A95] text-lg">{texto}</p>
    </div>
  );
};

export default LugarDetalle;
