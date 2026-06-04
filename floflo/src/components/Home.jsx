import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useFloFlo } from "../context/FloFloContext";
import felix from "../assets/svg/felix_feliz.svg";

const Home = () => {
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
  ];
  const { mood } = useFloFlo();

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-7xl mx-auto">
        <p className="text-[#6B5A95]">
          Estado actual: {mood || "Sin seleccionar"}
        </p>
        {/* HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-14">
          <div className="text-center lg:text-left">
            <p className="text-[#8B6FD6] font-bold text-lg mb-3">
              Bienvenido a FloFlo
            </p>

            <h1 className="text-5xl md:text-7xl font-extrabold text-[#4B367C] leading-tight mb-6">
              ¡Hola! Soy Félix 👋
            </h1>

            <p className="text-xl md:text-2xl text-[#6B5A95] leading-relaxed mb-8 max-w-2xl">
              Estoy aquí para acompañarte a reconocer emociones, practicar
              conversaciones y seguir rutinas con calma.
            </p>

            <Link
              to="/emociones"
              className="inline-block bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white text-xl font-bold px-8 py-4 rounded-full transition"
            >
              Comenzar
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
                Podemos ir paso a paso. No hay prisa.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
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

        {/* ACTIVIDAD RECOMENDADA */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[#9B7BE8] font-bold mb-2">
              Actividad recomendada del día
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold text-[#4B367C] mb-3">
              Practicar cómo pedir ayuda
            </h2>

            <p className="text-[#6B5A95] text-lg max-w-2xl">
              Félix puede ayudarte a practicar una conversación corta para pedir
              apoyo cuando algo sea difícil.
            </p>
          </div>

          <Link
            to="/conversaciones"
            className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold px-8 py-4 rounded-full transition whitespace-nowrap"
          >
            Ir a practicar
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
